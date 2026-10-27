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
  Code: <Code className="w-5 h-5 text-[#3186FF]" />,
  Globe: <Globe className="w-5 h-5 text-[#00B95C]" />,
  Layout: <Layout className="w-5 h-5 text-[#FC413D]" />,
  Bot: <Bot className="w-5 h-5 text-[#FBBC04]" />,
  Cpu: <Cpu className="w-5 h-5 text-[#3186FF]" />,
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
          ? "bg-[#FFFFFF]/92 backdrop-blur-xl border-b border-[#212226]/[0.07] py-3.5 shadow-[0_4px_24px_rgba(18,19,23,0.04)]"
          : "bg-[#FFFFFF]/75 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Brand Wordmark in Antigravity #202124 Charcoal + Multicolor Mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
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
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#202124]">
              Axiom Studio
            </span>
          </Link>

          {/* Antigravity Minimal Center Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                onMouseEnter={() => setMegaMenuOpen(true)}
                aria-expanded={megaMenuOpen}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-normal transition-colors ${
                  megaMenuOpen
                    ? "text-[#121317] bg-[#B7BFD9]/25 font-medium"
                    : "text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20"
                }`}
              >
                Services
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    megaMenuOpen
                      ? "rotate-180 text-[#3186FF]"
                      : "text-[#45474D]"
                  }`}
                />
              </button>
            </div>

            <Link
              href="/work"
              className="px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
            >
              Work
            </Link>

            <Link
              href="/company"
              className="px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
            >
              Company
            </Link>

            <Link
              href="/blog"
              className="px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
            >
              Blog
            </Link>

            <Link
              href="/contact"
              className="px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Antigravity Signature Solid #121317 Right Pill Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121317] hover:bg-[#2F3034] text-white text-xs sm:text-sm font-medium tracking-normal transition-all duration-150 shadow-sm"
            >
              <span>Start Your Project</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Navigation"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-full text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
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

      {/* Clean White Antigravity Mega-Menu + #121317 Inverse Dark Concept Preview Card */}
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
            <div className="max-w-6xl mx-auto rounded-3xl bg-[#FFFFFF] border border-[#212226]/[0.09] shadow-[0_24px_64px_rgba(18,19,23,0.12)] p-6 lg:p-8">
              <div className="grid grid-cols-12 gap-8">
                {/* 4 Core Services (8 Cols, clean 2x2 grid) */}
                <div className="col-span-8 grid grid-cols-2 gap-4">
                  {servicesData.map((service, idx) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group p-4 rounded-2xl bg-[#F8F9FC] hover:bg-[#EFF2F7] border border-[#212226]/[0.05] hover:border-[#3186FF]/30 transition-all flex items-start gap-3.5"
                    >
                      <div className="p-2.5 rounded-xl bg-white border border-[#212226]/[0.07] shadow-sm shrink-0">
                        {iconMap[service.iconName] || (
                          <Cpu className="w-5 h-5 text-[#3186FF]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#3186FF] font-bold">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-semibold text-[#121317] group-hover:text-[#3186FF] transition-colors">
                            {service.title}
                          </span>
                        </div>
                        <p className="text-xs text-[#45474D] line-clamp-2 mt-1 leading-relaxed">
                          {service.shortDesc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Featured Studio Concept Preview Card (#121317 Inverse Dark Card) */}
                <div className="col-span-4 border-l border-[#212226]/[0.08] pl-7 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#3186FF] font-semibold block mb-3">
                      STUDIO CONCEPT SHOWCASE
                    </span>
                    <Link
                      href={`/work/${featuredConcept.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group block rounded-2xl p-5 bg-[#121317] hover:bg-[#18191D] text-white transition-all shadow-md"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#749BFF]" />
                          {featuredConcept.client}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-[#749BFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                          {featuredConcept.impactMetric}
                        </span>
                      </div>
                      <p className="text-xs text-[#F8F9FC] font-medium mb-1.5">
                        {featuredConcept.title}
                      </p>
                      <p className="text-[11px] text-[#B2BBC5] line-clamp-2">
                        {featuredConcept.impactLabel}
                      </p>
                    </Link>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#212226]/[0.08] flex items-center justify-between text-xs">
                    <Link
                      href="/work"
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-[#45474D] hover:text-[#121317] font-mono transition-colors"
                    >
                      All Concept Builds →
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMegaMenuOpen(false)}
                      className="inline-flex items-center gap-1 text-[#3186FF] hover:text-[#1B6EF3] font-semibold"
                    >
                      <span>Book Call</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#FFFFFF] border-b border-[#212226]/[0.08] px-8 pt-4 pb-8 space-y-5 max-h-[85vh] overflow-y-auto shadow-xl"
          >
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#6A6A71] mb-3">
                Our 4 Services
              </div>
              <div className="grid grid-cols-1 gap-2">
                {servicesData.map((s, idx) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.06] text-sm text-[#121317] hover:bg-[#EFF2F7]"
                  >
                    <span className="font-mono text-xs text-[#3186FF] font-bold">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {iconMap[s.iconName]}
                    <span className="font-medium">{s.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#212226]/[0.08] pt-4 flex flex-col gap-3">
              <Link
                href="/work"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#121317] py-1"
              >
                Work (Concept Builds)
              </Link>
              <Link
                href="/company"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#121317] py-1"
              >
                Company
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#121317] py-1"
              >
                Blog
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#121317] py-1"
              >
                Contact
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold bg-[#121317] hover:bg-[#2F3034] text-white"
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
