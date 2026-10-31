import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { env, isAllowedOrigin } from "./config/env";
import { securityHeaders } from "./middleware/securityHeaders";
import { requestLogger } from "./middleware/requestLogger";
import { healthRouter } from "./routes/health.routes";
import { contactRouter } from "./routes/contact.routes";
import { catalogRouter } from "./routes/catalog.routes";
import { STUDIO_LOCATIONS } from "./services/catalog.service";

export function createBackendApp() {
  const app = express();

  app.disable("x-powered-by");
  /**
   * Hop count, not a blanket `true`. Express then resolves `req.ip` by skipping this many
   * trusted proxies from the right of X-Forwarded-For, so a client-supplied leftmost entry
   * can no longer impersonate an arbitrary IP. Defaults to 1 to preserve prior behaviour.
   */
  app.set("trust proxy", env.trustProxyHops);

  // Security & CORS Middleware
  app.use(securityHeaders);
  app.use(
    cors({
      /**
       * Allowlist instead of reflecting any Origin. `callback(null, false)` simply omits
       * the Access-Control-Allow-Origin header rather than throwing, so a rejected
       * cross-origin caller gets a normal browser CORS block instead of a 500.
       */
      origin(origin, callback) {
        // No Origin header: same-origin navigation or a non-browser client (the Next.js
        // rewrite proxy, curl). Browsers always attach an Origin to a cross-site POST.
        if (!origin) {
          callback(null, true);
          return;
        }
        callback(null, isAllowedOrigin(origin) ? origin : false);
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Strict JSON body limit to mitigate payload DoS
  app.use(express.json({ limit: "32kb" }));
  app.use(requestLogger);

  // Root status welcome
  app.get("/", (_req, res) => {
    res.status(200).json({
      service: "Axiom Studio Standalone API Server",
      version: "2.5.0",
      studios: STUDIO_LOCATIONS.map((l) => `${l.city}, ${l.country}`),
      capabilities: [
        "Web Development",
        "Web Designing",
        "UI/UX Design",
        "AI Agents",
      ],
      endpoints: [
        "GET  /api/health",
        "GET  /api/services",
        "POST /api/contact",
        "GET  /api/contact/status",
      ],
    });
  });

  // Mount canonical API routers
  app.use("/api", healthRouter);
  app.use("/api", contactRouter);
  app.use("/api", catalogRouter);

  // 404 JSON Handler
  app.use((_req: Request, res: Response) => {
    /**
     * Does not echo the request back. Reflecting `req.originalUrl` let an unauthenticated
     * caller place arbitrary text (including markup) into a response body, which becomes an
     * injection vector the moment this API is ever rendered in a browser context.
     */
    res.status(404).json({
      error: "Route not found on Axiom Studio Backend.",
    });
  });

  /**
   * Terminal error handler. Without it, Express's default handler answers with an HTML page
   * containing the full stack trace and absolute server paths whenever NODE_ENV is not
   * "production" — which is what a malformed JSON body triggered. Registered last, and it
   * must keep all four parameters or Express will not treat it as an error handler.
   */
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const detail = err as { status?: number; statusCode?: number; type?: string; message?: string };
    const rawStatus = detail?.status ?? detail?.statusCode;

    const isParseFailure = rawStatus === 400 || detail?.type === "entity.parse.failed";
    const isPayloadTooLarge = rawStatus === 413 || detail?.type === "entity.too.large";

    const status = isParseFailure ? 400 : isPayloadTooLarge ? 413 : 500;
    const message = isParseFailure
      ? "Invalid JSON body."
      : isPayloadTooLarge
        ? "Request body too large."
        : "Internal server error.";

    // Full detail goes to server-side logs only; the client gets a generic message.
    console.error(`[BACKEND ERROR] ${status} ${detail?.message || "unknown error"}`, err);

    if (res.headersSent) {
      return;
    }
    res.status(status).json({ error: message });
  });

  return app;
}
