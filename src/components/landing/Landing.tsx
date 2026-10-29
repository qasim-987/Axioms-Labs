"use client";

import React, { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BrandNavbar from "./BrandNavbar";
import LightBeam from "./LightBeam";
import Watermark from "./Watermark";
import ParticleSphere from "./ParticleSphere";
import SplitHeadline from "./SplitHeadline";
import IntroController from "./IntroController";
import StatsRow from "./StatsRow";
import ServicesSection from "./ServicesSection";
import { useIntroContext } from "@/lib/introContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAppReady } from "@/hooks/useAppReady";
import { HERO_EXIT, BRAND } from "@/lib/landingConfig";
import { BRAND_SUBTEXT, BRAND_HEADLINE, NAV_CTA } from "@/data/brand";

gsap.registerPlugin(ScrollTrigger);

/**
 * The landing page: hero (A1–A6) followed by the pinned services section (B).
 * Rendered inside IntroController so every hero part shares one master
 * page-load timeline.
 */
export default function Landing() {
  const prefersReduced = useReducedMotion();
  const appReady = useAppReady();
  const { registerElement } = useIntroContext();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sphereWrapRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Everything except the watermark starts hidden (visibility, not display —
  // no layout shift); the master intro timeline reveals each part.
  const contentHidden = !appReady && !prefersReduced;

  // Register hero parts with the master intro timeline:
  // 2.30s subtext, 2.60s CTA, 3.00s sphere.
  useEffect(() => {
    if (prefersReduced || !appReady) return undefined;
    const unregisterSubtext = registerElement("subtext", subtextRef);
    const unregisterCta = registerElement("cta", ctaRef);
    const unregisterSphere = registerElement("sphere", sphereWrapRef);
    return () => {
      unregisterSubtext();
      unregisterCta();
      unregisterSphere();
    };
  }, [registerElement, appReady, prefersReduced]);

  // Scroll-exit out of the hero: text/stats/CTA fade up & out; the particle
  // canvas stays, translating left and scaling up, scrubbed to scroll progress.
  useEffect(() => {
    if (prefersReduced || !heroRef.current) return undefined;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: HERO_EXIT.scrub,
          scroller: document.documentElement,
        },
      });

      tl.to(
        contentRef.current,
        { autoAlpha: 0, y: -40, ease: "none" },
        0
      );
      tl.to(
        sphereWrapRef.current,
        {
          x: HERO_EXIT.sphere.x,
          scale: HERO_EXIT.sphere.scale,
          ease: "none",
        },
        0
      );
    }, heroRef.current);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <>
      <BrandNavbar />

      <Watermark />
      <LightBeam />

      {/* Persistent particle sphere behind everything, z-index below text. */}
      <div ref={sphereWrapRef} className="fixed inset-0 pointer-events-none z-1">
        <ParticleSphere className="inset-0" />
      </div>

      <section
        ref={heroRef}
        className="relative w-full min-h-svh overflow-hidden"
        aria-label="Hero"
      >
        <div
          ref={contentRef}
          className="relative z-10 w-full h-full"
          style={{
            visibility: contentHidden ? "hidden" : "visible",
          }}
        >
          {/* Headline: centre-right, overlapping the sphere. Line 2 indented. */}
          <div
            className="absolute left-1/2 top-[42%] -translate-x-1/2 z-20"
            style={{ pointerEvents: contentHidden ? "none" : "auto" }}
          >
            <SplitHeadline
              lines={[BRAND_HEADLINE.line1, BRAND_HEADLINE.line2]}
              lineIndents={["0%", BRAND_HEADLINE.lineIndent]}
            />
          </div>

          {/* Bottom-left: subtext + primary CTA. Bottom-right: stats. */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 px-6 sm:px-8 lg:px-16 pb-6 sm:pb-10 pt-20"
            style={{ pointerEvents: contentHidden ? "none" : "auto" }}
          >
            <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-24">
              <div className="flex flex-col gap-4 max-w-lg">
                <p
                  ref={subtextRef}
                  className="text-sm sm:text-base leading-relaxed text-white/85"
                >
                  {BRAND_SUBTEXT}
                </p>
                <Link
                  ref={ctaRef}
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-medium text-white transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.violet}, ${BRAND.violetDark})`,
                    boxShadow: `0 0 40px ${BRAND.ctaGlow}`,
                  }}
                >
                  {NAV_CTA}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <StatsRow />
            </div>
          </div>
        </div>
      </section>

      <ServicesSection />
    </>
  );
}
