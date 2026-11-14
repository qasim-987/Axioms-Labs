import { z } from "zod";
import { briefDraftSchema } from "./brief.schema";

/**
 * Chat payload for the portfolio assistant widget.
 *
 * The widget is stateless: it echoes back the visible transcript so the server can
 * rebuild context on every turn. Caps keep a hostile client from inflating the
 * prompt (and therefore the Groq free-tier token spend) arbitrarily.
 *
 * `brief` is the structured project-brief draft collected so far. The widget
 * stores it and re-sends it every turn, so brief facts survive even after older
 * messages fall off the transcript window.
 */
const MAX_MESSAGE_CHARS = 1500;
const MAX_MESSAGES = 12;

export const assistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
});

export const assistantChatSchema = z.object({
  messages: z.array(assistantMessageSchema).min(1).max(MAX_MESSAGES),
  brief: briefDraftSchema.optional(),
});

export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
export type AssistantChatPayload = z.infer<typeof assistantChatSchema>;
