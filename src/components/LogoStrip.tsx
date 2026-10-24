import React from "react";
import { clientLogos } from "@/data/navigation";

export default function LogoStrip() {
  // Duplicate array to create a seamless infinite marquee loop
  const repeatedLogos = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <section
      className="py-12 border-y border-white/[0.06] bg-[#040405] overflow-hidden relative"
      aria-label="Trusted Industry Partners and Clients"
    >
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Trusted By Engineering Teams Worldwide
        </span>
      </div>

      {/* Marquee Track Container */}
      <div className="relative w-full overflow-hidden flex items-center">
        {/* Left & Right Gradient Blur Masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#040405] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#040405] to-transparent z-10" />

        {/* Moving Flex Row */}
        <div className="flex shrink-0 items-center gap-12 sm:gap-16 animate-marquee py-2 whitespace-nowrap">
          {repeatedLogos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors duration-200 cursor-default select-none"
            >
              <span className="font-mono text-sm sm:text-base font-bold tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity">
                {logo.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
