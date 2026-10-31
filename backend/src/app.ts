import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import { env } from "./config/env";
import { securityHeaders } from "./middleware/securityHeaders";
import { requestLogger } from "./middleware/requestLogger";
import { healthRouter } from "./routes/health.routes";
import { contactRouter } from "./routes/contact.routes";
import { catalogRouter } from "./routes/catalog.routes";
import { STUDIO_LOCATIONS } from "./services/catalog.service";

export function createBackendApp() {
  const app = express();

  app.disable("x-powered-by");
  // Trust only explicitly configured proxy IPs/CIDRs, never arbitrary headers.
  app.set("trust proxy", env.trustProxy ? env.trustProxy.split(",").map((s) => s.trim()) : false);

  // Security & CORS Middleware
  app.use(securityHeaders);
  app.use(
    cors({
      origin:
        env.corsAllowedOrigins === "*"
          ? env.nodeEnv !== "production"
          : env.corsAllowedOrigins.split(",").map((s) => s.trim()),
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
  app.use((req, res) => {
    res.status(404).json({
      error: `Route ${req.method} ${req.originalUrl} not found on Axiom Studio Backend.`,
    });
  });

  const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;
    res.status(status === 413 ? 413 : status === 400 ? 400 : 500).json({
      success: false,
      error: status === 413 ? "Request body is too large." : status === 400 ? "Invalid JSON request." : "Internal server error.",
    });
  };
  app.use(handleError);

  return app;
}
