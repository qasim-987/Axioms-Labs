import React from "react";
import { clientLogos } from "@/data/navigation";

export default function LogoStrip() {
  const repeatedLogos = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <section
      className="pt-14 pb-0 border-y border-white/[0.06] bg-[#040405] overflow-hidden relative"
      aria-label="Trusted Industry Partners and Clients"
    >
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 mb-6 text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block">
          Trusted by Industry Leaders
        </span>
        <span className="text-[11px] text-zinc-500 mt-1 block">
          Powering Autonomous Innovation for Engineering Teams Worldwide
        </span>
      </div>

      {/* Dual Edge Alpha-Masked Seamless Marquee inside Balanced Container */}
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="relative w-full overflow-hidden flex items-center marquee-alpha-mask">
          <div className="flex shrink-0 items-center gap-12 sm:gap-16 animate-marquee hover:[animation-play-state:paused] py-3 whitespace-nowrap">
            {repeatedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors duration-200 cursor-default select-none"
              >
                <span className="font-mono text-sm sm:text-base font-bold tracking-widest uppercase opacity-75 hover:opacity-100 transition-opacity">
                  {logo.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centered Planetary Horizon Rim-Light Arc (clientsLightCurve parity) */}
      <div
        aria-hidden="true"
        className="w-full flex justify-center overflow-hidden pointer-events-none"
      >
        <div className="horizon-light-curve animate-pulse-glow shrink-0" />
      </div>
    </section>
  );
}
