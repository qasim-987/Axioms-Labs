process.env.GROQ_API_KEY = "assistant-regression-key";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getAssistantReply, AssistantUnavailableError } = require("../dist/services/assistant.service");

const messages = [{ role: "user", content: "What services do you offer?" }];

test("website chat sends the grounded system turn and a bounded completion request", async (t) => {
  let request;
  let url;
  let headers;
  t.mock.method(global, "fetch", async (fetchUrl, options) => {
    url = String(fetchUrl);
    headers = options.headers;
    request = JSON.parse(options.body);
    return new Response(JSON.stringify({
      choices: [{ message: { content: "We offer design, development, and AI agents.\n```json\n{\"business\":\"Bluebird Bakery\",\"service\":\"website\",\"requirements\":\"\",\"timeline\":\"\",\"budget\":\"\",\"contactName\":\"\",\"email\":\"\"}\n```" } }],
    }));
  });

  const result = await getAssistantReply(messages);
  assert.equal(result.reply, "We offer design, development, and AI agents.");
  assert.equal(result.brief.business, "Bluebird Bakery");
  assert.equal(result.brief.service, "website");
  assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(headers.Authorization, "Bearer assistant-regression-key");
  assert.equal(request.model, "llama-3.3-70b-versatile");
  assert.equal(request.max_tokens, 1024);
  assert.equal(request.messages[0].role, "system");
  assert.match(request.messages[0].content, /Axioms Lab portfolio assistant/);
  assert.match(request.messages[0].content, /kuopiobites\.fi/);
  assert.equal(request.messages[1].role, "user");
  assert.equal(request.messages[1].content, messages[0].content);
});

test("aborted provider requests produce a timeout response and actionable runtime log", async (t) => {
  const originalTimeout = global.setTimeout;
  const originalFetch = global.fetch;
  const errors = t.mock.method(console, "error", () => {});
  t.mock.method(global, "setTimeout", (callback, delay, ...args) =>
    originalTimeout(callback, delay === 45000 ? 1 : delay, ...args)
  );
  t.mock.method(global, "fetch", (url, options) => {
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
  t.mock.method(global, "fetch", async () => {
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
  t.mock.method(global, "fetch", async () => new Response("{}", { status: 429 }));
  await assert.rejects(getAssistantReply(messages), (error) => {
    assert.equal(error.kind, "quota");
    return true;
  });
});

test("a retired model 404s into the next free-tier candidate", async (t) => {
  const seenModels = [];
  t.mock.method(global, "fetch", async (_url, options) => {
    const request = JSON.parse(options.body);
    seenModels.push(request.model);
    if (request.model === "llama-3.3-70b-versatile") {
      return new Response(JSON.stringify({ error: { message: "model not found" } }), { status: 404 });
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: "Answered by the fallback model." } }],
    }));
  });

  const failover = await getAssistantReply(messages);
  assert.equal(failover.reply, "Answered by the fallback model.");
  assert.deepEqual(seenModels, ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]);
});
