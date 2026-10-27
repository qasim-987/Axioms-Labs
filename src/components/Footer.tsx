"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { footerLinks } from "@/data/navigation";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE } from "@/lib/motionTokens";
import { ArrowUpRight, Clock, Activity } from "lucide-react";

export default function Footer() {
  const [studioTime, setStudioTime] = useState<string>("");
  const [apiOnline, setApiOnline] = useState<boolean>(true);

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Helsinki",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date());
        setStudioTime(`${formatted} EET`);
      } catch {
        setStudioTime("LIVE");
      }
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.status === "ok") {
          setApiOnline(true);
        }
      })
      .catch(() => {
        /* keep default indicator */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="relative bg-[#FFFFFF] border-t border-[#212226]/[0.07] pt-16 sm:pt-24 pb-12 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Antigravity Signature Inverse Dark Callout Card (#121317 .card.dark before footer) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: MOTION_EASE.cinematicOut }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#121317] text-[#F8F9FC] p-8 sm:p-14 lg:p-16 mb-20 shadow-[0_24px_64px_rgba(18,19,23,0.16)]"
        >
          {/* Ambient Multicolor Antigravity Corner Glow inside Dark Card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-45"
            style={{
              background:
                "radial-gradient(circle, rgba(49,134,255,0.5) 0%, rgba(116,155,255,0.22) 48%, transparent 74%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(0,185,92,0.4) 0%, rgba(251,188,4,0.18) 52%, transparent 76%)",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs font-mono text-[#B2BBC5] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
                <span>READY WHEN YOU ARE</span>
              </div>
              <SplitTextReveal
                as="h2"
                text="We turn bold ideas into powerful digital realities."
                accentFromWordIndex={5}
                accentClassName="text-[#749BFF]"
                className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.12] mb-4"
              />
              <p className="text-sm sm:text-base text-[#B2BBC5] max-w-xl leading-relaxed">
                Partner directly with our Web Development, Web Designing, UI/UX,
                and AI Agent builders across Kuopio and Lahore.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-4 shrink-0">
              {/* Inverse Primary Pill Button: White Fill + #121317 Ink */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-sm font-semibold bg-[#FFFFFF] hover:bg-[#F0F1F5] text-[#121317] shadow-lg transition-all hover:scale-[1.02]"
              >
                <span>Let&apos;s Work Together</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:contact@axiomstudio.agency"
                className="text-sm font-mono text-[#B2BBC5] hover:text-white transition-colors"
              >
                contact@axiomstudio.agency
              </a>
            </div>
          </div>
        </motion.div>

        {/* Clean Airy White Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-[#212226]/[0.08]">
          {/* Studio Hubs & Live Clock */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded-md flex items-center justify-center p-[2px]"
                style={{
                  background:
                    "linear-gradient(135deg, #3186FF 0%, #FC413D 45%, #FBBC04 75%, #00B95C 100%)",
                }}
              >
                <span className="w-full h-full rounded-[4px] bg-white flex items-center justify-center font-mono text-[9px] font-black text-[#121317]">
                  A
                </span>
              </span>
              <span className="font-bold text-lg tracking-tight text-[#202124]">
                Axiom Studio
              </span>
            </div>

            <p className="text-sm text-[#45474D] max-w-sm leading-relaxed">
              Kuopio, Finland • Lahore, Pakistan — Designing and engineering
              high-converting websites, product UI/UX, and AI agents for clients
              worldwide.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317]">
                <Clock className="w-3.5 h-3.5 text-[#3186FF]" />
                <span>KUOPIO STUDIO TIME:</span>
                <span className="text-[#3186FF] font-semibold tabular-nums">
                  {studioTime || "LOADING..."}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00B95C]/[0.08] border border-[#00B95C]/20 text-xs font-mono text-[#00B95C] font-medium">
                <Activity className="w-3.5 h-3.5" />
                <span>{apiOnline ? "API GATEWAY ONLINE" : "API STANDBY"}</span>
              </div>
            </div>
          </div>

          {/* 4 Services Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#121317] font-semibold mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#45474D] hover:text-[#121317] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Concept Builds Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#121317] font-semibold mb-4">
              Concepts
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.work.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#45474D] hover:text-[#121317] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Links Column */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#121317] font-semibold mb-4">
              Studio
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#45474D] hover:text-[#121317] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Oversized Antigravity Wordmark Anchor */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease: MOTION_EASE.cinematicOut }}
          className="pt-10 pb-6 text-center select-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="block font-extrabold uppercase tracking-tighter leading-[0.88] text-[#202124]"
            style={{ fontSize: "clamp(2.8rem, 11.2vw, 10.5rem)" }}
          >
            AXIOM STUDIO
          </span>
        </motion.div>

        {/* Bottom Copyright */}
        <div className="pt-6 border-t border-[#212226]/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6A6A71]">
          <p>
            Axiom Studio © {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Web Dev • Web Design • UI/UX • AI Agents</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
