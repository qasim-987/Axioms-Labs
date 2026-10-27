"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import SpotlightCard from "@/components/SpotlightCard";
import { servicesData } from "@/data/services";
import { submitContactInquiry } from "@/lib/apiClient";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  ShieldCheck,
  Mail,
} from "lucide-react";

const studioHubs = [
  {
    city: "Kuopio, Finland",
    region: "Nordics & EU Client Hub",
    timezone: "EET / UTC+2",
    focus: "Product Strategy, UI/UX Discovery & European Partnerships",
  },
  {
    city: "Lahore, Pakistan",
    region: "Engineering & Design Studio",
    timezone: "PKT / UTC+5",
    focus: "Full-Stack Web Development, Web Designing & AI Agent Engineering",
  },
];

export default function DedicatedContactPage() {
  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (
      !formData.firstName.trim() ||
      !formData.email.trim() ||
      !formData.service
    ) {
      setErrorMsg(
        "Please complete your name, email address, and service selection."
      );
      return;
    }

    if (formData.message.trim().length < 15) {
      setErrorMsg(
        "Please share at least 15 characters describing your project goals."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitContactInquiry({
        ...formData,
        source: "dedicated_contact_page",
        formLoadedAt,
      });

      if (res.ok) {
        setIsSuccess(true);
        setInquiryId(res.data.inquiryId || null);
      } else {
        setErrorMsg(
          res.data.error || "Unable to submit inquiry. Please verify fields."
        );
      }
    } catch {
      setErrorMsg(
        "Could not connect to Axiom Studio API server. Please retry shortly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main
        id="main-content"
        className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#030303] text-zinc-100"
      >
        <LightRays />

        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
          {/* Centered Character-Split Hero */}
          <div className="max-w-3xl mx-auto text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-primary text-xs font-mono font-medium mb-6">
              <span>START YOUR PROJECT • &lt;24H RESPONSE</span>
            </div>

            <SplitTextReveal
              as="h1"
              text="Let's Connect"
              triggerOnLoad
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-5 text-center"
            />

            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Tell us about the website, UI/UX system, web application, or AI
              agent you want to launch. Our team in Kuopio &amp; Lahore responds
              within one business day with a clear scope and estimate.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Kuopio & Lahore Hubs + Direct Contact */}
            <div className="lg:col-span-5 space-y-5">
              {studioHubs.map((hub, idx) => (
                <SpotlightCard
                  key={hub.city}
                  delay={idx * 0.08}
                  className="p-6 rounded-2xl glass-panel border border-white/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <MapPin className="w-4 h-4 text-brand-primary" />
                        <span>{hub.city}</span>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-light">
                        {hub.timezone}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-500 mb-2">
                      {hub.region}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {hub.focus}
                    </p>
                  </div>
                </SpotlightCard>
              ))}

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% IP Ownership &amp; NDA Available Upon Request</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>Response Time: Within 24 Hours</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                  <span>contact@axiomstudio.agency</span>
                </div>
              </div>
            </div>

            {/* Right Column: Scoping Form */}
            <div className="lg:col-span-7 rounded-3xl glass-panel border border-white/10 p-7 sm:p-10 shadow-2xl shadow-black/80">
              {isSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Project Inquiry Received
                  </h2>
                  {inquiryId && (
                    <div className="inline-block px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-brand-light mb-4">
                      Reference ID: {inquiryId}
                    </div>
                  )}
                  <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8">
                    Thank you for reaching out to Axiom Studio! Our team will
                    review your project requirements and reply within 24 hours.
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
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                      <label className="block text-xs font-mono text-zinc-400 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Alex"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Lindholm"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="alex@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-2">
                        Company / Brand
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        placeholder="Your Brand"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-2">
                        Service Needed *
                      </label>
                      <select
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
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-zinc-400 mb-2">
                        Estimated Budget
                      </label>
                      <select
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
                    <label className="block text-xs font-mono text-zinc-400 mb-2">
                      Project Brief &amp; Goals *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Describe the website, UI/UX design, web application, or AI agent you want to build and your target timeline..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all shadow-xl shadow-brand-primary/25 disabled:opacity-50"
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
      </main>

      <Footer />
    </>
  );
}
