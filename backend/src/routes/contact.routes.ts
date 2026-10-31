import { Request, Response, Router } from "express";
import { isAllowedOrigin, originFromUrl } from "../config/env";
import { contactPayloadSchema } from "../schemas/contact.schema";
import { evaluateAntiSpam } from "../services/antiSpam.service";
import { processAndDeliverInquiry } from "../services/delivery.service";
import { createRateLimiter } from "../middleware/rateLimiter";

export const contactRouter = Router();

const contactRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 10,
  keyPrefix: "contact_post",
});

function headerValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) || "";
}

/**
 * Origin/Referer allowlist for the only state-changing endpoint.
 *
 * Fails open when neither header is present, which is what keeps the live form working:
 * the frontend POSTs to a *relative* /api/contact that Next.js rewrites server-side, so the
 * request that reaches Express comes from the Next process and may carry no Origin at all.
 * That is safe here because a browser always attaches an Origin to a cross-site POST, so the
 * absence of one means a non-browser client rather than a CSRF attempt.
 */
function requestOriginAllowed(req: Request): boolean {
  const origin = headerValue(req.headers.origin);
  if (origin) {
    // `Origin` is already an origin, but normalise it anyway so a malformed value is
    // rejected rather than compared loosely.
    return isAllowedOrigin(originFromUrl(origin) || origin);
  }

  const referer = headerValue(req.headers.referer);
  if (referer) {
    const refererOrigin = originFromUrl(referer);
    // An unparseable Referer is not evidence of a hostile origin; fall through to allow.
    return refererOrigin ? isAllowedOrigin(refererOrigin) : true;
  }

  return true;
}

function originGuard(req: Request, res: Response, next: () => void): void {
  if (requestOriginAllowed(req)) {
    next();
    return;
  }
  console.warn(
    JSON.stringify({
      event: "ORIGIN_REJECTED",
      origin: headerValue(req.headers.origin) || headerValue(req.headers.referer),
      timestamp: new Date().toISOString(),
    })
  );
  res.status(403).json({ error: "Request origin not permitted." });
}

contactRouter.post("/contact", originGuard, contactRateLimiter, async (req, res) => {
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
    /**
     * Minimal liveness flag only. The previous spread of getInquiryMetrics() published which
     * delivery adapters hold live credentials and how many inquiries had been submitted, to
     * any unauthenticated caller. No file in src/ read those fields.
     */
    operational: true,
  });
});
