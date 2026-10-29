"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAppReady } from "@/hooks/useAppReady";
import { useIntroContext } from "@/lib/introContext";
import { INTRO } from "@/lib/landingConfig";
import { NAV_LINKS, NAV_CTA } from "@/data/brand";

function Dropdown({ items, open }: { items: { label: string; href: string }[]; open: boolean }) {
  const [hovered, setHovered] = useState(false);
  const expanded = open || hovered;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-normal text-white/90 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        {items[0]?.label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div
          role="menu"
          className="absolute left-1/2 -ml-24 mt-2 w-48 rounded-xl border border-white/10 bg-[#0A0B0F]/80 backdrop-blur-md p-2 shadow-2xl"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setHovered(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrandNavbar() {
  const prefersReduced = useReducedMotion();
  const appReady = useAppReady();
  const { registerElement, registerTimeline } = useIntroContext();
  const navRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [entered, setEntered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Normal intro: 1.00s navigation slides down & fades in (element tween);
  // 1.55s pill button: greyed first, then settles to normal (custom timeline).
  useEffect(() => {
    const unregisterNav = registerElement("nav", navRef);
    const unregisterBtn = registerTimeline(
      "navButton",
      () =>
        gsap.timeline({ paused: true }).fromTo(
          ctaRef.current,
          { autoAlpha: 0.45, filter: "grayscale(1)" },
          {
            autoAlpha: 1,
            filter: "grayscale(0)",
            duration: INTRO.navButton.dur,
            ease: INTRO.navButton.ease,
            clearProps: "autoAlpha,filter",
          }
        )
    );
    return () => {
      unregisterNav();
      unregisterBtn();
    };
  }, [registerElement, registerTimeline]);

  // Reduced motion: simple 200ms fade-in, no slide, no greyed button state.
  useEffect(() => {
    if (!prefersReduced) return undefined;
    const timer = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  // Close dropdowns on Escape or clicks outside.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      const el = document.getElementById("site-nav");
      if (el && !el.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const hidden = !appReady && !prefersReduced;

  return (
    <header
      id="site-nav"
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        visibility: hidden ? "hidden" : "visible",
        opacity: prefersReduced ? (entered ? 1 : 0) : undefined,
        // Before the intro plays, the nav sits 12px above its final place.
        transform: prefersReduced || hidden ? undefined : "translateY(-12px)",
      }}
    >
      <div
        className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16"
        style={{
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <div className="flex items-center justify-between gap-3 py-3 lg:py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 min-h-[44px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-lg"
            aria-label="[NAME] home"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="[NAME] wordmark mark"
              focusable="false"
            >
              <rect width="36" height="36" rx="11" fill="#05060A" stroke="white" strokeWidth="1" />
              <defs>
                <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6C6FD8" />
                  <stop offset="100%" stopColor="#4B4FD0" />
                </linearGradient>
              </defs>
              <mask id="logoMask">
                <rect width="36" height="36" rx="11" fill="white" />
                <rect x="9" y="9" width="18" height="18" rx="5" fill="black" />
              </mask>
              <text
                x="18"
                y="24"
                textAnchor="middle"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontSize="12"
                fontWeight="700"
                letterSpacing="0.05em"
                fill="url(#beam)"
                mask="url(#logoMask)"
              >
                [NAME]
              </text>
            </svg>
          </Link>

          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1.5">
            {NAV_LINKS.map((item: (typeof NAV_LINKS)[number]) => {
              if (item.items) {
                return (
                  <Dropdown
                    key={item.label}
                    items={item.items}
                    open={dropdownOpen}
                  />
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2.5 rounded-full text-sm font-normal text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              ref={ctaRef}
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full border border-white/20 bg-white/5 text-white text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                opacity: prefersReduced ? (entered ? 1 : 0) : undefined,
              }}
            >
              <span>{NAV_CTA}</span>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#05060A] ml-1">
                <ArrowUpRight className="w-3 h-3 stroke-[2.2]" />
              </div>
            </Link>

            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={dropdownOpen}
              className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              onClick={() => setDropdownOpen((p) => !p)}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
