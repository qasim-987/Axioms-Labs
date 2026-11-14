# Assistant timeout correction

The production request in the owner-provided log began at 16:58:02 UTC and failed at 16:58:22 UTC. This matches the assistant's 20-second abort timer. The route reported an unclassified exception as `unexpected error`, hiding timeout and transport failures.

The assistant now requests LOW thinking for Gemini 3 and 4 models, retains the 2048-token output budget, and allows 45 seconds for the full request. Older configured models keep their existing generation settings. Aborted requests produce a typed `timeout` response and an actionable runtime reason. Other network exceptions retain their transport error code without logging request contents or credentials.

Four regression tests cover request settings, the real HTTP route's response to an aborted provider request, network-error diagnostics, and existing quota handling. The backend CI job runs these alongside the entrypoint and email regression tests.

Local backend build, all 12 backend tests, frontend and backend type checks, brand checks, and lint passed. The five existing lint warnings in the unwired landing components remain accepted by AGENTS.md. Production verification follows deployment and requires a successful real Gemini reply.
