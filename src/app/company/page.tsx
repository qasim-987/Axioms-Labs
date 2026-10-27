"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import SpotlightCard from "@/components/SpotlightCard";
import {
  Shield,
  Cpu,
  Globe,
  Code2,
  ChevronDown,
  ArrowRight,
  MapPin,
} from "lucide-react";

const values = [
  {
    icon: Shield,
    color: "text-[#3186FF] bg-[#3186FF]/10 border-[#3186FF]/20",
    title: "Honest Craft Over Hype",
    desc: "We don't hide behind buzzwords. Every website, UI/UX interface, and AI agent we ship is clean, fast, maintainable, and built around real business goals.",
  },
  {
    icon: Code2,
    color: "text-[#FC413D] bg-[#FC413D]/10 border-[#FC413D]/20",
    title: "Direct Designer & Engineer Access",
    desc: "No layers of middle-management. You collaborate directly with the designers and full-stack developers crafting your product.",
  },
  {
    icon: Cpu,
    color: "text-[#FBBC04] bg-[#FBBC04]/15 border-[#FBBC04]/30",
    title: "Practical AI That Actually Works",
    desc: "We build AI agents grounded in your real knowledge base and tools—with strict schema validation and smooth human handoff.",
  },
  {
    icon: Globe,
    color: "text-[#00B95C] bg-[#00B95C]/10 border-[#00B95C]/20",
    title: "Nordic Standards, Global Agility",
    desc: "With studios in Kuopio, Finland and Lahore, Pakistan, we combine Nordic design clarity and reliability with rapid full-stack execution across time zones.",
  },
];

const faqs = [
  {
    q: "What services does Axiom Studio specialize in?",
    a: "We focus strictly on four core services: 1. Custom Web Development (Next.js, React, TypeScript, APIs), 2. High-Converting Web Designing, 3. Product UI/UX Design & Figma Design Systems, and 4. Custom AI Agents for support, lead qualification, and workflow automation.",
  },
  {
    q: "Where is Axiom Studio located?",
    a: "We operate out of Kuopio, Finland and Lahore, Pakistan, serving founders, startups, and growing brands across Europe, North America, the Middle East, and worldwide.",
  },
  {
    q: "Do we own 100% of the code, Figma designs, and AI workflows?",
    a: "Yes. Upon milestone completion, you receive full intellectual property ownership—including clean GitHub repositories, organized Figma source files, and deployment configurations with zero vendor lock-in.",
  },
  {
    q: "How fast can we kick off a new website, UI/UX, or AI Agent project?",
    a: "Most engagements kick off within 3 to 5 business days after our discovery call. Landing pages and UI/UX prototypes typically ship in 1–3 weeks, while full-stack web apps and custom AI agents take 3–6 weeks.",
  },
];

// Deterministic dot-matrix world grid coordinates (Kuopio, Finland ⇄ Lahore, Pakistan)
const mapDots = Array.from({ length: 180 }, (_, idx) => {
  const row = Math.floor(idx / 18);
  const col = idx % 18;
  return {
    cx: 28 + col * 30 + (row % 2 === 0 ? 8 : 0),
    cy: 26 + row * 22,
    active:
      (col >= 8 && col <= 10 && row >= 1 && row <= 4) ||
      (col >= 11 && col <= 14 && row >= 4 && row <= 6) ||
      (col >= 2 && col <= 5 && row >= 2 && row <= 5),
  };
});

export default function CompanyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Navbar />

      <main
        id="main-content"
        className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#FFFFFF] text-[#121317]"
      >
        <LightRays />

        <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
          {/* Centered Hero */}
          <div className="max-w-4xl mx-auto text-center mb-20 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-[#3186FF] text-xs font-mono font-semibold mb-6">
              <span>ABOUT AXIOM STUDIO • FINLAND &amp; PAKISTAN</span>
            </div>

            <SplitTextReveal
              as="h1"
              text="A Focused Digital & AI Studio Built on Craft."
              accentFromWordIndex={6}
              accentClassName="text-[#3186FF]"
              triggerOnLoad
              className="text-4xl sm:text-6xl font-extrabold text-[#121317] tracking-tight mb-6 leading-[1.08] text-center"
            />

            <p className="text-base sm:text-xl text-[#45474D] leading-relaxed font-normal max-w-3xl mx-auto">
              Axiom Studio brings together modern Web Development, expressive
              Web Designing, intuitive UI/UX Design, and practical AI
              Agents—operating between{" "}
              <span className="text-[#121317] font-semibold">
                Kuopio, Finland
              </span>{" "}
              and{" "}
              <span className="text-[#121317] font-semibold">
                Lahore, Pakistan
              </span>{" "}
              for ambitious clients worldwide.
            </p>
          </div>

          {/* Studio Highlights & Animated Dotted World Map (Kuopio ⇄ Lahore) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24 items-stretch">
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              {[
                { val: "04", label: "Core Studio Capabilities" },
                { val: "99+", label: "Target Lighthouse Speed" },
                { val: "2", label: "Studios (Kuopio & Lahore)" },
                { val: "<24h", label: "Direct Team Response" },
              ].map((stat, idx) => (
                <SpotlightCard
                  key={idx}
                  delay={idx * 0.06}
                  className="p-6 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] text-center justify-center items-center"
                >
                  <div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#121317] font-mono mb-2">
                      {stat.val}
                    </div>
                    <div className="text-xs text-[#45474D]">{stat.label}</div>
                  </div>
                </SpotlightCard>
              ))}
            </div>

            {/* Dual-Layer Pulsing Dotted World Map SVG inside Antigravity #121317 Dark Card */}
            <div className="lg:col-span-7 rounded-3xl bg-[#121317] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_56px_rgba(18,19,23,0.16)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#749BFF]">
                  <MapPin className="w-4 h-4 text-[#3186FF]" />
                  <span>GLOBAL STUDIO FOOTPRINT</span>
                </div>
                <span className="text-[11px] font-mono text-[#4ADE80]">
                  KUOPIO • LAHORE • WORLDWIDE
                </span>
              </div>

              <div className="relative w-full aspect-[16/8] my-2">
                <svg
                  viewBox="0 0 580 230"
                  className="w-full h-full"
                  aria-label="Axiom Studio Kuopio Finland and Lahore Pakistan global delivery map"
                >
                  {mapDots.map((dot, idx) => (
                    <circle
                      key={idx}
                      cx={dot.cx}
                      cy={dot.cy}
                      r={dot.active ? 2.4 : 1.5}
                      fill={
                        dot.active
                          ? "rgba(49, 134, 255, 0.72)"
                          : "rgba(255, 255, 255, 0.14)"
                      }
                    />
                  ))}

                  {/* Connection Arc: Kuopio, Finland (298, 48) -> Lahore, Pakistan (396, 114) */}
                  <motion.path
                    d="M 298 48 Q 355 42 396 114"
                    fill="none"
                    stroke="#3186FF"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    initial={{ pathLength: 0, opacity: 0.3 }}
                    whileInView={{ pathLength: 1, opacity: 0.95 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                  />

                  {/* Secondary Global Client Arc */}
                  <motion.path
                    d="M 298 48 Q 205 22 126 92"
                    fill="none"
                    stroke="rgba(0, 185, 92, 0.7)"
                    strokeWidth="1.3"
                    strokeDasharray="4 5"
                    initial={{ pathLength: 0, opacity: 0.2 }}
                    whileInView={{ pathLength: 1, opacity: 0.8 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
                  />

                  {/* Kuopio, Finland Studio Beacon */}
                  <g transform="translate(298, 48)">
                    <circle
                      r="11"
                      fill="rgba(49,134,255,0.28)"
                      className="animate-ping"
                    />
                    <circle r="4.5" fill="#3186FF" />
                    <text
                      x="-26"
                      y="-12"
                      fill="#749BFF"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      KUOPIO, FI
                    </text>
                  </g>

                  {/* Lahore, Pakistan Studio Beacon */}
                  <g transform="translate(396, 114)">
                    <circle
                      r="11"
                      fill="rgba(0,185,92,0.28)"
                      className="animate-ping"
                    />
                    <circle r="4.5" fill="#00B95C" />
                    <text
                      x="10"
                      y="4"
                      fill="#4ADE80"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      LAHORE, PK
                    </text>
                  </g>
                </svg>
              </div>

              <p className="text-xs text-[#B2BBC5] font-mono">
                Nordic strategy &amp; client partnership in{" "}
                <span className="text-white">Kuopio, Finland (EET)</span> paired
                with dedicated engineering &amp; design execution in{" "}
                <span className="text-white">Lahore, Pakistan (PKT)</span>.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div id="beliefs" className="mb-24">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#3186FF] mb-3 font-semibold">
              What Drives Us
            </h2>
            <SplitTextReveal
              as="h3"
              text="Principles We Never Compromise On"
              className="text-3xl font-bold text-[#121317] mb-10"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <SpotlightCard
                    key={idx}
                    delay={idx * 0.07}
                    tilt
                    className="p-8 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] hover:border-[#3186FF]/35"
                  >
                    <div>
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${val.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-xl font-bold text-[#121317] mb-2">
                        {val.title}
                      </h4>
                      <p className="text-sm text-[#45474D] leading-relaxed">
                        {val.desc}
                      </p>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </div>

          {/* Studio FAQ Accordion */}
          <div className="mb-20">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#3186FF] mb-3 font-semibold">
              FAQ
            </h2>
            <h3 className="text-3xl font-bold text-[#121317] mb-8">
              Working With Axiom Studio
            </h3>

            <div className="space-y-4">
              {faqs.map((item, idx) => {
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
                      className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-[#EFF2F7] transition-colors"
                    >
                      <span className="text-base font-semibold text-[#121317]">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#3186FF] shrink-0 transition-transform duration-300 ${
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
                        <div className="px-6 pb-6 text-sm text-[#45474D] leading-relaxed border-t border-[#212226]/[0.06] pt-4 bg-[#FFFFFF]">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final CTA */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FC] border border-[#212226]/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="text-2xl font-bold text-[#121317] mb-2">
                Have a project in mind?
              </h4>
              <p className="text-sm text-[#45474D]">
                Reach out to our team in Kuopio or Lahore and get a tailored
                project plan within 24 hours.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-[#121317] hover:bg-[#2F3034] text-white transition-colors shrink-0"
            >
              <span>Contact Our Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
