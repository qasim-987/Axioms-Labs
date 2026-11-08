/**
 * Legacy Vercel function entrypoint. Reuse the same callable app exported for
 * Express auto-discovery; neither entrypoint opens a listening socket.
 * App initialization errors are left to server-side runtime logs, never echoed
 * to an unauthenticated client.
 */
export { default } from "../src/app";
