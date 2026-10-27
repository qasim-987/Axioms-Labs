"use client";

import React from "react";
import { motion } from "framer-motion";
import { clientLogos } from "@/data/navigation";
import { MOTION_EASE } from "@/lib/motionTokens";

export default function LogoStrip() {
  const marqueeItems = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <section
      aria-label="Modern Engineering & Design Stack"
      className="relative py-14 sm:py-16 overflow-hidden bg-[#F8F9FC] border-y border-[#212226]/[0.06]"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: MOTION_EASE.cinematicOut }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center"
      >
        <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.22em] text-[#45474D]">
          BUILT WITH MODERN PRODUCTION DESIGN &amp; WEB TECHNOLOGIES
        </p>
      </motion.div>

      <div className="relative flex overflow-x-hidden group max-w-6xl mx-auto marquee-alpha-mask">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap items-center gap-12 sm:gap-16 py-2">
          {marqueeItems.map((partner, idx) => (
            <div
              key={`${partner.name}-${idx}`}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.07] text-[#45474D] hover:text-[#121317] hover:border-[#3186FF]/30 shadow-sm transition-all duration-300 select-none cursor-default"
            >
              <span className="text-xs sm:text-sm font-mono font-semibold tracking-wider text-[#121317]">
                {partner.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Antigravity Horizon Light Curve */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.92 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: MOTION_EASE.cinematicOut }}
        className="relative w-full flex justify-center overflow-hidden -mb-14"
      >
        <div className="horizon-light-curve" aria-hidden="true" />
      </motion.div>
    </section>
  );
}
