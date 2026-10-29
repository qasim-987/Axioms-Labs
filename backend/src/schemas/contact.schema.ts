import { z } from "zod";

export const contactPayloadSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required." })
    .trim()
    .min(1, "First name is required.")
    .max(80, "First name must be 80 characters or fewer."),
  lastName: z
    .string()
    .trim()
    .max(80, "Last name must be 80 characters or fewer.")
    .optional()
    .default(""),
  email: z
    .string({ required_error: "Work email is required." })
    .trim()
    .toLowerCase()
    .email("Please provide a valid corporate email address.")
    .max(160),
  company: z.string().trim().max(120).optional().default(""),
  service: z.string().trim().max(100).optional().default("General Scoping"),
  budget: z.string().trim().max(60).optional().default("Unspecified"),
  message: z
    .string({ required_error: "Project requirements message is required." })
    .trim()
    .min(10, "Please provide at least 10 characters describing your project.")
    .max(5000, "Message must be 5,000 characters or fewer."),
  source: z.string().trim().max(120).optional().default("website"),
  botField: z.string().optional().default(""),
  websiteUrl: z.string().optional().default(""), // Secondary honeypot
  formLoadedAt: z.union([z.number(), z.string()]).optional(),
  phone: z.string().trim().max(40).optional().default(""),
  countryCode: z.string().trim().max(10).optional().default(""),
});

export type ContactPayload = z.infer<typeof contactPayloadSchema>;
