"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BrandNavbar from "./BrandNavbar";
import ServicePageGlare from "./ServicePageGlare";
import ContactForm from "./ContactForm";
import type { Service } from "@/data/brand";
import { BRAND } from "@/lib/landingConfig";

/**
 * Service page (Part D): violet diagonal glow + dithered background, eyebrow +
 * H1 with one italic gradient word, paragraph, primary/outline buttons on the
 * left; "Get started" form card on the right. One H1 per page.
 */
export default function ServicePageClient({ service }: { service: Service }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const violet = BRAND.violet.replace("#", "");
  const violetDark = BRAND.violetDark.replace("#", "");

  return (
    <div className="relative min-h-svh flex flex-col">
      <ServicePageGlare />
      <BrandNavbar />

      <main
        className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 pt-20 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left column: copy + CTAs. */}
          <div className="lg:col-span-6">
            <p className="inline-block mb-4 uppercase tracking-[0.18em] text-xs font-bold text-[#6C6FD8]">
              {service.eyebrow}
            </p>
            <h1
              data-focus-heading
              tabIndex={-1}
              className={`text-5xl sm:text-6xl font-light tracking-tight leading-[1.05] text-white mb-6 uppercase`}
              style={{
                marginLeft: mounted ? 0 : 0,
                opacity: mounted ? 1 : 0,
                transform: `translateY(${mounted ? 0 : 12}px)`,
                transition: `all 0.6s ${mounted ? "0.2s" : "0s"} ease`,
              }}
            >
              {service.title.split(" ").map((word, i) => {
                const highlight = service.highlightWord && word.toLowerCase() === service.highlightWord.toLowerCase();
                return (
                  <span
                    key={i}
                    className={`inline-block ${highlight ? "italic font-bold" : "font-light"}`}
                    style={
                      highlight
                        ? {
                            background: `linear-gradient(135deg, ${BRAND.violet}, ${BRAND.violetDark})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }
                        : {}
                    }
                  >
                    {word}
                    {i < service.title.split(" ").length - 1 ? " " : null}
                  </span>
                );
              })}
            </h1>
            <p className="text-white/70 leading-relaxed text-sm sm:text-base mb-8 max-w-xl">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.violet}, ${BRAND.violetDark})`,
                  boxShadow: `0 0 40px ${BRAND.ctaGlow}`,
                }}
              >
                Start Your Project
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white border border-white/20 transition-all hover:bg-white/10"
              >
                View Work
              </Link>
            </div>
          </div>

          {/* Right column: Get started form card. */}
          <div className="lg:col-span-5">
            <div className="relative rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
              <h3 className="text-sm font-mono uppercase tracking-widest text-white/60 mb-6">
                Get started
              </h3>
              <ContactForm serviceSlug={service.slug} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
