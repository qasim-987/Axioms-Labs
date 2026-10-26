import { Router } from "express";
import { contactPayloadSchema } from "../schemas/contact.schema";
import { evaluateAntiSpam } from "../services/antiSpam.service";
import {
  getInquiryMetrics,
  processAndDeliverInquiry,
} from "../services/delivery.service";
import { createRateLimiter } from "../middleware/rateLimiter";

export const contactRouter = Router();

const contactRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 10,
  keyPrefix: "contact_post",
});

contactRouter.post("/contact", contactRateLimiter, async (req, res) => {
  try {
    const rawBody = req.body || {};

    // Step 1: Anti-Spam Honeypot & Velocity Gate (PRD FR-API-02 & FR-API-03)
    const spamVerdict = evaluateAntiSpam({
      botField: rawBody.botField,
      websiteUrl: rawBody.websiteUrl,
      formLoadedAt: rawBody.formLoadedAt,
    });

    if (spamVerdict.trapped) {
      console.warn(
        JSON.stringify({
          event: "ANTI_SPAM_TRAP_TRIGGERED",
          reason: spamVerdict.reason,
          timestamp: new Date().toISOString(),
        })
      );
      // Silent 200 trap so automated scrapers do not adapt
      res.status(200).json({
        success: true,
        message: "Inquiry processed.",
        receivedAt: new Date().toISOString(),
      });
      return;
    }

    // Step 2: Strict Zod Payload Validation (PRD FR-API-04)
    const parsed = contactPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      res.status(400).json({
        error:
          firstIssue?.message ||
          "First name, valid corporate email, and project message are required.",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
      return;
    }

    // Step 3: Persist & Deliver Inquiry (PRD FR-API-05)
    const stored = await processAndDeliverInquiry(parsed.data);

    res.status(200).json({
      success: true,
      inquiryId: stored.id,
      message:
        "Your inquiry has been logged. An Axiom Studio architect will respond within 24 hours.",
      receivedAt: stored.receivedAt,
      deliveryChannels: stored.deliveryChannels,
    });
  } catch (err) {
    console.error("[BACKEND CONTACT ERROR]", err);
    res.status(500).json({
      error: "Internal server error processing contact request.",
    });
  }
});

contactRouter.get("/contact/status", (_req, res) => {
  res.status(200).json({
    operational: true,
    ...getInquiryMetrics(),
  });
});
