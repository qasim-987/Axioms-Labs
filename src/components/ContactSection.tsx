"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SplitTextReveal from "./SplitTextReveal";
import { submitContactInquiry } from "@/lib/apiClient";
import { pricing, DEFAULT_BUDGET } from "@/config/pricing";
import { PricingTrustCopy } from "./LaunchPricing";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

const projectScopes = [
  "Web Development",
  "Web Designing",
  "UI/UX Design",
  "AI Agents",
];

const budgetRanges = pricing.budgetBands;

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [scope, setScope] = useState(projectScopes[0]);
  const [budget, setBudget] = useState<string>(DEFAULT_BUDGET);
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState("");
  const [referenceId, setReferenceId] = useState("");

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setFeedback("");

    try {
      const parts = name.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");

      const res = await submitContactInquiry({
        firstName,
        lastName,
        email,
        company,
        service: scope,
        budget,
        message,
        source: "home_contact_section",
        botField,
        formLoadedAt,
      });

      if (!res.ok || !res.data.success) {
        setStatus("error");
        setFeedback(
          res.data.error || "Please check your inputs and try submitting again."
        );
        return;
      }

      setStatus("success");
      setReferenceId(res.data.inquiryId || "AXM-CONFIRMED");
      setFeedback(res.data.message);
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch {
      setStatus("error");
      setFeedback(
        "Network error encountered. Please email us directly at contact@axiomstudio.agency."
      );
    }
  };

  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 bg-[#F8F9FC] border-t border-[#212226]/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Studio Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: MOTION_EASE.cinematicOut }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#3186FF]" />
              <span>START YOUR PROJECT</span>
            </div>

            <SplitTextReveal
              as="h2"
              text="Let's Build Something Clean, Fast & Memorable."
              accentFromWordIndex={4}
              accentClassName="text-[#3186FF]"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121317] mb-6"
            />

            <p className="text-[#45474D] text-base leading-relaxed mb-8">
              Tell us about your website, product UI/UX, or AI agent idea. You
              will hear directly from our builders within 24 hours with a clear
              plan and estimate.
            </p>

            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.08] shadow-sm text-[#3186FF]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#6A6A71]">
                    Direct Studio Email
                  </div>
                  <a
                    href="mailto:contact@axiomstudio.agency"
                    className="text-base font-semibold text-[#121317] hover:text-[#3186FF] transition-colors"
                  >
                    contact@axiomstudio.agency
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.08] shadow-sm text-[#00B95C]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#6A6A71]">
                    Studio Hubs
                  </div>
                  <div className="text-base font-semibold text-[#121317]">
                    Kuopio, Finland • Lahore, Pakistan
                  </div>
                  <div className="text-xs text-[#45474D] mt-0.5">
                    Collaborating seamlessly with clients worldwide
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.08] shadow-sm text-[#FBBC04]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#6A6A71]">
                    Response Time
                  </div>
                  <div className="text-base font-semibold text-[#121317]">
                    Within 24 Hours (Mon — Sat)
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Validated Lead Form on Crisp #FFFFFF Surface */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.75,
              delay: 0.1,
              ease: MOTION_EASE.cinematicOut,
            }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl p-6 sm:p-10 bg-[#FFFFFF] border border-[#212226]/[0.08] shadow-[0_20px_56px_rgba(18,19,23,0.06)]">
              {status === "success" ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#00B95C]/10 border border-[#00B95C]/25 flex items-center justify-center mx-auto text-[#00B95C]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <span className="inline-block text-xs font-mono px-3 py-1 rounded-full bg-[#F8F9FC] text-[#3186FF] border border-[#212226]/[0.08]">
                    REF: {referenceId}
                  </span>
                  <h3 className="text-2xl font-bold text-[#121317]">
                    Project Brief Received
                  </h3>
                  <p className="text-sm text-[#45474D] max-w-md mx-auto leading-relaxed">
                    {feedback}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setFormLoadedAt(Date.now());
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full text-xs font-mono bg-[#B7BFD9]/[0.18] hover:bg-[#F0F1F5] text-[#121317] border border-[#212226]/[0.08] transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Honeypot field hidden from human users */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="botField">Leave empty</label>
                    <input
                      id="botField"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={botField}
                      onChange={(e) => setBotField(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-mono uppercase tracking-wider text-[#45474D] mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        autoComplete="name"
                        inputMode="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15 transition-all"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-mono uppercase tracking-wider text-[#45474D] mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@yourbrand.com"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-company"
                        className="block text-xs font-mono uppercase tracking-wider text-[#45474D] mb-2"
                      >
                        Company / Brand (Optional)
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        autoComplete="organization"
                        inputMode="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Studio"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15 transition-all"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-budget"
                        className="block text-xs font-mono uppercase tracking-wider text-[#45474D] mb-2"
                      >
                        Estimated Budget
                      </label>
                      <select
                        id="contact-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                      >
                        {budgetRanges.map((b) => (
                          <option
                            key={b}
                            value={b}
                            className="bg-white text-[#121317]"
                          >
                            {b}
                          </option>
                        ))}
                      </select>
                      <PricingTrustCopy />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-scope"
                      className="block text-xs font-mono uppercase tracking-wider text-[#45474D] mb-2"
                    >
                      Service Needed
                    </label>
                    <select
                      id="contact-scope"
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                    >
                      {projectScopes.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className="bg-white text-[#121317]"
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-mono uppercase tracking-wider text-[#45474D] mb-2"
                    >
                      Project Goals &amp; Timeline *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      minLength={15}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you want to design or build, any reference links you love, and your target launch window..."
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15 transition-all"
                    />
                  </div>

                  {status === "error" && (
                    <div className="p-3.5 rounded-xl bg-[#FC413D]/[0.08] border border-[#FC413D]/25 flex items-center gap-2.5 text-xs text-[#FC413D] font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{feedback}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-semibold bg-[#121317] hover:bg-[#2F3034] disabled:opacity-50 text-white shadow-[0_8px_24px_rgba(18,19,23,0.16)] transition-all"
                  >
                    <span>
                      {status === "submitting"
                        ? "Sending Your Project Brief..."
                        : "Send Project Brief"}
                    </span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
