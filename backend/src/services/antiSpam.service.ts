export interface AntiSpamVerdict {
  trapped: boolean;
  reason?: "honeypot_primary" | "honeypot_secondary" | "velocity_under_1000ms";
}

export function evaluateAntiSpam(params: {
  botField?: string;
  websiteUrl?: string;
  formLoadedAt?: number | string;
}): AntiSpamVerdict {
  if (params.botField && params.botField.trim().length > 0) {
    return { trapped: true, reason: "honeypot_primary" };
  }

  if (params.websiteUrl && params.websiteUrl.trim().length > 0) {
    return { trapped: true, reason: "honeypot_secondary" };
  }

  if (params.formLoadedAt !== undefined && params.formLoadedAt !== "") {
    const loadedTs = Number(params.formLoadedAt);
    if (!Number.isNaN(loadedTs) && loadedTs > 0) {
      const elapsedMs = Date.now() - loadedTs;
      if (elapsedMs >= 0 && elapsedMs < 1000) {
        return { trapped: true, reason: "velocity_under_1000ms" };
      }
    }
  }

  return { trapped: false };
}

/**
 * Strip markup and every carriage return, then normalise line endings to `\n`.
 *
 * Used for the free-text `message`, which is legitimately multi-paragraph: collapsing its
 * line breaks would mangle the brief in the owner's inbox. No `\r` survives, so CR/LF cannot
 * be used to forge a line in anything downstream. Newlines here are not an SMTP header
 * injection vector anyway — delivery.service sends `text:` through Resend's HTTPS JSON API,
 * where headers are separate fields, not part of the body.
 */
export function sanitizePlainText(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

/**
 * Single-line variant for fields that are interpolated into the email subject line and into
 * one-line ledger/webhook/CRM fields (name, company, service, budget, source). These have no
 * legitimate reason to contain a line break, and a newline in the subject is the actual
 * spoofing exposure, so all whitespace runs including `\n` collapse to a single space.
 */
export function sanitizeSingleLine(input: string): string {
  return sanitizePlainText(input).replace(/\s+/g, " ").trim();
}
