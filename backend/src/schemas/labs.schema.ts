import { z } from "zod";

export const emotionAnalyzeSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Input text is required.")
    .max(4000, "Input text must be 4,000 characters or fewer."),
});

export const vectorSearchSchema = z.object({
  query: z.string().trim().max(300).optional().default(""),
  category: z.string().trim().max(60).optional().default("All"),
});

export const intentOutreachSchema = z.object({
  company: z.string().trim().min(1).max(120),
  industry: z.string().trim().max(80).optional().default("Enterprise Technology"),
  intentScore: z.number().min(0).max(100),
  signals: z.array(z.string().trim().max(200)).min(1).max(10),
});
