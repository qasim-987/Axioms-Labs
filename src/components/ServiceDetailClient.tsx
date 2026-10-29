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
  Code,
  Sparkles,
  ChevronDown,
  Send,
  Check,
  AlertCircle,
  Loader2,
  Wrench,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="w-8 h-8 text-[#3186FF]" />,
  Layout: <Layout className="w-8 h-8 text-[#FC413D]" />,
  Globe: <Globe className="w-8 h-8 text-[#00B95C]" />,
  Cpu: <Cpu className="w-8 h-8 text-[#3186FF]" />,
  Bot: <Bot className="w-8 h-8 text-[#FBBC04]" />,
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
    budget: "$2,500 - $5,000",
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
        className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#FFFFFF] text-[#121317]"
      >
        <LightRays />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#6A6A71] mb-8">
            <Link
              href="/"
              className="min-h-[44px] lg:min-h-0 inline-flex items-center px-1.5 hover:text-[#121317] transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/#services"
              className="min-h-[44px] lg:min-h-0 inline-flex items-center px-1.5 hover:text-[#121317] transition-colors"
            >
              Services
            </Link>
            <span>/</span>
            <span className="text-[#3186FF] font-semibold">
              {service.title}
            </span>
          </div>

          {/* Centered Hero Section */}
          <div className="mb-20 max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3186FF]/[0.08] border border-[#3186FF]/20 text-[#3186FF] text-xs font-mono font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{service.badge}</span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] shadow-sm shrink-0">
                {iconMap[service.iconName] || (
                  <Cpu className="w-8 h-8 text-[#3186FF]" />
                )}
              </div>
              <SplitTextReveal
                as="h1"
                text={service.title}
                triggerOnLoad
                className="text-3xl sm:text-5xl font-extrabold text-[#121317] tracking-tight text-center"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-[#3186FF] mb-6">
              {service.heroHeadline}
            </h2>

            <p className="text-base sm:text-lg text-[#45474D] leading-relaxed font-normal mb-8 max-w-3xl mx-auto">
              {service.longDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
              <span className="px-3.5 py-1.5 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-[#121317] font-medium">
                Target Benchmark: {service.metrics}
              </span>
              <span className="text-[#00B95C] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Ownership &amp; Production Ready
              </span>
            </div>
          </div>

          {/* "What You Get" — 6 Numbered Deliverables */}
          <div className="mb-24">
            <div className="mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold mb-2 block">
                INCLUDED DELIVERABLES • 01 — 06
              </span>
              <SplitTextReveal
                as="h2"
                text="What You Get"
                className="text-3xl sm:text-4xl font-bold text-[#121317] tracking-tight"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#F8F9FC] hover:bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 shadow-sm hover:shadow-[0_16px_40px_rgba(18,19,23,0.06)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-[#3186FF] px-2.5 py-1 rounded bg-[#3186FF]/[0.08] border border-[#3186FF]/20">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <Check className="w-4 h-4 text-[#00B95C]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#121317] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#45474D] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "How We Work" — Scroll-Scrubbed 4-Phase Timeline */}
          <div className="mb-24">
            <div className="mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold mb-2 block">
                DELIVERY WORKFLOW
              </span>
              <SplitTextReveal
                as="h2"
                text="How We Work"
                className="text-3xl sm:text-4xl font-bold text-[#121317] tracking-tight"
              />
            </div>

            <div ref={timelineRef} className="relative pl-8 sm:pl-12">
              <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] bg-[#E6EAF0]" />
              <motion.div
                style={{
                  scaleY: scrollYProgress,
                  transformOrigin: "top",
                  background:
                    "linear-gradient(180deg, #3186FF 0%, #FC413D 50%, #00B95C 100%)",
                }}
                className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px]"
              />

              <div className="space-y-8">
                {service.processPhases.map((phase) => (
                  <div
                    key={phase.number}
                    className="relative p-6 sm:p-8 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 transition-colors"
                  >
                    <span className="absolute -left-[29px] sm:-left-[39px] top-7 w-4 h-4 rounded-full bg-[#FFFFFF] border-2 border-[#3186FF] shadow-sm" />
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#3186FF]">
                          PHASE {phase.number}
                        </span>
                        <h3 className="text-xl font-bold text-[#121317]">
                          {phase.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.08] text-[#45474D]">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-sm text-[#45474D] leading-relaxed mb-5">
                      {phase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {phase.deliverables.map((d) => (
                        <span
                          key={d}
                          className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#3186FF]/[0.08] border border-[#3186FF]/20 text-[#3186FF] font-medium"
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
          <div className="mb-24 p-8 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold mb-4">
              <Wrench className="w-4 h-4" />
              <span>Tools &amp; Stack We Use</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {service.tools.map((tool) => (
                <span
                  key={tool}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] shadow-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="mb-24">
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold mb-2 block">
                COMMON QUESTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#121317]">
                {service.title} FAQs
              </h2>
            </div>

            <div className="space-y-3">
              {service.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#212226]/[0.08] bg-[#F8F9FC] overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#EFF2F7] transition-colors"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#121317]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#3186FF] shrink-0 transition-transform duration-300 ${
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
                        <div className="px-5 pb-5 text-xs sm:text-sm text-[#45474D] leading-relaxed border-t border-[#212226]/[0.06] pt-3 bg-[#FFFFFF]">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Inline Service Scoping Form */}
          <div className="mb-24 p-8 sm:p-12 rounded-3xl bg-[#F8F9FC] border border-[#212226]/[0.1] shadow-[0_20px_56px_rgba(18,19,23,0.06)]">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold mb-2 block">
                START YOUR PROJECT
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#121317] mb-2">
                Discuss Your {service.title} Project
              </h2>
              <p className="text-sm text-[#45474D]">
                Tell us what you are building and our team in Kuopio &amp;
                Lahore will send back a clear roadmap and quote within 24 hours.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#00B95C]/[0.08] border border-[#00B95C]/25 text-center max-w-xl mx-auto">
                <CheckCircle2 className="w-12 h-12 text-[#00B95C] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#121317] mb-2">
                  Project Inquiry Received
                </h3>
                {inquiryId && (
                  <p className="text-xs font-mono text-[#3186FF] mb-2">
                    Reference ID: {inquiryId}
                  </p>
                )}
                <p className="text-xs text-[#45474D] leading-relaxed">
                  Thank you! Our {service.title} team will review your project
                  details and follow up within one business day.
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
                  <label className="text-xs font-mono text-[#45474D] mb-1.5 block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    inputMode="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Alex Lindholm"
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#45474D] mb-1.5 block">
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
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#45474D] mb-1.5 block">
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
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[#45474D] mb-1.5 block">
                    Estimated Budget
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] focus:outline-none focus:border-[#3186FF]"
                  >
                    <option value="$1,000 - $2,500">$1,000 – $2,500</option>
                    <option value="$2,500 - $5,000">$2,500 – $5,000</option>
                    <option value="$5,000 - $15,000">$5,000 – $15,000</option>
                    <option value="$15,000+">$15,000+ Custom Scope</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-[#45474D] mb-1.5 block">
                    Project Details &amp; Goals *
                  </label>
                  <textarea
                    required
                    minLength={10}
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={`Tell us about your ${service.title} goals, desired features, and target launch timeline...`}
                    className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.1] text-base lg:text-sm text-[#121317] placeholder:text-[#6A6A71] focus:outline-none focus:border-[#3186FF] focus:ring-2 focus:ring-[#3186FF]/15"
                  />
                </div>

                {submitError && (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#FC413D]/[0.08] border border-[#FC413D]/25 text-xs text-[#FC413D] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#121317] hover:bg-[#2F3034] text-white transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Request Project Quote</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Other Services Switcher (All remaining 3 services) */}
          <div className="pt-10 border-t border-[#212226]/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#6A6A71] mb-6">
              Explore Our Other Services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherServices.map((other) => (
                <Link
                  key={other.id}
                  href={`/services/${other.slug}`}
                  className="p-5 rounded-xl border border-[#212226]/[0.08] bg-[#F8F9FC] hover:bg-[#EFF2F7] hover:border-[#3186FF]/35 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-semibold text-[#121317] group-hover:text-[#3186FF] transition-colors">
                    {other.title}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#6A6A71] group-hover:text-[#3186FF] group-hover:translate-x-1 transition-all" />
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
