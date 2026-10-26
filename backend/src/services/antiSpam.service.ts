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

export function sanitizePlainText(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
}
