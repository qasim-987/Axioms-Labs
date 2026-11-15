import { z } from "zod";

/**
 * Project-brief slots the assistant collects conversationally.
 *
 * The draft is deliberately loose: every slot is optional while the chat is
 * still gathering facts, and the widget echoes the last known draft back on
 * every turn. That echo is the memory — details survive even after older
 * messages fall off the 12-message transcript window.
 */
const slot = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").optional());

export const briefDraftSchema = z.object({
  business: slot(200),
  service: slot(200),
  requirements: slot(4000),
  timeline: slot(200),
  budget: slot(200),
  contactName: slot(120),
  email: slot(200),
});

export type BriefDraft = z.infer<typeof briefDraftSchema>;

/**
 * Confirmed submission: the visitor has edited and explicitly confirmed the
 * brief, so every required slot must be present. Budget stays optional by
 * product decision — plenty of visitors genuinely do not have one yet.
 */
/**
 * Conversation context travels with the submission ONLY when the visitor
 * ticked the explicit consent checkbox in the widget; the backend stores it
 * only when this flag is true.
 */
const contextMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(1500),
});

export const projectBriefSubmissionSchema = z.object({
  idempotencyKey: z.string().uuid(),
  includeContext: z.boolean().optional(),
  context: z.array(contextMessageSchema).max(12).optional(),
  business: z.string().trim().min(2).max(200),
  service: z.string().trim().min(2).max(200),
  requirements: z.string().trim().min(10).max(4000),
  timeline: z.string().trim().min(2).max(200),
  budget: z.string().trim().max(200).optional(),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
});

export type ProjectBriefSubmission = z.infer<typeof projectBriefSubmissionSchema>;
