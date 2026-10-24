"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import ContactSection from "@/components/ContactSection";
import { ChevronDown, Clock, MapPin, Mail, ShieldCheck } from "lucide-react";

const contactFaqs = [
  {
    q: "What is your typical project kickoff timeline?",
    a: "Following an initial scoping call and technical requirements alignment, our sprint teams typically mobilize within 5 to 7 business days."
  },
  {
    q: "Do you sign mutual NDAs before technical discussions?",
    a: "Yes. We execute mutual non-disclosure agreements prior to reviewing any proprietary architectural specifications, database schemas, or training datasets."
  },
  {
    q: "How do you handle team collaboration across time zones?",
    a: "Our core engineering hubs are in San Francisco and London, providing continuous overlap across North American, European, and Asian business hours with direct Slack/Teams integration."
  }
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen pt-24 relative overflow-hidden bg-[#030303] text-zinc-100">
        <LightRays />

        <ContactSection />

        {/* Global Coordinates & FAQ Accordion Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Global Hubs */}
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-3 block">
                GLOBAL REACH
              </span>
              <h3 className="text-2xl font-bold text-white mb-6">
                Distributed Engineering Studios
              </h3>
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">San Francisco Hub</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Montgomery St, Financial District • Americas Engineering Lead
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">London Hub</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Shoreditch High St, EC1 • EMEA Systems &amp; Compliance Studio
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact FAQs Accordion */}
            <div className="lg:col-span-7">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-3 block">
                ENGAGEMENT FAQ
              </span>
              <h3 className="text-2xl font-bold text-white mb-6">
                Common Technical Inquiries
              </h3>
              <div className="space-y-3">
                {contactFaqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-sm font-semibold text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-brand-primary shrink-0 transition-transform duration-200 ${
                          openFaq === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
