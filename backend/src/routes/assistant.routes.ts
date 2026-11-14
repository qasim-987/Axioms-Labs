import { Request, Response, Router } from "express";
import { assistantChatSchema } from "../schemas/assistant.schema";
import {
  AssistantUnavailableError,
  chatWithGemini,
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

    try {
      const reply = await chatWithGemini(parsed.data.messages);
      res.json({ success: true, reply });
    } catch (err) {
      const reason =
        err instanceof AssistantUnavailableError ? err.message : "unexpected error";
      console.error(
        JSON.stringify({
          event: "ASSISTANT_CHAT_FAILED",
          reason,
          timestamp: new Date().toISOString(),
        })
      );
      res.status(503).json({
        success: false,
        error:
          "The assistant is unavailable right now. The project brief form at /contact always works.",
      });
    }
  }
);
