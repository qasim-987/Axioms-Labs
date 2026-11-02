import { createBackendApp } from "../src/app";

/**
 * Vercel serverless entrypoint for the standalone Express API.
 *
 * This project is deployed with its Vercel root directory set to `backend/`, so
 * Vercel discovers this file as the `/api` function. `backend/vercel.json`
 * rewrites every incoming path to it, which lets Express keep owning its own
 * routing (`app.use("/api", healthRouter)` and friends in `src/app.ts`) instead
 * of requiring one serverless function per route.
 *
 * `createBackendApp()` is called at module scope so a warm instance reuses a
 * single configured app across invocations rather than rebuilding middleware on
 * every request.
 *
 * `src/index.ts` stays the entrypoint for long-lived hosts (Render, Railway, a
 * VPS): it calls `listen()` only when `process.env.VERCEL` is absent, so the two
 * paths never interfere. This file deliberately imports the factory from
 * `src/app` rather than `src/index`, so the serverless bundle carries no
 * `listen()` call at all and does not depend on that guard.
 */
export default createBackendApp();
