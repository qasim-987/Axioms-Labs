process.env.GEMINI_API_KEY = "assistant-regression-key";
process.env.GEMINI_MODEL = "gemini-3.8-flash";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getAssistantReply, AssistantUnavailableError } = require("../dist/services/assistant.service");

const messages = [{ role: "user", content: "What services do you offer?" }];

test("website chat requests low thinking while retaining the output budget", async (t) => {
  let request;
  t.mock.method(global, "fetch", async (_url, options) => {
    request = JSON.parse(options.body);
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: "We offer design, development, and AI agents." }] } }],
    }));
  });

  assert.equal(await getAssistantReply(messages), "We offer design, development, and AI agents.");
  assert.equal(request.generationConfig.thinkingConfig.thinkingLevel, "LOW");
  assert.equal(request.generationConfig.maxOutputTokens, 2048);
  assert.equal(request.contents[0].parts[0].text, messages[0].content);
});

test("aborted provider requests produce a timeout response and actionable runtime log", async (t) => {
  const originalTimeout = global.setTimeout;
  const originalFetch = global.fetch;
  const errors = t.mock.method(console, "error", () => {});
  t.mock.method(global, "setTimeout", (callback, delay, ...args) =>
    originalTimeout(callback, delay === 45000 ? 1 : delay, ...args)
  );
  t.mock.method(global, "fetch", (url, options) => {
    if (String(url).startsWith("https://generativelanguage.googleapis.com/")) {
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
  assert.equal(event.reason, "Gemini request timed out after 45 seconds");
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
