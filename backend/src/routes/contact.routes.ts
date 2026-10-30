import { Router } from "express";
import { contactPayloadSchema } from "../schemas/contact.schema";
import { evaluateAntiSpam } from "../services/antiSpam.service";
import {
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

    // Step 1: Anti-Spam Honeypot & Velocity Gate (PRD FR-API-02 & FR-API-03)
    const spamVerdict = evaluateAntiSpam({
      botField: parsed.data.botField,
      websiteUrl: parsed.data.websiteUrl,
      formLoadedAt: parsed.data.formLoadedAt,
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

    // Step 3: Persist & Deliver Inquiry (PRD FR-API-05)
    const stored = await processAndDeliverInquiry(parsed.data);

    res.status(200).json({
      success: true,
      inquiryId: stored.id,
      message:
        "Your inquiry has been received. Thank you for contacting Axiom Studio.",
      receivedAt: stored.receivedAt,
      deliveryChannels: stored.deliveryChannels,
    });
  } catch (err) {
    console.error("[BACKEND CONTACT ERROR]", err instanceof Error ? err.message : "Unknown failure");
    res.status(503).json({
      success: false,
      error: "We could not safely receive your inquiry. Please try again or email contact@axiomstudio.agency.",
    });
  }
});

contactRouter.get("/contact/status", (_req, res) => {
  res.status(200).json({ operational: true });
});
