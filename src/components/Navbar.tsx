"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { servicesData } from "@/data/services";
import { headerNavLinks } from "@/data/navigation";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Cpu,
  Bot,
  Globe,
  Layout,
  Cloud,
  Shield,
  Layers,
  FileText,
  Activity,
  Code
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on click outside or escape key
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
          ? "bg-[#030303]/90 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-2xl shadow-black/80"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Wordmark */}
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
                AXIOM LABS
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                AI & Systems Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Services with Mega-Menu Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMegaMenuOpen(!megaMenuOpen);
                  setResourcesOpen(false);
                }}
                onMouseEnter={() => setMegaMenuOpen(true)}
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
                    megaMenuOpen ? "rotate-180 text-brand-primary" : "text-zinc-400"
                  }`}
                />
              </button>
            </div>

            {/* Direct Links */}
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

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setResourcesOpen(!resourcesOpen);
                  setMegaMenuOpen(false);
                }}
                onMouseEnter={() => setResourcesOpen(true)}
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
                    resourcesOpen ? "rotate-180 text-brand-primary" : "text-zinc-400"
                  }`}
                />
              </button>

              {/* Resources Dropdown Menu */}
              {resourcesOpen && (
                <div
                  onMouseLeave={() => setResourcesOpen(false)}
                  className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/[0.1] p-3 shadow-2xl shadow-black/90 animate-fade-in"
                >
                  <div className="space-y-1">
                    <Link
                      href="/resources/vendor-matrix"
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-brand-primary/40">
                        <Layers className="w-4 h-4 text-brand-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                          AI Vendor Matrix
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-mono">
                            Interactive
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          Compare models, deployment & privacy
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/open-axiom"
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-emerald-500/40">
                        <Code className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                          Open Axiom
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          Open-source agent skills & templates
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/blog"
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-blue-500/40">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          Technical Blog
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          Architecture blueprints & model evals
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/demos/threat-monitor"
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-purple-500/40">
                        <Activity className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                          Interactive Labs
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">
                          Live threat monitor & vector search
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="px-3.5 py-2 rounded-full text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-all shadow-md hover:shadow-brand-primary/20"
            >
              Start Project
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Services Mega-Menu Dropdown Panel */}
      {megaMenuOpen && (
        <div
          onMouseLeave={() => setMegaMenuOpen(false)}
          className="hidden md:block absolute top-full left-0 right-0 bg-[#08080c]/95 backdrop-blur-2xl border-b border-white/[0.1] shadow-2xl shadow-black/90 animate-fade-in"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: 6 Services Grid */}
              <div className="col-span-8">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Core Capabilities & Engineering
                  </span>
                  <Link
                    href="/#services"
                    onClick={() => setMegaMenuOpen(false)}
                    className="text-xs text-brand-primary hover:text-brand-muted font-medium flex items-center gap-1 transition-colors"
                  >
                    View All Capabilities
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {servicesData.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="group p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] hover:border-brand-primary/30 transition-all flex items-start gap-3.5"
                    >
                      <div className="p-2.5 rounded-lg bg-[#0e0e14] border border-white/[0.08] group-hover:border-brand-primary/40 group-hover:scale-105 transition-all">
                        {iconMap[service.iconName] || <Cpu className="w-5 h-5 text-brand-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">
                            {service.title}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                            {service.badge}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {service.shortDesc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right Column: Featured Project Highlight */}
              <div className="col-span-4 border-l border-white/[0.08] pl-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                      Featured Milestone
                    </span>
                  </div>
                  <div className="p-5 rounded-xl border border-brand-primary/20 bg-gradient-to-b from-brand-primary/10 via-brand-muted/5 to-transparent">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-primary font-semibold">
                      Case Study Dossier
                    </span>
                    <h5 className="text-base font-semibold text-white mt-1.5 mb-2">
                      Strata Systems: Autonomous Incident Triage
                    </h5>
                    <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                      84% reduction in tier-1 outage MTTR with private agent mesh and verifiable canary remediation.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-4">
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white">84% MTTR</span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white">50k+ Nodes</span>
                    </div>
                    <Link
                      href="/work/strata-systems"
                      onClick={() => setMegaMenuOpen(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-primary/30 hover:bg-brand-primary/50 px-3.5 py-2 rounded-lg border border-brand-primary/40 transition-all"
                    >
                      Read Full Dossier
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                  <span>Questions about architecture?</span>
                  <Link
                    href="/contact"
                    onClick={() => setMegaMenuOpen(false)}
                    className="text-white hover:text-brand-primary underline transition-colors"
                  >
                    Speak with an Architect
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bottom-0 bg-[#060608]/98 backdrop-blur-2xl border-b border-white/[0.1] overflow-y-auto p-6 flex flex-col justify-between animate-fade-in z-50">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                Navigation
              </span>
              <div className="flex flex-col space-y-1">
                <Link
                  href="/work"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/[0.08]"
                >
                  Work (Case Studies)
                </Link>
                <Link
                  href="/company"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/[0.08]"
                >
                  Company & Story
                </Link>
                <Link
                  href="/resources/vendor-matrix"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/[0.08]"
                >
                  AI Vendor Matrix
                </Link>
                <Link
                  href="/open-axiom"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/[0.08]"
                >
                  Open Axiom (Open Source)
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/[0.08]"
                >
                  Technical Blog
                </Link>
                <Link
                  href="/demos/threat-monitor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-brand-primary hover:bg-white/[0.08] flex items-center justify-between"
                >
                  Interactive Labs
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary">
                    Live Demo
                  </span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/[0.08]"
                >
                  Contact & Consultation
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-3">
                Services
              </span>
              <div className="grid grid-cols-1 gap-2">
                {servicesData.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm text-zinc-200"
                  >
                    <span>{service.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.08] mt-6">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-semibold text-sm uppercase tracking-wider"
            >
              Start Project Inquiry
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
