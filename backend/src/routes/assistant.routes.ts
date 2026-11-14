import { Request, Response, Router } from "express";
import { assistantChatSchema } from "../schemas/assistant.schema";
import {
  AssistantUnavailableError,
  getAssistantReply,
} from "../services/assistant.service";
import { createRateLimiter } from "../middleware/rateLimiter";
import { originGuard } from "./contact.routes";

export const assistantRouter = Router();

/**
 * Chat is conversational, so the window is tighter but slightly more generous than
 * the contact form: 12 turns per minute per client keeps a widget loop (or a script)
 * from burning the Gemini free-tier quota.
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
      const reply = await getAssistantReply(parsed.data.messages);
      res.json({ success: true, reply });
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
          : kind === "timeout"
            ? `The assistant timed out while thinking. Please try again in a moment. ${CONTACT_HINT}`
            : kind === "config"
            ? `The assistant is still being configured. ${CONTACT_HINT}`
            : `The assistant is unavailable right now. ${CONTACT_HINT}`;
      res.status(503).json({ success: false, error: userMessage, code: kind });
    }
  }
);
