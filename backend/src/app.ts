import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { securityHeaders } from "./middleware/securityHeaders";
import { requestLogger } from "./middleware/requestLogger";
import { healthRouter } from "./routes/health.routes";
import { contactRouter } from "./routes/contact.routes";
import { catalogRouter } from "./routes/catalog.routes";
import { labsRouter } from "./routes/labs.routes";

export function createBackendApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Security & CORS Middleware
  app.use(securityHeaders);
  app.use(
    cors({
      origin:
        env.corsAllowedOrigins === "*"
          ? true
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
      version: "2.4.0",
      endpoints: [
        "GET  /api/health",
        "POST /api/contact",
        "GET  /api/contact/status",
        "GET  /api/vendors",
        "GET  /api/vendors/export.csv",
        "POST /api/labs/emotion-analyze",
        "POST /api/labs/vector-search",
        "POST /api/labs/intent-outreach",
        "GET  /api/labs/threat-telemetry",
      ],
    });
  });

  // Mount versioned & canonical API routers
  app.use("/api", healthRouter);
  app.use("/api", contactRouter);
  app.use("/api", catalogRouter);
  app.use("/api/labs", labsRouter);

  // 404 JSON Handler
  app.use((req, res) => {
    res.status(404).json({
      error: `Route ${req.method} ${req.originalUrl} not found on Axiom Studio Backend.`,
    });
  });

  return app;
}
