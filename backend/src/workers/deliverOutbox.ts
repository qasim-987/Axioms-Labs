import { z } from "zod";
import { env } from "../config/env";
import { outboxRpc } from "../services/outbox.service";

const jobsSchema = z.array(z.object({
  id: z.string().uuid(), lease_token: z.string().uuid(), channel: z.enum(["email", "webhook"]), attempts: z.number(),
  inquiry: z.object({ inquiry_id: z.string(), email: z.string(), client_name: z.string(), service: z.string(), budget: z.string(), message: z.string(), phone: z.string(), company: z.string(), source: z.string() }),
}));

export async function deliverOutbox(): Promise<void> {
  const jobs = jobsSchema.parse(await outboxRpc("claim_inquiry_jobs", {}));
  for (const job of jobs) {
    let accepted = false;
    try {
      const inquiry = job.inquiry;
      const email = job.channel === "email";
      if (email && (!env.resendApiKey || !env.contactFromEmail)) throw new Error("Email configuration missing");
      if (!email && !env.contactWebhookUrl) throw new Error("Webhook configuration missing");
      const response = await fetch(email ? "https://api.resend.com/emails" : env.contactWebhookUrl, {
        method: "POST", signal: AbortSignal.timeout(10_000),
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": job.id,
          ...(email ? { Authorization: `Bearer ${env.resendApiKey}` } : {}),
        },
        body: JSON.stringify(email ? {
          from: env.contactFromEmail, to: [env.contactNotificationEmail], reply_to: inquiry.email,
          subject: `[Axiom Studio] ${inquiry.service} — ${inquiry.client_name}`,
          text: [`Reference: ${inquiry.inquiry_id}`, `Name: ${inquiry.client_name}`, `Email: ${inquiry.email}`, `Phone: ${inquiry.phone}`, `Company: ${inquiry.company}`, `Budget: ${inquiry.budget}`, "", inquiry.message].join("\n"),
        } : { eventId: job.id, ...inquiry }),
      });
      accepted = response.ok;
    } catch {
      // Never log messages, email addresses, secrets or provider response bodies.
      console.error(JSON.stringify({ event: "INQUIRY_NOTIFICATION_ERROR", jobId: job.id, attempt: job.attempts }));
    }
    await outboxRpc("finish_inquiry_job", { p_id: job.id, p_token: job.lease_token, p_success: accepted });
    if (!accepted && job.attempts >= 5) console.error(JSON.stringify({ event: "INQUIRY_NOTIFICATION_EXHAUSTED", jobId: job.id }));
  }
}

if (require.main === module) {
  deliverOutbox().catch(() => {
    console.error(JSON.stringify({ event: "INQUIRY_WORKER_FAILED" }));
    process.exitCode = 1;
  });
}
