"use client";

import { pricing, DEFAULT_BUDGET } from "@/config/pricing";
import { PricingTrustCopy } from "@/components/LaunchPricing";
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
    dotColor: "text-[#3186FF]",
  },
  {
    city: "Lahore, Pakistan",
    region: "Engineering & Design Studio",
    timezone: "PKT / UTC+5",
    focus: "Full-Stack Web Development, Web Designing & AI Agent Engineering",
    dotColor: "text-[#00B95C]",
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
    budget: DEFAULT_BUDGET,
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
        className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#FFFFFF] text-[#121317]"
      >
        <LightRays />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          {/* Centered Character-Split Hero */}
          <div className="max-w-3xl mx-auto text-center mb-16 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-[#3186FF] text-xs font-mono font-semibold mb-6">
              <span>START YOUR PROJECT • &lt;24H RESPONSE</span>
            </div>

            <SplitTextReveal
              as="h1"
              text="Let's Connect"
              triggerOnLoad
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#121317] tracking-tight mb-5 text-center"
            />

            <p className="text-base sm:text-lg text-[#45474D] leading-relaxed max-w-2xl mx-auto">
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
                  className="p-6 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-[#121317] font-bold text-lg">
                        <MapPin className={`w-4 h-4 ${hub.dotColor}`} />
                        <span>{hub.city}</span>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#3186FF]/[0.08] border border-[#3186FF]/20 text-[#3186FF] font-medium">
                        {hub.timezone}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#6A6A71] mb-2">
                      {hub.region}
                    </p>
                    <p className="text-xs text-[#45474D] leading-relaxed">
                      {hub.focus}
                    </p>
                  </div>
                </SpotlightCard>
              ))}

              <div className="p-6 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] space-y-3 text-xs font-mono text-[#45474D]">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#00B95C] shrink-0" />
                  <span className="text-[#121317]">
                    100% IP Ownership &amp; NDA Available Upon Request
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#FBBC04] shrink-0" />
                  <span>Response Time: Within 24 Hours</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#3186FF] shrink-0" />
                  <span className="text-[#121317]">
                    contact@axiomstudio.agency
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Scoping Form */}
            <div className="lg:col-span-7 rounded-3xl bg-[#FFFFFF] border border-[#212226]/[0.09] p-5 sm:p-10 shadow-[0_24px_64px_rgba(18,19,23,0.07)]">
              {isSuccess ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#00B95C]/10 border border-[#00B95C]/25 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-[#00B95C]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#121317] mb-2">
                    Project Inquiry Received
                  </h2>
                  {inquiryId && (
                    <div className="inline-block px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#3186FF] mb-4">
                      Reference ID: {inquiryId}
                    </div>
                  )}
                  <p className="text-sm text-[#45474D] max-w-md mx-auto mb-8">
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
                    className="px-6 py-2.5 rounded-full bg-[#B7BFD9]/[0.18] hover:bg-[#F0F1F5] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] transition-colors"
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
                      <label className="block text-xs font-mono text-[#45474D] mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="given-name"
                        inputMode="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Alex"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#45474D] mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        autoComplete="family-name"
                        inputMode="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Lindholm"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-[#45474D] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="alex@company.com"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#45474D] mb-2">
                        Company / Brand
                      </label>
                      <input
                        type="text"
                        autoComplete="organization"
                        inputMode="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        placeholder="Your Brand"
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono text-[#45474D] mb-2">
                        Service Needed *
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) =>
                          setFormData({ ...formData, service: e.target.value })
                        }
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] focus:outline-none focus:bg-white focus:border-[#3186FF]"
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
                      <label className="block text-xs font-mono text-[#45474D] mb-2">
                        Estimated Budget
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                        className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] focus:outline-none focus:bg-white focus:border-[#3186FF]"
                      >
                        {pricing.budgetBands.map(band=><option key={band} value={band}>{band}</option>)}
                      </select>
                  <PricingTrustCopy />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#45474D] mb-2">
                      Project Brief &amp; Goals *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Describe the website, UI/UX design, web application, or AI agent you want to build and your target timeline..."
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:bg-white focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-[#FC413D]/[0.08] border border-[#FC413D]/25 text-xs text-[#FC413D] font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#121317] hover:bg-[#2F3034] text-white text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(18,19,23,0.16)] disabled:opacity-50"
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
