"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { footerLinks } from "@/data/navigation";
import { checkBackendHealth, BackendHealthStatus } from "@/lib/apiClient";
import SplitTextReveal from "./SplitTextReveal";
import { Clock, ArrowUp, ArrowRight, Server, MapPin } from "lucide-react";

export default function Footer() {
  const [timeString, setTimeString] = useState<string>("--:--:--");
  const [year, setYear] = useState<number>(2026);
  const [apiHealth, setApiHealth] = useState<BackendHealthStatus | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setYear(now.getFullYear());
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    checkBackendHealth().then(setApiHealth);

    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
    e.currentTarget.style.transform = `translate3d(${dx.toFixed(
      1
    )}px, ${dy.toFixed(1)}px, 0)`;
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translate3d(0px, 0px, 0)";
  };

  return (
    <footer className="relative bg-[#020203] border-t border-white/[0.08] pt-20 pb-12 text-zinc-400 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        {/* Centered Closing Cinematic Split-Character CTA Stage */}
        <div className="pb-16 mb-16 border-b border-white/[0.08] flex flex-col items-center text-center gap-7">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary block mb-3">
              READY TO BUILD?
            </span>
            <SplitTextReveal
              as="h2"
              text="We turn bold ideas into powerful digital realities."
              accentFromWordIndex={5}
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1] text-center"
            />
          </div>

          <Link
            href="/contact"
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold transition-all duration-200 shadow-xl shadow-brand-primary/25 will-change-transform shrink-0"
          >
            <span>Let&apos;s work together</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Studio Lockup + Live 1Hz Local Clock + API Status */}
        <div className="pb-12 mb-12 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-muted via-brand-primary to-white flex items-center justify-center p-[1px] shadow-lg shadow-brand-primary/20">
              <div className="w-full h-full bg-[#08080a] rounded-[10px] flex items-center justify-center">
                <span className="font-mono font-black text-sm text-white tracking-tighter">
                  AX
                </span>
              </div>
            </div>
            <div>
              <span className="font-sans font-bold text-lg text-white tracking-tight flex items-center gap-2">
                AXIOM STUDIO
              </span>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Kuopio, Finland • Lahore, Pakistan • Serving Clients Globally
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Standalone Backend API Telemetry Pill */}
            <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.08] px-3.5 py-2.5 rounded-xl text-xs font-mono">
              <Server className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-zinc-400">API:</span>
              {apiHealth?.status === "operational" ? (
                <span className="text-emerald-400 font-semibold tabular-nums">
                  ONLINE ({apiHealth.latencyMs}ms)
                </span>
              ) : (
                <span className="text-zinc-300">STANDBY</span>
              )}
            </div>

            {/* Live 1Hz Studio Clock Card */}
            <div className="flex items-center gap-3.5 bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-mono text-zinc-400">
                  STUDIO TIME
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="font-mono font-bold text-sm text-white tabular-nums tracking-wider">
                {timeString}
              </div>
            </div>
          </div>
        </div>

        {/* Clean 4-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs">
              {footerLinks.services.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold mb-4">
              Concept Showcase
            </h4>
            <ul className="space-y-2.5 text-xs">
              {footerLinks.work.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold mb-4">
              Studio
            </h4>
            <ul className="space-y-2.5 text-xs">
              {footerLinks.company.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold mb-4">
              Locations &amp; Direct
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>Kuopio, Finland</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                <span>Lahore, Pakistan</span>
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
              <a
                href="mailto:contact@axiomstudio.agency"
                className="hover:text-brand-light transition-colors break-all"
              >
                contact@axiomstudio.agency
              </a>
            </div>
          </div>
        </div>

        {/* Legal & Back-to-Top Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {year} Axiom Studio. All rights reserved.</span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            {footerLinks.legal.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="hover:text-zinc-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white font-mono text-[11px] transition-colors"
          >
            <span>TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
