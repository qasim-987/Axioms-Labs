"use client";

import React, { useState, useEffect } from "react";
import { servicesData } from "@/data/services";
import { submitContactInquiry } from "@/lib/apiClient";
import SplitTextReveal from "./SplitTextReveal";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Mail,
  Globe,
  MapPin,
} from "lucide-react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  botField: string;
  websiteUrl: string;
}

interface FormErrors {
  firstName?: string;
  email?: string;
  service?: string;
  message?: string;
}

export default function ContactSection() {
  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    service: "",
    budget: "$2,500 - $5,000",
    message: "",
    botField: "",
    websiteUrl: "",
  });

  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    if (!formData.message.trim() || formData.message.trim().length < 15) {
      newErrors.message =
        "Please share at least 15 characters describing your project";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await submitContactInquiry({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        service: formData.service,
        budget: formData.budget,
        message: formData.message,
        source: "contact_section",
        botField: formData.botField,
        websiteUrl: formData.websiteUrl,
        formLoadedAt,
      });

      if (result.ok) {
        setIsSuccess(true);
        setInquiryId(result.data.inquiryId || null);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          service: "",
          budget: "$2,500 - $5,000",
          message: "",
          botField: "",
          websiteUrl: "",
        });
        setErrors({});
      } else {
        setErrors({
          message: result.data.error || "Submission failed. Please retry.",
        });
      }
    } catch {
      setErrors({
        message:
          "Unable to reach Axiom Studio API server. Please try again shortly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 relative border-t border-white/[0.08] bg-[#030303]"
    >
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Context & Real Studio Locations */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-primary text-xs font-mono font-medium mb-4">
                <span>START YOUR PROJECT</span>
              </div>
              <SplitTextReveal
                as="h2"
                text="Let's Build Something Extraordinary."
                accentFromWordIndex={2}
                className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight"
              />
              <p className="mt-4 text-base text-zinc-400 leading-relaxed">
                Whether you need a high-converting website, a polished UI/UX
                design system, a custom full-stack web application, or an AI
                agent for your business, our team replies within 24 hours.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                  <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0" />
                  <span>100% Code &amp; Design Ownership + NDA Ready</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                  <Globe className="w-5 h-5 text-brand-primary shrink-0" />
                  <span>Nordic &amp; Global Delivery (Finland + Pakistan)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                  <Mail className="w-5 h-5 text-brand-primary shrink-0" />
                  <span>Direct Founder &amp; Lead Engineer Response (&lt; 24h)</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/[0.08] text-xs font-mono text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-200">
                <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Studios: Kuopio, Finland • Lahore, Pakistan</span>
              </div>
              <div>Inquiries: contact@axiomstudio.agency</div>
            </div>
          </div>

          {/* Right Column: Validated Scoping Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-10 shadow-2xl shadow-black/80">
              {isSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Project Inquiry Received
                  </h3>
                  {inquiryId && (
                    <div className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 font-mono text-xs text-brand-light mb-4">
                      Reference ID: {inquiryId}
                    </div>
                  )}
                  <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                    Thank you for reaching out! Our team at Axiom Studio will
                    review your project details and get back to you within 24
                    hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setInquiryId(null);
                      setFormLoadedAt(Date.now());
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-mono text-white transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Dual Anti-Bot Honeypots */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="botField"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.botField}
                      onChange={(e) =>
                        setFormData({ ...formData, botField: e.target.value })
                      }
                    />
                    <input
                      type="url"
                      name="websiteUrl"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, websiteUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-firstName"
                        className="block text-xs font-mono text-zinc-400 mb-2"
                      >
                        First Name *
                      </label>
                      <input
                        id="contact-firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Alex"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
                      />
                      {errors.firstName && (
                        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-lastName"
                        className="block text-xs font-mono text-zinc-400 mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        id="contact-lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Lindholm"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-mono text-zinc-400 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="alex@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-company"
                        className="block text-xs font-mono text-zinc-400 mb-2"
                      >
                        Company / Brand
                      </label>
                      <input
                        id="contact-company"
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        placeholder="Your Company"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-service"
                        className="block text-xs font-mono text-zinc-400 mb-2"
                      >
                        Service Needed *
                      </label>
                      <select
                        id="contact-service"
                        value={formData.service}
                        onChange={(e) =>
                          setFormData({ ...formData, service: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#0b0b10] border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="">Select a Service...</option>
                        {servicesData.map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                      {errors.service && (
                        <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.service}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-budget"
                        className="block text-xs font-mono text-zinc-400 mb-2"
                      >
                        Estimated Budget
                      </label>
                      <select
                        id="contact-budget"
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#0b0b10] border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="$1,000 - $2,500">$1,000 – $2,500</option>
                        <option value="$2,500 - $5,000">$2,500 – $5,000</option>
                        <option value="$5,000 - $15,000">$5,000 – $15,000</option>
                        <option value="$15,000+">$15,000+ Custom Scope</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-mono text-zinc-400 mb-2"
                    >
                      Project Goals &amp; Timeline *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us about the website, UI/UX design, web app, or AI agent you want to build and your target launch timeline..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/50"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all shadow-xl shadow-brand-primary/25 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Project Inquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
