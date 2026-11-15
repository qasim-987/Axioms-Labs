process.env.GROQ_API_KEY = "assistant-regression-key";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getAssistantReply, AssistantUnavailableError } = require("../dist/services/assistant.service");

const messages = [{ role: "user", content: "What services do you offer?" }];

function stubFetch(contentOrGetter) {
  return async (fetchUrl, options) => {
    const content =
      typeof contentOrGetter === "function" ? contentOrGetter() : contentOrGetter;
    stubFetch.url = String(fetchUrl);
    stubFetch.headers = options.headers;
    stubFetch.request = JSON.parse(options.body);
    return new Response(JSON.stringify({ choices: [{ message: { content } }] }));
  };
}

/**
 * Deterministic fetch mock: direct assignment with an explicit restore hook
 * avoids nested t.mock.method restore ordering surprises across tests.
 */
function mockFetch(t, fn) {
  const real = global.fetch;
  global.fetch = fn;
  t.after(() => {
    global.fetch = real;
  });
}

test("structured output keeps reply and brief in separate validated fields", async (t) => {
  mockFetch(
    t,
    stubFetch(
      JSON.stringify({
        reply: "We offer design, development, and AI agents.",
        brief: { business: "Bluebird Bakery", service: "Web Development" },
      })
    )
  );

  const result = await getAssistantReply(messages);
  assert.equal(result.reply, "We offer design, development, and AI agents.");
  assert.equal(result.brief.business, "Bluebird Bakery");
  assert.equal(result.brief.service, "Web Development");

  assert.equal(stubFetch.url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(stubFetch.headers.Authorization, "Bearer assistant-regression-key");
  assert.equal(stubFetch.request.model, "llama-3.3-70b-versatile");
  assert.equal(stubFetch.request.response_format.type, "json_object");
  assert.equal(stubFetch.request.max_tokens, 1024);
  const system = stubFetch.request.messages[0];
  assert.equal(system.role, "system");
  assert.match(system.content, /ONE valid JSON object/);
  assert.match(system.content, /Web Development/);
  assert.match(system.content, /kuopiobites\.fi/);
  assert.equal(stubFetch.request.messages[1].content, messages[0].content);
});

test("malformed or truncated JSON never reaches the visitor", async (t) => {
  // One mock, mutable content: chained fetch mocks would leak across tests.
  let content = '{"reply": "Happy to help with a restaurant website.", "brief": {"business":"Bluebird';
  mockFetch(t, stubFetch(() => content));

  // Truncated object: the reply string is salvaged, the draft is preserved.
  const kept = { business: "Kept Co" };
  const result = await getAssistantReply(messages, kept);
  assert.equal(result.reply, "Happy to help with a restaurant website.");
  assert.equal(result.brief.business, "Kept Co");
  assert.doesNotMatch(result.reply, /```|"brief"|\{/);

  // Stray fence around a valid object: parsed, fence removed.
  content = 'Sure!\n```json\n{"reply":"Hi there.","brief":{"service":"AI Agents"}}\n```';
  const fenced = await getAssistantReply(messages);
  assert.equal(fenced.reply, "Hi there.");
  assert.equal(fenced.brief.service, "AI Agents");
  assert.doesNotMatch(fenced.reply, /```/);
});

test("brief draft merges across turns so memory survives truncation", async (t) => {
  mockFetch(
    t,
    stubFetch(JSON.stringify({ reply: "Noted.", brief: { service: "Web Development", timeline: "before December" } }))
  );
  const result = await getAssistantReply(messages, { business: "Old Co", contactName: "Aisha" });
  assert.equal(result.brief.business, "Old Co");
  assert.equal(result.brief.contactName, "Aisha");
  assert.equal(result.brief.service, "Web Development");
  assert.equal(result.brief.timeline, "before December");
});

test("aborted provider requests produce a timeout response and actionable runtime log", async (t) => {
  const originalTimeout = global.setTimeout;
  const originalFetch = global.fetch;
  const errors = t.mock.method(console, "error", () => {});
  t.mock.method(global, "setTimeout", (callback, delay, ...args) =>
    originalTimeout(callback, delay === 45000 ? 1 : delay, ...args)
  );
  mockFetch(t, (url, options) => {
    if (String(url).startsWith("https://api.groq.com/")) {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        }, { once: true });
      });
    }
    return originalFetch(url, options);
  });

  const { createBackendApp } = require("../dist/app");
  const server = createBackendApp().listen(0, "127.0.0.1");
  t.after(() => { server.close(); server.closeAllConnections(); });
  await new Promise(resolve => server.on("listening", resolve));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.code, "timeout");
  assert.match(body.error, /took too long/);
  const event = JSON.parse(errors.mock.calls[0].arguments[0]);
  assert.equal(event.event, "ASSISTANT_CHAT_FAILED");
  assert.equal(event.reason, "Groq request timed out after 45 seconds");
  assert.doesNotMatch(JSON.stringify(body) + JSON.stringify(event), /assistant-regression-key/);
});

test("network failures retain their transport code", async (t) => {
  mockFetch(t, async () => {
    throw new TypeError("fetch failed", { cause: { code: "ENOTFOUND" } });
  });
  await assert.rejects(getAssistantReply(messages), (error) => {
    assert.ok(error instanceof AssistantUnavailableError);
    assert.equal(error.kind, "upstream");
    assert.match(error.message, /ENOTFOUND/);
    return true;
  });
});

test("provider quota failures keep their existing classification", async (t) => {
  mockFetch(t, async () => new Response("{}", { status: 429 }));
  await assert.rejects(getAssistantReply(messages), (error) => {
    assert.equal(error.kind, "quota");
    return true;
  });
});

test("a retired model 404s into the next free-tier candidate", async (t) => {
  const seenModels = [];
  mockFetch(t, async (_url, options) => {
    const request = JSON.parse(options.body);
    seenModels.push(request.model);
    if (request.model === "llama-3.3-70b-versatile") {
      return new Response(JSON.stringify({ error: { message: "model not found" } }), { status: 404 });
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ reply: "Answered by the fallback model.", brief: {} }) } }],
    }));
  });

  const failover = await getAssistantReply(messages);
  assert.equal(failover.reply, "Answered by the fallback model.");
  assert.deepEqual(seenModels, ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]);
});
