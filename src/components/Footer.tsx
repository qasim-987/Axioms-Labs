"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Mail, MapPin, Clock } from "lucide-react";
import { MOTION_EASE } from "@/lib/motionTokens";

function LiveStudioClock() {
  const [times, setTimes] = useState<{ kuopio: string; lahore: string } | null>(
    null
  );

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const kuopio = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      const lahore = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setTimes({ kuopio, lahore });
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FFFFFF] border border-[#212226]/[0.08] shadow-[0_2px_10px_rgba(18,19,23,0.03)]">
        <span className="w-2 h-2 rounded-full bg-[#00B95C] animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-[#3186FF]" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6A6A71]">
          Kuopio
        </span>
        <span className="text-xs font-mono font-bold text-[#121317] tabular-nums">
          {times ? times.kuopio : "--:--:--"}
        </span>
      </div>
      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FFFFFF] border border-[#212226]/[0.08] shadow-[0_2px_10px_rgba(18,19,23,0.03)]">
        <span className="w-2 h-2 rounded-full bg-[#3186FF] animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-[#3186FF]" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6A6A71]">
          Lahore
        </span>
        <span className="text-xs font-mono font-bold text-[#121317] tabular-nums">
          {times ? times.lahore : "--:--:--"}
        </span>
      </div>
    </div>
  );
}

const ACCENT_CLOSING = "powerful digital realities.";

export default function Footer() {
  const [mag, setMag] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setMag({ x: dx * 0.2, y: dy * 0.25 });
  }, []);

  const handleLeave = useCallback(() => {
    setMag({ x: 0, y: 0 });
  }, []);

  return (
    <footer className="relative bg-[#F8F9FC] border-t border-[#212226]/[0.08] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Antimatter-inspired Closing Kinetic CTA Banner in Obsidian `#121317` + Antigravity Blue */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.78, ease: MOTION_EASE.cinematicOut }}
          className="relative mb-16 rounded-[32px] bg-[#121317] text-white px-7 py-12 sm:px-14 sm:py-16 overflow-hidden shadow-[0_26px_70px_rgba(18,19,23,0.18)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-20 w-[440px] h-[440px] rounded-full blur-3xl opacity-45"
            style={{
              background:
                "radial-gradient(circle, rgba(49, 134, 255, 0.52) 0%, rgba(116, 155, 255, 0.22) 48%, transparent 72%)",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-[11px] font-mono uppercase tracking-[0.2em] text-[#749BFF] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
                START A CONVERSATION
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-white">
                <span className="block font-medium text-[#E6EAF0]">
                  We turn bold ideas into
                </span>
                <span
                  aria-label={ACCENT_CLOSING}
                  className="inline-block mt-1 font-extrabold italic text-[#749BFF]"
                >
                  {ACCENT_CLOSING.split(" ").map((word, wIdx, arr) => (
                    <span key={wIdx} className="inline-block whitespace-nowrap">
                      {word.split("").map((ch, cIdx) => {
                        const globalIdx = wIdx * 7 + cIdx;
                        return (
                          <motion.span
                            key={cIdx}
                            aria-hidden="true"
                            initial={{
                              opacity: 0,
                              y: 22,
                              filter: "blur(6px)",
                            }}
                            whileInView={{
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                            }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{
                              duration: 0.56,
                              delay: 0.08 + globalIdx * 0.02,
                              ease: MOTION_EASE.cinematicOut,
                            }}
                            className="inline-block will-change-transform"
                          >
                            {ch}
                          </motion.span>
                        );
                      })}
                      {wIdx < arr.length - 1 ? "\u00A0" : ""}
                    </span>
                  ))}
                </span>
              </h2>
            </div>

            <div className="shrink-0">
              <Link
                href="/contact"
                onMouseMove={handleMove}
                onMouseLeave={handleLeave}
                style={{
                  transform: `translate3d(${mag.x}px, ${mag.y}px, 0)`,
                  transition:
                    mag.x === 0 && mag.y === 0
                      ? "transform 480ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease"
                      : "transform 90ms linear, background-color 200ms ease",
                }}
                className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#FFFFFF] hover:bg-[#F0F1F5] text-[#121317] text-sm sm:text-base font-semibold shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
              >
                <span>Let&apos;s work together</span>
                <ArrowUpRight className="w-4 h-4 text-[#3186FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[#212226]/[0.08]">
          {/* Brand Column + Live Studio Clocks */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#121317] flex items-center justify-center shadow-[0_4px_12px_rgba(18,19,23,0.16)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#121317]">
                Axiom<span className="text-[#3186FF]">Studio</span>
              </span>
            </Link>
            <p className="text-sm text-[#45474D] max-w-sm leading-relaxed mb-6">
              Boutique digital product &amp; AI studio crafting fast web
              platforms, expressive web design, scalable UI/UX systems, and
              autonomous AI agents.
            </p>
            <div className="space-y-2.5 text-xs font-mono text-[#6A6A71] mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#3186FF]" />
                <span>Kuopio, Finland • Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#3186FF]" />
                <a
                  href="mailto:hello@axiomstudio.ai"
                  className="hover:text-[#121317] transition-colors"
                >
                  hello@axiomstudio.ai
                </a>
              </div>
            </div>

            <LiveStudioClock />
          </div>

          {/* Services (Strictly the 4 Core Services) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#121317] font-semibold mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-[#45474D]">
              <li>
                <Link
                  href="/services/ui-ux-design"
                  className="hover:text-[#121317] transition-colors"
                >
                  UI/UX Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/web-development"
                  className="hover:text-[#121317] transition-colors"
                >
                  Web Development
                </Link>
              </li>
              <li>
                <Link
                  href="/services/web-designing"
                  className="hover:text-[#121317] transition-colors"
                >
                  Web Designing
                </Link>
              </li>
              <li>
                <Link
                  href="/services/ai-agents"
                  className="hover:text-[#121317] transition-colors"
                >
                  AI Agents
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#121317] font-semibold mb-4">
              Studio
            </h4>
            <ul className="space-y-2.5 text-sm text-[#45474D]">
              <li>
                <Link
                  href="/work"
                  className="hover:text-[#121317] transition-colors"
                >
                  Concept Work
                </Link>
              </li>
              <li>
                <Link
                  href="/company"
                  className="hover:text-[#121317] transition-colors"
                >
                  About Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/#process"
                  className="hover:text-[#121317] transition-colors"
                >
                  Process
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[#121317] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Start a Project */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#121317] font-semibold mb-4">
              Inquiries
            </h4>
            <p className="text-xs text-[#6A6A71] leading-relaxed mb-4">
              Have a web platform, design system, or AI agent in mind?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121317] hover:text-[#3186FF] transition-colors"
            >
              <span>Book Discovery Call</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6A6A71]">
          <p>
            © {new Date().getFullYear()} Axiom Studio. Kuopio, Finland &amp;
            Lahore, Pakistan.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/company"
              className="hover:text-[#121317] transition-colors"
            >
              Studio Ethos
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#121317] transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
