import { Router } from "express";

export const healthRouter = Router();

const bootTime = Date.now();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "operational",
    service: "Axiom Studio Backend Engine",
    version: "2.4.0",
    uptimeSeconds: Math.floor((Date.now() - bootTime) / 1000),
    timestamp: new Date().toISOString(),
    /**
     * No `metrics` block. It disclosed which delivery adapters hold live credentials
     * (configuredAdapters) plus submitted-inquiry volume, to any unauthenticated caller.
     * The frontend only ever reads status/service/version/uptimeSeconds/timestamp.
     */
  });
});
