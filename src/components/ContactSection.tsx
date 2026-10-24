"use client";

import React, { useState, useEffect } from "react";
import { servicesData } from "@/data/services";
import { Send, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail, Globe, MapPin } from "lucide-react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  botField: string;
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
    budget: "$25k - $50k",
    message: "",
    botField: "",
  });

  const [formLoadedAt, setFormLoadedAt] = useState<number>(Date.now());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid corporate email address";
    }

    if (!formData.service) {
      newErrors.service = "Please select a service area";
    }

    if (!formData.message.trim() || formData.message.length < 15) {
      newErrors.message = "Please provide at least 15 characters describing your project requirements";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          service: formData.service,
          budget: formData.budget,
          message: `${formData.company ? `Company: ${formData.company}\n\n` : ""}${formData.message}`,
          botField: formData.botField,
          formLoadedAt
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          service: "",
          budget: "$25k - $50k",
          message: "",
          botField: "",
        });
        setErrors({});
      } else {
        const data = await res.json();
        setErrors({ message: data.error || "Submission failed. Please retry." });
      }
    } catch {
      setErrors({ message: "Network connection error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 relative border-t border-white/[0.08] bg-[#030303]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Context & Contact Info */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-primary text-xs font-mono font-medium mb-4">
                <span>START AN ENGAGEMENT</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Let&apos;s Build Something Extraordinary.
              </h2>
              <p className="mt-4 text-base text-zinc-400 leading-relaxed">
                Whether you need an autonomous agent platform, an evaluation harness, or a high-throughput Next.js application, our engineering team responds within one business day.
              </p>

              {/* Security & Guarantee Badges */}
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                  <ShieldCheck className="w-5 h-5 text-brand-primary" />
                  <span>Strict NDA &amp; Zero-Retention Privacy by Default</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                  <Mail className="w-5 h-5 text-brand-primary" />
                  <span>Direct channel with lead systems architects</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-mono">
                  <Globe className="w-5 h-5 text-brand-primary" />
                  <span>Global remote delivery with multi-timezone coverage</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/[0.08] text-xs text-zinc-500 font-mono">
              <div>Axiom Labs Headquarters: San Francisco • London • Remote</div>
              <div className="mt-1">Inquiries: contact@axiomlabs.agency</div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl glass-panel p-8 sm:p-10 border border-white/10 shadow-2xl relative">
              {isSuccess ? (
                <div className="py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Inquiry Successfully Received
                  </h3>
                  <p className="text-zinc-400 text-sm max-w-md mx-auto mb-8">
                    An Axiom Labs senior systems architect will review your technical parameters and reach out within 24 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.15] text-white transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field (hidden from screen readers & users) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="botField">Leave this blank</label>
                    <input
                      id="botField"
                      type="text"
                      name="botField"
                      value={formData.botField}
                      onChange={(e) => setFormData({ ...formData, botField: e.target.value })}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Marcus"
                        className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                          errors.firstName ? "border-rose-500/60 focus:border-rose-500" : "border-white/10 focus:border-brand-primary"
                        }`}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Vance"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Business Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                        Work Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="marcus@company.com"
                        className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                          errors.email ? "border-rose-500/60 focus:border-rose-500" : "border-white/10 focus:border-brand-primary"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Company */}
                    <div>
                      <label htmlFor="company" className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                        Company Name
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Systems"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Primary Service Selector */}
                  <div>
                    <label htmlFor="service" className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Primary Area of Need *
                    </label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl bg-[#0c0c11] border text-sm text-white focus:outline-none transition-colors ${
                        errors.service ? "border-rose-500/60 focus:border-rose-500" : "border-white/10 focus:border-brand-primary"
                      }`}
                    >
                      <option value="">Select a discipline...</option>
                      {servicesData.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title} ({s.badge})
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.service}
                      </p>
                    )}
                  </div>

                  {/* Budget Selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Estimated Project Investment
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["< $25k", "$25k - $50k", "$50k - $100k", "$100k+"].map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setFormData({ ...formData, budget: tier })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-mono border transition-all ${
                            formData.budget === tier
                              ? "bg-brand-primary/20 border-brand-primary text-white"
                              : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project Details Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Project Parameters &amp; Objectives *
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Outline current technical hurdles, timeline goals, or target integrations..."
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                        errors.message ? "border-rose-500/60 focus:border-rose-500" : "border-white/10 focus:border-brand-primary"
                      }`}
                    />
                    {errors.message && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-brand-primary/25 hover:shadow-brand-primary/40 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Architecture Inquiry</span>
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
