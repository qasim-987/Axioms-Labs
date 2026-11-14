import { Request, Response, Router } from "express";
import { env } from "../config/env";
import { assistantChatSchema } from "../schemas/assistant.schema";
import {
  AssistantUnavailableError,
  getAssistantReply,
} from "../services/assistant.service";
import { projectBriefSubmissionSchema } from "../schemas/brief.schema";
import { submitProjectBrief } from "../services/brief.service";
import { createRateLimiter } from "../middleware/rateLimiter";
import { originGuard } from "./contact.routes";

export const assistantRouter = Router();

/**
 * Chat is conversational, so the window is tighter but slightly more generous than
 * the contact form: 12 turns per minute per client keeps a widget loop (or a script)
 * from burning the Groq free-tier quota.
 */
const assistantRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 12,
  keyPrefix: "assistant_post",
});

assistantRouter.post(
  "/assistant/chat",
  originGuard,
  assistantRateLimiter,
  async (req: Request, res: Response) => {
    const parsed = assistantChatSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: "Please send a short message and try again.",
      });
      return;
    }

    const CONTACT_HINT = "The project brief form at /contact always works.";
    try {
      const { reply, brief } = await getAssistantReply(
        parsed.data.messages,
        parsed.data.brief || {}
      );
      res.json({ success: true, reply, brief });
    } catch (err) {
      const kind = err instanceof AssistantUnavailableError ? err.kind : "upstream";
      // Never log a blind "unexpected error" again: real name+message always.
      const reason =
        err instanceof AssistantUnavailableError
          ? err.message
          : err instanceof Error
            ? `${err.name}: ${err.message}`
            : String(err);
      console.error(
        JSON.stringify({
          event: "ASSISTANT_CHAT_FAILED",
          reason,
          timestamp: new Date().toISOString(),
        })
      );
      const userMessage =
        kind === "quota"
          ? `The assistant has used today's free quota. Please try again a little later. ${CONTACT_HINT}`
            : kind === "config"
            ? `The assistant is still being configured. ${CONTACT_HINT}`
            : kind === "timeout"
              ? `The AI took too long to reply. Please try again. ${CONTACT_HINT}`
              : `The assistant is unavailable right now. ${CONTACT_HINT}`;
      res.status(503).json({ success: false, error: userMessage, code: kind });
    }
  }
);

/**
 * Confirmed project-brief submission from the assistant widget. Idempotent by
 * client-issued UUID: retries and double taps resume the same stored row
 * instead of creating duplicates. Success is reported only after the Postgres
 * row is confirmed AND the notification email was accepted.
 */
const briefRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 6,
  keyPrefix: "assistant_brief_post",
});

assistantRouter.post(
  "/assistant/brief",
  originGuard,
  briefRateLimiter,
  async (req: Request, res: Response) => {
    const parsed = projectBriefSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        code: "invalid_brief",
        error: "Some brief fields need attention. Please review and confirm again.",
      });
      return;
    }
    if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
      // Fail closed: never claim a brief was saved when storage is not wired.
      console.error(JSON.stringify({ event: "BRIEF_STORAGE_UNCONFIGURED" }));
      res.status(503).json({
        success: false,
        code: "storage_unconfigured",
        error: "Brief storage is not configured yet. The form at /contact still works.",
      });
      return;
    }
    try {
      const result = await submitProjectBrief(parsed.data);
      if (result.status === "delivered" || result.status === "already_delivered") {
        res.json({ success: true, status: result.status, inquiryId: result.inquiryId });
        return;
      }
      if (result.status === "stored_not_delivered") {
        res.status(502).json({
          success: false,
          code: "delivery_failed",
          stored: true,
          inquiryId: result.inquiryId,
          error: "Your brief is saved but the team notification failed. Please tap submit again.",
        });
        return;
      }
      res.status(503).json({
        success: false,
        code: "storage_failed",
        error: "We could not save your brief right now. Please try again in a moment.",
      });
    } catch (err) {
      const reason = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error(JSON.stringify({ event: "BRIEF_SUBMIT_FAILED", reason }));
      res.status(500).json({
        success: false,
        code: "unexpected",
        error: "Something went wrong while submitting your brief. Please try again.",
      });
    }
  }
);
