"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { servicesData } from "@/data/services";
import { clientsData } from "@/data/clients";
import { MOTION_EASE } from "@/lib/motionTokens";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Bot,
  Globe,
  Layout,
  Cloud,
  Shield,
  Layers,
  FileText,
  Activity,
  Code,
  TrendingUp,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-5 h-5 text-brand-primary" />,
  Globe: <Globe className="w-5 h-5 text-brand-primary" />,
  Cpu: <Cpu className="w-5 h-5 text-brand-primary" />,
  Bot: <Bot className="w-5 h-5 text-brand-primary" />,
  Shield: <Shield className="w-5 h-5 text-brand-primary" />,
  Cloud: <Cloud className="w-5 h-5 text-brand-primary" />,
};

export default function Navbar() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const latestWork = clientsData[0];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaMenuOpen(false);
        setResourcesOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
        setResourcesOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#030303]/85 backdrop-blur-xl border-b border-white/[0.08] py-3.5 shadow-2xl shadow-black/80"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Monogram & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-muted via-brand-primary to-white flex items-center justify-center p-[1px] shadow-lg shadow-brand-primary/20 group-hover:shadow-brand-primary/40 transition-shadow">
              <div className="w-full h-full bg-[#08080a] rounded-[7px] flex items-center justify-center">
                <span className="text-white font-mono font-black text-sm tracking-tighter">
                  AX
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-white flex items-center gap-1.5">
                AXIOM STUDIO
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                AI &amp; Systems Architecture
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Services Mega-Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMegaMenuOpen(!megaMenuOpen);
                  setResourcesOpen(false);
                }}
                onMouseEnter={() => {
                  setMegaMenuOpen(true);
                  setResourcesOpen(false);
                }}
                aria-expanded={megaMenuOpen}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  megaMenuOpen
                    ? "text-white bg-white/[0.08]"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                Services
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    megaMenuOpen
                      ? "rotate-180 text-brand-primary"
                      : "text-zinc-400"
                  }`}
                />
              </button>
            </div>

            <Link
              href="/work"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Work
            </Link>

            <Link
              href="/company"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Company
            </Link>

            {/* Resources Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setResourcesOpen(!resourcesOpen);
                  setMegaMenuOpen(false);
                }}
                onMouseEnter={() => {
                  setResourcesOpen(true);
                  setMegaMenuOpen(false);
                }}
                aria-expanded={resourcesOpen}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  resourcesOpen
                    ? "text-white bg-white/[0.08]"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                Resources
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    resourcesOpen
                      ? "rotate-180 text-brand-primary"
                      : "text-zinc-400"
                  }`}
                />
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.985 }}
                    transition={{ duration: 0.2, ease: MOTION_EASE.cinematicOut }}
                    onMouseLeave={() => setResourcesOpen(false)}
                    className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#09090d]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/90 p-3 z-50"
                  >
                    <div className="space-y-1">
                      <Link
                        href="/resources/vendor-matrix"
                        onClick={() => setResourcesOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary mt-0.5">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors">
                            AI Vendor Matrix
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Compare latency, VPC &amp; HIPAA compliance
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/open-axiom"
                        onClick={() => setResourcesOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                          <Code className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                            Open Axiom
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            9 permissive open-source skills &amp; templates
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/blog"
                        onClick={() => setResourcesOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors">
                            Engineering Blog
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Production blueprints, evals &amp; AI economics
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/demos/threat-monitor"
                        onClick={() => setResourcesOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                            Interactive Labs (6 Demos)
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            3D threat globe, vector search &amp; voice AI
                          </p>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Primary Header CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Navigation"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spring-Animated Services Mega-Menu with "OUR LATEST WORK" Spotlight Card */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: MOTION_EASE.cinematicOut }}
            onMouseLeave={() => setMegaMenuOpen(false)}
            className="hidden md:block absolute left-0 right-0 mt-3 px-4 sm:px-6 lg:px-8 z-50"
          >
            <div className="max-w-6xl mx-auto rounded-3xl bg-[#09090e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/90 p-6 lg:p-8">
              <div className="grid grid-cols-12 gap-8">
                {/* 6 Service Pillars (8 Cols) */}
                <div className="col-span-8 grid grid-cols-2 gap-3">
                  {servicesData.map((service, idx) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group p-3.5 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-all flex items-start gap-3.5"
                    >
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-brand-primary/40 group-hover:bg-brand-primary/10 transition-colors shrink-0">
                        {iconMap[service.iconName] || (
                          <Cpu className="w-5 h-5 text-brand-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-brand-primary font-bold">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-semibold text-white group-hover:text-brand-light transition-colors">
                            {service.title}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {service.shortDesc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Featured "OUR LATEST WORK" Preview Card (4 Cols — antimatterai.agency mega-menu parity) */}
                <div className="col-span-4 border-l border-white/[0.08] pl-7 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-semibold block mb-3">
                      OUR LATEST WORK
                    </span>
                    <Link
                      href={`/work/${latestWork.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group block rounded-2xl p-5 bg-gradient-to-br from-brand-primary/15 via-white/[0.03] to-transparent border border-brand-primary/25 hover:border-brand-primary/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-white">
                          {latestWork.client}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                          {latestWork.impactMetric}
                        </span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-zinc-300 font-medium mb-2">
                        {latestWork.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {latestWork.impactLabel}
                      </p>
                    </Link>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <Link
                      href="/work"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-zinc-300 hover:text-white font-medium transition-colors"
                    >
                      Browse all 7 dossiers →
                    </Link>
                    <Link
                      href="/demos/threat-monitor"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-brand-primary hover:text-brand-light font-mono"
                    >
                      Live Labs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: MOTION_EASE.cinematicOut }}
            className="md:hidden overflow-hidden bg-[#050508]/98 backdrop-blur-2xl border-b border-white/10"
          >
            <div className="px-4 pt-4 pb-8 space-y-6 max-h-[82vh] overflow-y-auto">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 px-2">
                  Services
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {servicesData.map((s, idx) => (
                    <Link
                      key={s.id}
                      href={`/services/${s.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-zinc-200 hover:bg-white/[0.05]"
                    >
                      <span>
                        <span className="font-mono text-xs text-brand-primary mr-2">
                          0{idx + 1}
                        </span>
                        {s.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/work"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-white"
                >
                  Case Studies
                </Link>
                <Link
                  href="/company"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-white"
                >
                  Company
                </Link>
                <Link
                  href="/resources/vendor-matrix"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-white"
                >
                  Vendor Matrix
                </Link>
                <Link
                  href="/open-axiom"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-white"
                >
                  Open Axiom
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-white"
                >
                  Engineering Blog
                </Link>
                <Link
                  href="/demos/threat-monitor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-brand-light"
                >
                  Interactive Labs
                </Link>
              </div>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand-primary text-white text-sm font-semibold"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
