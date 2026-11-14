# Assistant provider migration: Gemini → Groq

Date: 2026-11-14 · Branch: `arena/f7304f75-axioms-labs` · Status: pending review

## Why

The portfolio assistant launched on Google Gemini's free tier. Two hardening
passes (PR #47, PR #48) added typed failure kinds, a 45s per-attempt abort
budget, model failover and regression tests, yet the first production smoke
test still returned `503 {"code":"upstream"}` and the exact Gemini rejection
was never captured in runtime logs before the owner decided to switch
providers. Groq was chosen by the owner for its fast inference and stable
free tier.

## What changed

- `backend/src/services/assistant.service.ts` now speaks the OpenAI-compatible
  Groq API: `POST {GROQ_BASE_URL}/v1/chat/completions` with
  `Authorization: Bearer <GROQ_API_KEY>`, `messages[]` (system + transcript),
  `max_tokens: 1024`, `temperature: 0.7`; reply read from
  `choices[0].message.content`.
- Model chain (all confirmed free tier, Oct 2026): `llama-3.3-70b-versatile`
  → `llama-3.1-8b-instant` → `openai/gpt-oss-20b`. A 404 (catalog change) or
  429 (per-model rate limit) advances the chain; if every candidate is rate
  limited the failure kind is `quota`.
- 401/403 now fail fast as kind `config` ("Groq API key rejected") because a
  bad key fails every model — no point walking the chain.
- Preserved from the Gemini era: channel-neutral `getAssistantReply`,
  typed `AssistantUnavailableError` kinds, 45s per-attempt AbortController,
  single-turn retry after a multi-turn timeout, `ASSISTANT_CHAT_FAILED`
  reason logging (never the key), rate limit 12/min, grounding facts and
  honesty-policy system prompt, `vercel.json` `maxDuration: 60`.
- Env: `GROQ_API_KEY` (sensitive, production), optional `GROQ_MODEL`
  override, optional `GROQ_BASE_URL` (used by the local stub in regression
  runs). Legacy `GEMINI_*` Vercel variables were left in place, unused.
- `backend/test/assistant.cjs`: five regression tests against the Groq
  contract (request shape + grounding, timeout classification + log reason
  "Groq request timed out after 45 seconds", transport code retention,
  quota classification, 404 failover).

## Rollout

1. Merge PR → Vercel redeploys backend (key already in production env).
2. Owner triggers the `Assistant Smoke Test` workflow (manual dispatch).
3. Any future failure now reports its typed `code` and the provider's own
   message in `ASSISTANT_CHAT_FAILED`, so diagnosis needs one runtime-log
   line, not a guess.
