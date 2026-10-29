"use client";

import React, { useCallback, useRef, useState } from "react";
import { z } from "zod";
import { submitContactInquiry } from "@/lib/apiClient";
import { COUNTRY_CODES, BUDGET_OPTIONS } from "@/data/brand";
import { BRAND } from "@/lib/landingConfig";

const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(80, "First name must be 80 characters or fewer."),
  lastName: z.string().max(80, "Last name must be 80 characters or fewer.").optional(),
  email: z.string().email("Please provide a valid email address.").max(160),
  countryCode: z.string().min(1, "Select a country code."),
  phone: z.string().min(1, "Phone number is required."),
  service: z.string().min(1, "Select a service you are interested in."),
  budget: z.string().min(1, "Select a project budget."),
  message: z
    .string()
    .min(10, "Please describe your project in 10+ characters.")
    .max(5000, "Message must be 5,000 characters or fewer."),
  // Honeypot: must remain empty. Any value aborts submission silently.
  botField: z.string().max(0),
  websiteUrl: z.string().optional(),
  formLoadedAt: z.number(),
});

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
}

const INITIAL: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: COUNTRY_CODES[0],
  phone: "",
  service: "",
  budget: "",
  message: "",
};

interface ContactFormProps {
  serviceSlug?: string;
}

export default function ContactForm({ serviceSlug }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FormValues>({
    ...INITIAL,
    service: serviceSlug ? serviceSlug : "general-scoping",
  });
  const formLoadedAt = useRef(Date.now());
  const botFieldRef = useRef<HTMLInputElement>(null);

  const field = (key: keyof FormValues) => fields[key];

  const handleChange =
    (key: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setError(null);
      setFields((prev) => ({ ...prev, [key]: e.currentTarget.value }));
    };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Honeypot trap: any value in the hidden field aborts silently.
      if (botFieldRef.current?.value) {
        setStatus("success");
        return;
      }

      // Velocity gate: submissions faster than 1s after load look automated.
      if (Date.now() - formLoadedAt.current < 1000) {
        setError("Please slow down before submitting.");
        return;
      }

      const parsed = contactSchema.safeParse({
        ...fields,
        botField: "",
        websiteUrl: "",
        formLoadedAt: formLoadedAt.current,
      });

      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ||
            "Please check the highlighted fields and try again."
        );
        return;
      }

      setStatus("submitting");
      try {
        const res = await submitContactInquiry({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName || undefined,
          email: parsed.data.email,
          phone: `${parsed.data.countryCode} ${parsed.data.phone}`,
          service: parsed.data.service,
          budget: parsed.data.budget,
          message: parsed.data.message,
          source: "website",
          botField: "",
          websiteUrl: "",
          formLoadedAt: formLoadedAt.current,
        });

        if (res.ok) {
          setStatus("success");
          setFields(INITIAL);
        } else {
          setError(res.data?.error || "Submission failed. Please try again.");
          setStatus("error");
        }
      } catch {
        setError("Network error. Please try again later.");
        setStatus("error");
      } finally {
        setStatus("idle");
      }
    },
    [fields]
  );

  const serviceOptions = [
    { label: "Digital Product Design", value: "digital-design" },
    { label: "Web Development", value: "web-development" },
    { label: "UI/UX Design", value: "ui-ux-design" },
    { label: "AI Automation", value: "ai-automation" },
  ];

  if (status === "success") {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md p-10 sm:p-14 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Thank you.
        </h3>
        <p className="text-white/60 leading-relaxed max-w-md mx-auto">
          Your inquiry has been logged. We will get back to you within 24
          hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="botField"
        ref={botFieldRef}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      />
      <input type="hidden" name="websiteUrl" />
      <input type="hidden" name="formLoadedAt" value={String(formLoadedAt.current)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-white/50">
            First name
          </label>
          <input
            name="firstName"
            value={field("firstName")}
            onChange={handleChange("firstName")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
            placeholder="First name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-white/50">
            Last name
          </label>
          <input
            name="lastName"
            value={field("lastName")}
            onChange={handleChange("lastName")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-widest text-white/50">
          Email address
        </label>
        <input
          name="email"
          type="email"
          value={field("email")}
          onChange={handleChange("email")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="you@domain.com"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex gap-3">
          <select
            name="countryCode"
            value={field("countryCode")}
            onChange={handleChange("countryCode")}
            className="flex-shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/30"
          >
            {COUNTRY_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <input
            name="phone"
            value={field("phone")}
            onChange={handleChange("phone")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
            placeholder="Phone number"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-widest text-white/50">
          Service interested in
        </label>
        <select
          name="service"
          value={field("service")}
          onChange={handleChange("service")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          required
        >
          <option value="">Select a service</option>
          {serviceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-widest text-white/50">
          Project budget
        </label>
        <select
          name="budget"
          value={field("budget")}
          onChange={handleChange("budget")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          required
        >
          <option value="">Select a budget</option>
          {BUDGET_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-widest text-white/50">
          Message
        </label>
        <textarea
          name="message"
          value={field("message")}
          onChange={handleChange("message")}
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="Tell us about your project…"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-400/90">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${BRAND.violet}, ${BRAND.violetDark})`,
          boxShadow: `0 0 40px ${BRAND.ctaGlow}`,
        }}
      >
        {status === "submitting" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
