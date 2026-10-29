import express from "express";
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

  return app;
}
