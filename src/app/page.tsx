import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogoStrip from "@/components/LogoStrip";
import StatsSection from "@/components/StatsSection";
import ServicesGrid from "@/components/ServicesGrid";
import CaseStudies from "@/components/CaseStudies";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { Terminal, Shield, Cpu, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen">
        {/* Hero Section with Light-Ray Background */}
        <Hero />

        {/* Client / Partner Logo Marquee */}
        <LogoStrip />

        {/* Rolling-Digit Stats Counters */}
        <StatsSection />

        {/* Six Core Services Grid */}
        <ServicesGrid />

        {/* Methodology / Architectural Standards Section */}
        <section id="capabilities" className="py-24 border-t border-white/[0.08] bg-[#020203] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-brand-light text-xs font-mono font-medium mb-4">
                <span>OUR METHODOLOGY</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Deterministic Engineering Over Guesswork.
              </h2>
              <p className="mt-4 text-base text-zinc-400 leading-relaxed">
                Modern AI implementations frequently fail due to stochastic inconsistency and hidden runtime drift. We build deterministic guardrails, rigorous automated evaluation loops, and hardened sandboxes into every deployment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="p-8 rounded-2xl glass-panel border border-white/10 hover:border-brand-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-6">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Autonomous Tool Protocol
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  We integrate structured Model Context Protocol (MCP) servers, granting AI models typed, authenticated, and bounded access to enterprise backends.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-2xl glass-panel border border-white/10 hover:border-brand-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Zero-Knowledge Isolation
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Proprietary algorithms and customer data never leave your private VPC. We deploy air-gapped models and edge inference engines with complete data sovereignty.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-2xl glass-panel border border-white/10 hover:border-brand-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-6">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Continuous Automated Evals
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Every code change, prompt iteration, and fine-tuned weight checkpoint is automatically tested against regression test sets before reaching production.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Case Studies Grid */}
        <CaseStudies />

        {/* Contact Form Section */}
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
