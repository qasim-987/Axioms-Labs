import { z } from "zod";

/**
 * Closed sets taken from the values the three live forms actually submit, plus each field's
 * schema default (the default must stay valid, otherwise omitting the field would now 400).
 *
 * Keep in sync with the frontend source of truth:
 *   - service  -> src/data/services.ts `servicesData[].title`
 *                 and src/components/ContactSection.tsx `projectScopes`
 *   - budget   -> src/config/pricing.ts `pricing.budgetBands`
 * Both are flagged `TODO(owner): confirm` in the frontend, so if the owner edits them this
 * enum must change in the same commit or the live form starts returning 400.
 */
const SERVICE_VALUES = [
  "Web Development",
  "Web Designing",
  "UI/UX Design",
  "AI Agents",
  "General Scoping",
] as const;

const BUDGET_VALUES = [
  "Under $500",
  "$500 - $1,500",
  "$1,500 - $3,500",
  "$3,500 - $7,500",
  "$7,500+",
  "Not sure yet, let's talk",
  "Unspecified",
] as const;

/**
 * `source` is an allowlist of shapes rather than a flat enum, because one of the three forms
 * builds it dynamically as `service_pillar:${service.slug}`. A literal enum would silently
 * break that page's form the day a fifth service is added. This still rejects arbitrary
 * attacker-controlled content while matching the real values:
 *   home_contact_section | dedicated_contact_page | website | service_pillar:<slug>
 */
const SOURCE_PATTERN =
  /^(?:home_contact_section|dedicated_contact_page|website|service_pillar:[a-z0-9-]+)$/;

export const contactPayloadSchema = z
  .object({
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
    service: z
      .enum(SERVICE_VALUES, {
        errorMap: () => ({ message: "Please select one of the listed services." }),
      })
      .optional()
      .default("General Scoping"),
    budget: z
      .enum(BUDGET_VALUES, {
        errorMap: () => ({ message: "Please select one of the listed budget ranges." }),
      })
      .optional()
      .default("Unspecified"),
    message: z
      .string({ required_error: "Project requirements message is required." })
      .trim()
      .min(10, "Please provide at least 10 characters describing your project.")
      .max(5000, "Message must be 5,000 characters or fewer."),
    source: z
      .string()
      .trim()
      .max(120, "Submission source must be 120 characters or fewer.")
      .regex(SOURCE_PATTERN, "Please provide a valid submission source.")
      .optional()
      .default("website"),
    botField: z.string().optional().default(""),
    websiteUrl: z.string().optional().default(""), // Secondary honeypot
    formLoadedAt: z.union([z.number(), z.string()]).optional(),
    phone: z.string().trim().max(40).optional().default(""),
    countryCode: z.string().trim().max(10).optional().default(""),
  })
  /**
   * Reject unknown keys. Verified safe: none of the three live forms (nor the orphaned
   * src/components/landing/ContactForm.tsx, which no route imports) sends a key outside this
   * schema, so this cannot break a working submission.
   */
  .strict();

export type ContactPayload = z.infer<typeof contactPayloadSchema>;
