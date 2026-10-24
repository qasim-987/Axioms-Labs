"use client";

import React, { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import { servicesData, ServiceItem } from "@/data/services";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Bot,
  Globe,
  Layout,
  Cloud,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  Calendar,
  Send,
  Check
} from "lucide-react";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-8 h-8 text-brand-primary" />,
  Globe: <Globe className="w-8 h-8 text-brand-primary" />,
  Cpu: <Cpu className="w-8 h-8 text-brand-primary" />,
  Bot: <Bot className="w-8 h-8 text-brand-primary" />,
  Shield: <Shield className="w-8 h-8 text-brand-primary" />,
  Cloud: <Cloud className="w-8 h-8 text-brand-primary" />,
};

export default function ServiceDetail({ params }: ServicePageProps) {
  const service = servicesData.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  const otherServices = servicesData.filter((s) => s.slug !== params.slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    budget: "$25k - $50k",
    message: ""
  });

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.name.split(" ")[0] || formData.name,
          lastName: formData.name.split(" ").slice(1).join(" ") || "Client",
          email: formData.email,
          service: service.title,
          budget: formData.budget,
          message: `${formData.company ? `Company: ${formData.company}\n\n` : ""}${formData.message}`
        })
      });
      if (res.ok) {
        setFormSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setFormSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#030303] text-zinc-100">
        <LightRays />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/#services" className="hover:text-white transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-brand-primary font-medium">{service.title}</span>
          </div>

          {/* Hero Section */}
          <div className="mb-20 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-mono font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{service.badge}</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-brand-primary/30 shadow-lg shadow-brand-primary/10">
                {iconMap[service.iconName] || <Cpu className="w-8 h-8 text-brand-primary" />}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {service.title}
              </h1>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-brand-primary mb-6">
              {service.heroHeadline}
            </h2>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-light mb-8">
              {service.longDesc}
            </p>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white">
                Benchmark: {service.metrics}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production SLA Ready
              </span>
            </div>
          </div>

          {/* "What You Get" - Deliverables Grid (6 Items) */}
          <div className="mb-24">
            <div className="mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                COMPREHENSIVE SCOPE
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                What You Get
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-brand-primary/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-mono text-zinc-500 mb-3 block">
                      0{idx + 1}
                    </span>
                    <h3 className="text-base font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center gap-1.5 text-[11px] font-mono text-brand-primary">
                    <Check className="w-3.5 h-3.5" />
                    Verified Deliverable
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "How We Work" - Phased Process Roadmap (4 Phases) */}
          <div className="mb-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#09090e] to-[#040406] border border-white/[0.08]">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                EXECUTION METHODOLOGY
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-3">
                How We Work
              </h2>
              <p className="text-sm text-zinc-400">
                A structured four-phase delivery sprint that moves from cognitive scoping to production deployment with zero ambiguity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {service.processPhases.map((phase, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-mono font-extrabold text-brand-primary">
                        {phase.number}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {phase.duration}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {phase.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                      Outputs:
                    </span>
                    {phase.deliverables.map((d, dIdx) => (
                      <div key={dIdx} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                        <span className="text-brand-primary">•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Cloud */}
          <div className="mb-24">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 block">
              PRODUCTION TOOLING &amp; PROTOCOLS
            </span>
            <div className="flex flex-wrap gap-2.5">
              {service.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-white/[0.04] text-zinc-300 border border-white/[0.08]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Service Accordion FAQ */}
          <div className="mb-24">
            <div className="mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                QUESTIONS &amp; SCOPE
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Frequently Asked About {service.title}
              </h2>
            </div>

            <div className="space-y-4">
              {service.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-primary shrink-0 transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/[0.04] pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Inline Service Scoping Form */}
          <div className="mb-24 p-8 sm:p-12 rounded-3xl bg-[#08080d] border border-brand-primary/30 shadow-2xl shadow-brand-primary/10">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
                PROJECT SCOPING
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Scope Your {service.title} Engagement
              </h2>
              <p className="text-sm text-zinc-400">
                Share your architectural requirements. Our lead engineers will review your notes and reply with a scoping brief within 24 hours.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center max-w-xl mx-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Inquiry Received
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Thank you. An engineering lead specializing in {service.title} will review your parameters and follow up shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl">
                <div>
                  <label className="text-xs font-mono text-zinc-400 mb-1.5 block">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0d0d12] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="< $25k">&lt; $25,000</option>
                    <option value="$25k - $50k">$25,000 - $50,000</option>
                    <option value="$50k - $100k">$50,000 - $100,000</option>
                    <option value="$100k+">$100,000+</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-zinc-400 mb-1.5 block">
                    Project Details &amp; Objectives *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={`Tell us about your ${service.title} requirements, timeline, or current technical bottlenecks...`}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Transmitting Scoping Brief..." : "Submit Scoping Inquiry"}
                    <Send className="w-3.5 h-3.5" />
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
