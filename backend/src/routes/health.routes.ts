import { Router } from "express";
import { getInquiryMetrics } from "../services/delivery.service";

export const healthRouter = Router();

const bootTime = Date.now();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "operational",
    service: "Axiom Studio Backend Engine",
    version: "2.4.0",
    uptimeSeconds: Math.floor((Date.now() - bootTime) / 1000),
    timestamp: new Date().toISOString(),
    metrics: getInquiryMetrics(),
  });
});
