"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePageTransition } from "@/components/transitions/context";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { destination } = usePageTransition();
  const activePath = destination?.split(/[?#]/)[0] || pathname;
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const featuredConcept = clientsData[0];

  useEffect(() => {
    const close = () => { setMegaMenuOpen(false); setMobileMenuOpen(false); };
    window.addEventListener("page-transition:start", close);
    return () => window.removeEventListener("page-transition:start", close);
  }, []);

  // Close menus automatically on route change
  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer automatically if viewport widens to >= 1024px
  useEffect(() => {
    const desktopMq = window.matchMedia("(min-width: 1024px)");
    const onMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMobileMenuOpen(false);
      } else {
        setMegaMenuOpen(false);
      }
    };
    desktopMq.addEventListener("change", onMqChange);
    return () => desktopMq.removeEventListener("change", onMqChange);
  }, []);

  // Body scroll lock + focus trap + Escape handling when mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const toggle = hamburgerBtnRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus(), 50);

    const handleDrawerKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileMenuOpen(false);
        toggle?.focus();
        return;
      }

      if (e.key === "Tab" && navRef.current) {
        const focusables = Array.from(
          navRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleDrawerKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      toggle?.focus();
      document.removeEventListener("keydown", handleDrawerKeyDown);
    };
  }, [mobileMenuOpen]);

  // Desktop mega-menu Escape + click-outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && megaMenuOpen) {
        setMegaMenuOpen(false);
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
  }, [megaMenuOpen]);

  // Publish exact sticky bar height (`--nav-h`) from `topBarRef` (excluding open drawer height!)
  useEffect(() => {
    const barEl = topBarRef.current ?? navRef.current;
    if (!barEl) return;

    const syncNavHeightVar = () => {
      const h = Math.round(barEl.getBoundingClientRect().height);
      if (h > 0) {
        document.documentElement.style.setProperty("--nav-h", `${h}px`);
      }
    };

    syncNavHeightVar();
    window.addEventListener("resize", syncNavHeightVar, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(syncNavHeightVar);
      ro.observe(barEl);
    }

    return () => {
      window.removeEventListener("resize", syncNavHeightVar);
      ro?.disconnect();
    };
  }, []);

  return (
    <header
      ref={navRef}
      data-site-navbar="true"
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Sticky Top Bar (Safe-area aware on notched devices; Desktop >= 1024px identical) */}
      <div
        ref={topBarRef}
        style={{
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
        className={`transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "bg-[#FFFFFF]/92 backdrop-blur-xl border-b border-[#212226]/[0.07] py-3 lg:py-3.5 shadow-[0_4px_24px_rgba(18,19,23,0.04)]"
            : "bg-[#FFFFFF]/75 backdrop-blur-md py-3.5 lg:py-4"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex items-center justify-between gap-3">
            {/* Brand Wordmark in Antigravity #202124 Charcoal + Multicolor Mark */}
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 min-h-[44px] lg:min-h-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF] rounded-lg"
            >
              <span
                aria-hidden="true"
                className="w-5 h-5 rounded-md flex items-center justify-center p-[2px] shrink-0"
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

            {/* Desktop (>= 1024px) Minimal Center Pill Navigation — Unchanged */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-1.5"
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  aria-expanded={megaMenuOpen}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-normal transition-colors ${
                    (megaMenuOpen || activePath.startsWith("/services/"))
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
                aria-current={activePath === "/work" ? "page" : undefined}
                className="relative isolate px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
              >
                {activePath === "/work" && <motion.span layoutId="primary-nav-active" className="absolute inset-0 -z-10 rounded-full bg-[var(--theme-nav-hover)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                Work
              </Link>

              <Link
                href="/company"
                aria-current={activePath === "/company" ? "page" : undefined}
                className="relative isolate px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
              >
                {activePath === "/company" && <motion.span layoutId="primary-nav-active" className="absolute inset-0 -z-10 rounded-full bg-[var(--theme-nav-hover)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                Company
              </Link>

              <Link
                href="/blog"
                aria-current={activePath === "/blog" ? "page" : undefined}
                className="relative isolate px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
              >
                {activePath === "/blog" && <motion.span layoutId="primary-nav-active" className="absolute inset-0 -z-10 rounded-full bg-[var(--theme-nav-hover)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                Blog
              </Link>

              <Link
                href="/contact"
                aria-current={activePath === "/contact" ? "page" : undefined}
                className="relative isolate px-4 py-2 rounded-full text-sm font-normal text-[#45474D] hover:text-[#121317] hover:bg-[#B7BFD9]/20 transition-colors"
              >
                {activePath === "/contact" && <motion.span layoutId="primary-nav-active" className="absolute inset-0 -z-10 rounded-full bg-[var(--theme-nav-hover)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                Contact
              </Link>
            </nav>

            {/* Right Action + < 1024px Hamburger Toggle (>= 44x44px tap target) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="/contact"
                aria-current={activePath === "/contact" ? "page" : undefined}
                className="hidden sm:inline-flex items-center gap-2 px-5 min-h-[44px] lg:min-h-0 lg:py-2.5 rounded-full bg-[#121317] hover:bg-[#2F3034] text-white text-xs sm:text-sm font-medium tracking-normal transition-all duration-150 shadow-sm"
              >
                <span>Start Your Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
              </Link>

              <button
                ref={hamburgerBtnRef}
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                className="lg:hidden w-11 h-11 inline-flex items-center justify-center rounded-full text-[#121317] hover:bg-[#B7BFD9]/20 active:bg-[#B7BFD9]/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
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
      </div>

      {/* Desktop (>= 1024px) Mega-Menu — Unchanged */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: MOTION_EASE.cinematicOut }}
            onMouseLeave={() => setMegaMenuOpen(false)}
            className="hidden lg:block absolute left-0 right-0 mt-3 px-8 sm:px-12 lg:px-16 z-50"
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
                aria-current={activePath === "/work" ? "page" : undefined}
                      onClick={() => setMegaMenuOpen(false)}
                      className="text-[#45474D] hover:text-[#121317] font-mono transition-colors"
                    >
                      All Concept Builds →
                    </Link>
                    <Link
                      href="/contact"
                aria-current={activePath === "/contact" ? "page" : undefined}
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

      {/* Mobile & Tablet (< 1024px) Full-Height Accessible Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            ref={drawerRef}
            id="mobile-nav-drawer"
            aria-label="Mobile Navigation"
            data-lenis-prevent
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: MOTION_EASE.cinematicOut }}
            style={{
              height: "calc(100dvh - var(--nav-h, 68px))",
              paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
              paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
              paddingBottom:
                "calc(max(24px, env(safe-area-inset-bottom, 0px) + 16px))",
            }}
            className="lg:hidden bg-[#FFFFFF] border-b border-[#212226]/[0.08] overflow-y-auto overscroll-contain flex flex-col justify-between"
          >
            <div className="max-w-2xl w-full mx-auto px-2 sm:px-4 pt-4 pb-6 space-y-2">
              {/* Services Accordion (>= 44x44px toggle & item tap targets) */}
              <div className="rounded-2xl border border-[#212226]/[0.08] bg-[#F8F9FC]/70 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((prev) => !prev)}
                  aria-expanded={mobileServicesOpen}
                  aria-controls="mobile-services-accordion"
                  className="w-full min-h-[52px] px-4 flex items-center justify-between text-left text-base font-semibold text-[#121317] hover:bg-[#EFF2F7]/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3186FF]"
                >
                  <span className="flex items-center gap-2.5">
                    <span>Services</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#212226]/[0.08] text-[#3186FF]">
                      04
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#45474D] transition-transform duration-200 ${
                      mobileServicesOpen ? "rotate-180 text-[#3186FF]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {mobileServicesOpen && (
                    <motion.div
                      id="mobile-services-accordion"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {servicesData.map((s, idx) => (
                          <Link
                            key={s.id}
                            href={`/services/${s.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 min-h-[48px] px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#212226]/[0.07] text-sm text-[#121317] hover:border-[#3186FF]/40 active:scale-[0.99] transition-all"
                          >
                            <span className="font-mono text-xs text-[#3186FF] font-bold shrink-0">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className="shrink-0">
                              {iconMap[s.iconName]}
                            </span>
                            <span className="font-semibold truncate">
                              {s.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Primary Page Links (each >= 48px height) */}
              <div className="divide-y divide-[#212226]/[0.07] border-y border-[#212226]/[0.07]">
                <Link
                  href="/work"
                aria-current={activePath === "/work" ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[52px] px-2 flex items-center justify-between text-base font-semibold text-[#121317] hover:text-[#3186FF] transition-colors"
                >
                  <span>Work (Concept Builds)</span>
                  <ArrowUpRight className="w-4 h-4 text-[#6A6A71]" />
                </Link>
                <Link
                  href="/company"
                aria-current={activePath === "/company" ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[52px] px-2 flex items-center justify-between text-base font-semibold text-[#121317] hover:text-[#3186FF] transition-colors"
                >
                  <span>Company</span>
                  <ArrowUpRight className="w-4 h-4 text-[#6A6A71]" />
                </Link>
                <Link
                  href="/blog"
                aria-current={activePath === "/blog" ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[52px] px-2 flex items-center justify-between text-base font-semibold text-[#121317] hover:text-[#3186FF] transition-colors"
                >
                  <span>Blog</span>
                  <ArrowUpRight className="w-4 h-4 text-[#6A6A71]" />
                </Link>
                <Link
                  href="/contact"
                aria-current={activePath === "/contact" ? "page" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[52px] px-2 flex items-center justify-between text-base font-semibold text-[#121317] hover:text-[#3186FF] transition-colors"
                >
                  <span>Contact</span>
                  <ArrowUpRight className="w-4 h-4 text-[#6A6A71]" />
                </Link>
              </div>
            </div>

            {/* Bottom Reachable CTA + Studio Locations */}
            <div className="max-w-2xl w-full mx-auto px-2 sm:px-4 pt-3 border-t border-[#212226]/[0.07]">
              <Link
                href="/contact"
                aria-current={activePath === "/contact" ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full min-h-[50px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm sm:text-base font-semibold bg-[#121317] hover:bg-[#2F3034] active:scale-[0.99] text-white shadow-[0_10px_28px_rgba(18,19,23,0.18)] transition-all"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="mt-3 text-center text-[11px] font-mono text-[#6A6A71]">
                Kuopio, Finland • Lahore, Pakistan
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
