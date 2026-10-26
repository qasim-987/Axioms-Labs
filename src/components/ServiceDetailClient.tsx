"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import { ServiceItem } from "@/data/services";
import { submitContactInquiry } from "@/lib/apiClient";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Bot,
  Globe,
  Layout,
  Cloud,
  Shield,
  Sparkles,
  ChevronDown,
  Send,
  Check,
  AlertCircle,
  Loader2,
  Wrench,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-8 h-8 text-brand-primary" />,
  Globe: <Globe className="w-8 h-8 text-brand-primary" />,
  Cpu: <Cpu className="w-8 h-8 text-brand-primary" />,
  Bot: <Bot className="w-8 h-8 text-brand-primary" />,
  Shield: <Shield className="w-8 h-8 text-brand-primary" />,
  Cloud: <Cloud className="w-8 h-8 text-brand-primary" />,
};

interface Props {
  service: ServiceItem;
  otherServices: ServiceItem[];
}

export default function ServiceDetailClient({ service, otherServices }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formLoadedAt, setFormLoadedAt] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    budget: "$25k - $50k",
    message: "",
    botField: "",
  });

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 65%"],
  });

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const parts = formData.name.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");

      const res = await submitContactInquiry({
        firstName,
        lastName,
        email: formData.email,
        company: formData.company,
        service: service.title,
        budget: formData.budget,
        message: formData.message,
        source: `service_pillar:${service.slug}`,
        botField: formData.botField,
        formLoadedAt,
      });

      if (res.ok) {
        setFormSubmitted(true);
        setInquiryId(res.data.inquiryId || null);
      } else {
        setSubmitError(
          res.data.error || "Please verify your details and try again."
        );
      }
    } catch {
      setSubmitError(
        "Unable to reach Axiom Studio API server. Please retry in a moment."
      );
    } finally {
      setSubmitting(false);
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
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/#services"
              className="hover:text-white transition-colors"
            >
              Services
            </Link>
            <span>/</span>
            <span className="text-brand-primary font-medium">
              {service.title}
            </span>
          </div>

          {/* Centered Hero Section */}
          <div className="mb-20 max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-mono font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{service.badge}</span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-brand-primary/30 shadow-lg shadow-brand-primary/10 shrink-0">
                {iconMap[service.iconName] || (
                  <Cpu className="w-8 h-8 text-brand-primary" />
                )}
              </div>
              <SplitTextReveal
                as="h1"
                text={service.title}
                triggerOnLoad
                className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight text-center"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-brand-primary mb-6">
              {service.heroHeadline}
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              {service.longDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white">
                Benchmark: {service.metrics}
              </span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production SLA Ready
              </span>
            </div>
          </div>

          {/* "What You Get" — 6 Numbered Deliverables */}
          <div className="mb-24">
            <div className="mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                COMPREHENSIVE SCOPE • 01 — 06
              </span>
              <SplitTextReveal
                as="h2"
                text="What You Get"
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-brand-primary px-2.5 py-1 rounded bg-brand-primary/10 border border-brand-primary/25">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "How We Work" — Scroll-Scrubbed 4-Phase Timeline (Animations.md §11.2) */}
          <div className="mb-24">
            <div className="mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                EXECUTION ROADMAP
              </span>
              <SplitTextReveal
                as="h2"
                text="How We Work"
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
              />
            </div>

            <div ref={timelineRef} className="relative pl-8 sm:pl-12">
              {/* Background Track */}
              <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] bg-white/[0.08]" />
              {/* Scroll-Linked Indigo Progress Beam */}
              <motion.div
                style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
                className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] bg-gradient-to-b from-brand-light via-brand-primary to-emerald-400 shadow-[0_0_12px_rgba(133,135,227,0.8)]"
              />

              <div className="space-y-8">
                {service.processPhases.map((phase) => (
                  <div
                    key={phase.number}
                    className="relative p-6 sm:p-8 rounded-2xl glass-panel border border-white/[0.08] hover:border-brand-primary/40 transition-colors"
                  >
                    <span className="absolute -left-[29px] sm:-left-[39px] top-7 w-4 h-4 rounded-full bg-[#030303] border-2 border-brand-primary shadow-[0_0_10px_rgba(133,135,227,0.8)]" />
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-brand-primary">
                          PHASE {phase.number}
                        </span>
                        <h3 className="text-xl font-bold text-white">
                          {phase.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-300">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                      {phase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {phase.deliverables.map((d) => (
                        <span
                          key={d}
                          className="text-xs font-mono px-2.5 py-1 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-light"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* "Built With" — Industry-Standard Stack */}
          <div className="mb-24 p-8 rounded-2xl glass-panel border border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-primary mb-4">
              <Wrench className="w-4 h-4" />
              <span>Built With</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {service.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-200"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Zero-Jank CSS Grid FAQ Accordion */}
          <div className="mb-24">
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                FREQUENTLY ASKED
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Technical &amp; Delivery FAQs
              </h2>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm sm:text-base font-semibold text-white">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-brand-primary shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.04] pt-3">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Inline Service Scoping Form (Wired to Standalone Backend) */}
          <div className="mb-24 p-8 sm:p-12 rounded-3xl bg-[#08080d] border border-brand-primary/30 shadow-2xl shadow-brand-primary/10">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                PROJECT SCOPING
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Scope Your {service.title} Engagement
              </h2>
              <p className="text-sm text-zinc-400">
                Share your architectural requirements. An Axiom Studio principal
                architect will reply with a scoping brief within 24 hours.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center max-w-xl mx-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Scoping Inquiry Logged
                </h3>
                {inquiryId && (
                  <p className="text-xs font-mono text-brand-light mb-2">
                    Reference ID: {inquiryId}
                  </p>
                )}
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Thank you. An Axiom Studio engineering lead specializing in{" "}
                  {service.title} will review your parameters and follow up
                  within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl"
              >
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
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 mb-1.5 block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Marcus Vance"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 mb-1.5 block">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="marcus@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 mb-1.5 block">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Acme Systems Inc."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 mb-1.5 block">
                    Expected Budget Tier
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#0d0d12] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="< $25k">&lt; $25,000</option>
                    <option value="$25k - $50k">$25,000 – $50,000</option>
                    <option value="$50k - $100k">$50,000 – $100,000</option>
                    <option value="$100k+">$100,000+</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-zinc-400 mb-1.5 block">
                    Project Details &amp; Objectives *
                  </label>
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={`Tell us about your ${service.title} requirements, timeline, or current technical bottlenecks...`}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {submitError && (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-primary hover:bg-brand-hover text-white transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Transmitting Scoping Brief...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Scoping Inquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Other Services Switcher */}
          <div className="pt-10 border-t border-white/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
              Explore Complementary Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherServices.slice(0, 3).map((other) => (
                <Link
                  key={other.id}
                  href={`/services/${other.slug}`}
                  className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-brand-primary/40 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">
                    {other.title}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
