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
  Code,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="w-5 h-5 text-brand-primary" />,
  Globe: <Globe className="w-5 h-5 text-brand-primary" />,
  Layout: <Layout className="w-5 h-5 text-brand-primary" />,
  Bot: <Bot className="w-5 h-5 text-brand-primary" />,
  Cpu: <Cpu className="w-5 h-5 text-brand-primary" />,
};

export default function Navbar() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const featuredConcept = clientsData[0];

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
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
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
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none"
          >
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-white">
              AXIOM STUDIO
            </span>
          </Link>

          {/* Focused Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Services Mega-Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                onMouseEnter={() => setMegaMenuOpen(true)}
                aria-expanded={megaMenuOpen}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                  megaMenuOpen
                    ? "text-white bg-white/[0.08]"
                    : "text-zinc-300 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                Services
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
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

            <Link
              href="/blog"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Blog
            </Link>

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
              className="hidden sm:inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full border border-white/25 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/40 text-white text-xs font-semibold tracking-wide transition-all duration-200"
            >
              <span>Start Your Project</span>
              <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
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

      {/* Spring-Animated 4-Service Mega-Menu + Featured Studio Concept Card */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: MOTION_EASE.cinematicOut }}
            onMouseLeave={() => setMegaMenuOpen(false)}
            className="hidden md:block absolute left-0 right-0 mt-3 px-8 sm:px-12 lg:px-16 z-50"
          >
            <div className="max-w-6xl mx-auto rounded-3xl bg-[#09090e]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/90 p-6 lg:p-8">
              <div className="grid grid-cols-12 gap-8">
                {/* 4 Core Services (8 Cols, clean 2x2 grid) */}
                <div className="col-span-8 grid grid-cols-2 gap-4">
                  {servicesData.map((service, idx) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group p-4 rounded-2xl hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.1] transition-all flex items-start gap-3.5"
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

                {/* Featured Studio Concept Preview Card (4 Cols) */}
                <div className="col-span-4 border-l border-white/[0.08] pl-7 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-semibold block mb-3">
                      STUDIO CONCEPT SHOWCASE
                    </span>
                    <Link
                      href={`/work/${featuredConcept.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group block rounded-2xl p-5 bg-gradient-to-br from-brand-primary/15 via-white/[0.03] to-transparent border border-brand-primary/25 hover:border-brand-primary/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                          {featuredConcept.client}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-brand-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                          {featuredConcept.impactMetric}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium mb-2">
                        {featuredConcept.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {featuredConcept.impactLabel}
                      </p>
                    </Link>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <Link
                      href="/work"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-zinc-300 hover:text-white font-medium transition-colors"
                    >
                      Explore 4 Concept Builds →
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-brand-primary hover:text-brand-light font-mono"
                    >
                      Book Call
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
                  Our 4 Core Services
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
                  Concept Work
                </Link>
                <Link
                  href="/company"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-white"
                >
                  Company
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-white"
                >
                  Insights Blog
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.03] text-sm font-medium text-brand-light"
                >
                  Contact Us
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
