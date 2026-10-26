import { Router } from "express";
import {
  emotionAnalyzeSchema,
  intentOutreachSchema,
  vectorSearchSchema,
} from "../schemas/labs.schema";
import {
  analyzeEmotionText,
  executeVectorSearch,
  generateLiveThreatTelemetry,
  synthesizeIntentOutreach,
} from "../services/labs.service";
import { createRateLimiter } from "../middleware/rateLimiter";

export const labsRouter = Router();

const labsLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  keyPrefix: "labs_api",
});

labsRouter.use(labsLimiter);

labsRouter.post("/emotion-analyze", (req, res) => {
  const parsed = emotionAnalyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid text payload.",
    });
    return;
  }

  const analysis = analyzeEmotionText(parsed.data.text);
  res.status(200).json(analysis);
});

labsRouter.post("/vector-search", (req, res) => {
  const parsed = vectorSearchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid search payload.",
    });
    return;
  }

  const results = executeVectorSearch(parsed.data.query, parsed.data.category);
  res.status(200).json(results);
});

labsRouter.post("/intent-outreach", (req, res) => {
  const parsed = intentOutreachSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid outreach parameters.",
    });
    return;
  }

  const draft = synthesizeIntentOutreach(parsed.data);
  res.status(200).json(draft);
});

labsRouter.get("/threat-telemetry", (_req, res) => {
  res.status(200).json(generateLiveThreatTelemetry());
});
