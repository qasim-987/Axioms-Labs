"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import ContactSection from "@/components/ContactSection";
import SplitTextReveal from "@/components/SplitTextReveal";
import SpotlightCard from "@/components/SpotlightCard";
import { ChevronDown, MapPin } from "lucide-react";

const contactFaqs = [
  {
    q: "What is your typical project kickoff timeline?",
    a: "Following an initial scoping call and technical requirements alignment, our sprint teams typically mobilize within 5 to 7 business days.",
  },
  {
    q: "Do you sign mutual NDAs before technical discussions?",
    a: "Yes. We execute mutual non-disclosure agreements prior to reviewing any proprietary architectural specifications, database schemas, or training datasets.",
  },
  {
    q: "How do you handle team collaboration across time zones?",
    a: "Our core engineering hubs are in San Francisco and London, providing continuous overlap across North American, European, and Asian business hours with direct Slack/Teams integration.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Navbar />

      <main
        id="main-content"
        className="min-h-screen pt-24 relative overflow-hidden bg-[#030303] text-zinc-100"
      >
        <LightRays />

        <ContactSection />

        {/* Global Coordinates & Smooth Zero-Jank FAQ Accordion Section */}
        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Global Hubs */}
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-3 block">
                GLOBAL REACH
              </span>
              <SplitTextReveal
                as="h3"
                text="Distributed Engineering Studios"
                accentFromWordIndex={2}
                className="text-2xl font-bold text-white mb-6"
              />
              <div className="space-y-4">
                <SpotlightCard className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-primary/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          San Francisco Hub
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Montgomery St, Financial District • Americas
                          Engineering Lead
                        </p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mt-1.5 shrink-0" />
                  </div>
                </SpotlightCard>

                <SpotlightCard
                  delay={0.08}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-primary/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          London Hub
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Shoreditch High St, EC1 • EMEA Systems &amp;
                          Compliance Studio
                        </p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mt-1.5 shrink-0" />
                  </div>
                </SpotlightCard>
              </div>
            </div>

            {/* Smooth 0fr -> 1fr Contact FAQs Accordion */}
            <div className="lg:col-span-7">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-3 block">
                ENGAGEMENT FAQ
              </span>
              <SplitTextReveal
                as="h3"
                text="Common Technical Inquiries"
                accentFromWordIndex={2}
                className="text-2xl font-bold text-white mb-6"
              />
              <div className="space-y-3">
                {contactFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-colors overflow-hidden ${
                        isOpen
                          ? "border-brand-primary/40 bg-white/[0.03]"
                          : "border-white/[0.08] bg-white/[0.02]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="text-sm font-semibold text-white">
                          {faq.q}
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
                          <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.05] pt-3">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
