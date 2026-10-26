"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CaseStudies() {
  const [hoveredCard, setHoveredCard] = useState<1 | 2 | null>(null);

  return (
    <section
      id="work"
      aria-label="Selected Case Studies"
      className="relative w-full bg-[#000000] text-white border-t border-white/15 pt-10 sm:pt-14 pb-20 sm:pb-28"
    >
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 w-full">
        {/* 50/50 Two-Card Grid with 24px (gap-6) gutter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* ==============================================================
              PROJECT CARD 01 — DARK STUDIO CARD (Axiom Studio: Strata Systems)
             ============================================================== */}
          <div className="flex flex-col w-full">
            <span className="block text-[20px] leading-none font-light text-white tracking-tight mb-3.5 select-none">
              01
            </span>

            <Link
              href="/work/strata-systems"
              data-cursor="view-work"
              data-cursor-label="View Work"
              onPointerEnter={() => setHoveredCard(1)}
              onPointerLeave={() =>
                setHoveredCard((prev) => (prev === 1 ? null : prev))
              }
              onFocus={() => setHoveredCard(1)}
              onBlur={() =>
                setHoveredCard((prev) => (prev === 1 ? null : prev))
              }
              className="group relative block w-full h-[460px] sm:h-[540px] md:h-[580px] lg:h-[650px] bg-[#000000] overflow-hidden cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              <span className="sr-only">
                View Work — Strata Systems Autonomous Cloud Supervision Case
                Study
              </span>

              {/* Tool Icon Badge ("Ps", 26x26px) at top-left under "01", fades in over 200ms ONLY while hovered */}
              <div
                aria-hidden="true"
                className={`absolute top-3 left-3 z-20 w-[26px] h-[26px] rounded-[5px] bg-[#001e36] border border-[#31a8ff]/35 flex items-center justify-center pointer-events-none transition-opacity duration-200 ease-out ${
                  hoveredCard === 1 ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="text-[#31a8ff] font-bold text-[12px] leading-none tracking-tight">
                  Ps
                </span>
              </div>

              {/* Subtle 1.015 hover scale over 600ms — cropped cleanly at bottom edge */}
              <div className="relative w-full h-full flex flex-col justify-end pt-14 sm:pt-20 pl-4 sm:pl-7 pr-0 overflow-hidden transition-transform duration-[600ms] ease-out group-hover:scale-[1.015] origin-bottom">
                {/* Perspective Angled Dark Studio Display Frame (cropped at bottom of card) */}
                <div
                  className="relative w-[104%] h-[86%] rounded-tl-[18px] bg-[#0d0a08] border-t border-l border-white/[0.14] shadow-[0_-20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between"
                  style={{
                    transform:
                      "perspective(1500px) rotateY(-5deg) rotateX(1.5deg)",
                    transformOrigin: "bottom right",
                  }}
                >
                  {/* Warm Copper-Amber Volumetric Studio Backlight */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `
                        radial-gradient(ellipse 68% 75% at 18% 58%, rgba(168, 78, 16, 0.58) 0%, rgba(92, 40, 8, 0.34) 42%, rgba(8, 5, 3, 0.96) 80%),
                        radial-gradient(ellipse 55% 48% at 52% 92%, rgba(204, 102, 24, 0.42) 0%, transparent 70%),
                        linear-gradient(180deg, #120a05 0%, #090503 55%, #030202 100%)
                      `,
                    }}
                  />

                  {/* Subtle Architectural Grid Lines inside Screen */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.16) 1px, transparent 1px)",
                      backgroundSize: "64px 64px",
                    }}
                  />

                  {/* Top Web Navigation Bar inside Strata Systems Mockup */}
                  <div className="relative z-10 flex items-center justify-between px-5 sm:px-8 pt-4 sm:pt-5 pb-3 text-[10px] sm:text-[11px] text-amber-100/75">
                    <span className="font-mono font-semibold tracking-[0.22em] uppercase text-amber-100/90">
                      STRATA•OS
                    </span>
                    <div className="hidden sm:flex items-center gap-5 text-[10px] text-amber-100/55">
                      <span>Mesh</span>
                      <span>Platform</span>
                      <span>Telemetry</span>
                      <span>Security</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-amber-200/20 text-[9px] sm:text-[10px] text-amber-100/85">
                      Deploy Node
                    </span>
                  </div>

                  {/* Center Display Headline (Axiom Studio's Strata Systems Project) */}
                  <div className="relative z-10 text-center px-5 sm:px-10 mt-2 sm:mt-4">
                    <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-light text-white tracking-tight leading-[1.15]">
                      Autonomous Mesh for
                      <br />
                      <span className="font-medium text-white">
                        Modern Cloud Supervision.
                      </span>
                    </h3>
                  </div>

                  {/* Sculpted Obsidian Smart Telemetry Hardware Unit Cropped at Bottom */}
                  <div className="relative z-10 mx-auto mt-auto pt-5 flex justify-center w-full">
                    <div className="relative w-[190px] sm:w-[235px] h-[145px] sm:h-[175px] translate-y-4 rounded-t-[38px] bg-gradient-to-b from-[#2a2420] via-[#110f0e] to-[#050505] p-[3px] shadow-[0_-10px_45px_rgba(217,119,36,0.28)]">
                      {/* Metallic Rim Highlight */}
                      <div className="w-full h-full rounded-t-[35px] bg-gradient-to-b from-[#171412] via-[#090808] to-[#020202] border-t border-x border-amber-200/25 flex flex-col items-center justify-start pt-5 sm:pt-6 px-5 relative overflow-hidden">
                        {/* Side Hardware Crown Button */}
                        <div className="absolute -right-1 top-12 w-1.5 h-8 rounded-l bg-zinc-600/60" />
                        <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.28em] uppercase text-amber-200/55">
                          STRATA MESH
                        </span>
                        <span className="mt-2 text-2xl sm:text-[28px] font-semibold font-mono tracking-wider text-white tabular-nums">
                          10:15
                        </span>
                        <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[8px] font-mono text-amber-100/80 uppercase tracking-wider">
                            99.99% SLA
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* ==============================================================
              PROJECT CARD 02 — LIGHT GRAY #e8e8e8 CARD (Axiom Studio: Zenith Health)
             ============================================================== */}
          <div className="flex flex-col w-full">
            <span className="block text-[20px] leading-none font-light text-white tracking-tight mb-3.5 select-none">
              02
            </span>

            <Link
              href="/work/zenith-health"
              data-cursor="view-work"
              data-cursor-label="View Work"
              onPointerEnter={() => setHoveredCard(2)}
              onPointerLeave={() =>
                setHoveredCard((prev) => (prev === 2 ? null : prev))
              }
              onFocus={() => setHoveredCard(2)}
              onBlur={() =>
                setHoveredCard((prev) => (prev === 2 ? null : prev))
              }
              className="group relative block w-full h-[460px] sm:h-[540px] md:h-[580px] lg:h-[650px] bg-[#e8e8e8] overflow-hidden cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              <span className="sr-only">
                View Work — Zenith Health Autonomous Clinical Diagnostics Case
                Study
              </span>

              {/* Tool Icon Badge ("Ps", 26x26px) at top-left under "02", fades in over 200ms ONLY while hovered */}
              <div
                aria-hidden="true"
                className={`absolute top-3 left-3 z-20 w-[26px] h-[26px] rounded-[5px] bg-[#001e36] border border-[#31a8ff]/35 flex items-center justify-center pointer-events-none transition-opacity duration-200 ease-out ${
                  hoveredCard === 2 ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="text-[#31a8ff] font-bold text-[12px] leading-none tracking-tight">
                  Ps
                </span>
              </div>

              {/* Subtle Studio Ambient Vignette on #e8e8e8 */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 75% at 50% 48%, rgba(255,255,255,0.45) 0%, rgba(232,232,232,0) 65%, rgba(196,198,204,0.45) 100%)",
                }}
              />

              {/* Subtle 1.015 hover scale over 600ms — iMac stand cropped cleanly at bottom edge */}
              <div className="relative w-full h-full flex flex-col items-center justify-end pt-12 sm:pt-16 px-5 sm:px-9 overflow-hidden transition-transform duration-[600ms] ease-out group-hover:scale-[1.015] origin-bottom">
                {/* 27-inch Studio iMac Desktop Mockup */}
                <div className="relative w-full max-w-[540px] flex flex-col items-center">
                  {/* Glossy Black Outer Display Bezel */}
                  <div className="relative w-full rounded-t-[16px] bg-[#0b0c0f] p-[10px] sm:p-[13px] pb-0 border-t border-x border-black/80 shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
                    {/* iSight Camera Dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1f2430] mx-auto mb-1.5" />

                    {/* Active Screen Viewport */}
                    <div className="relative w-full h-[235px] sm:h-[290px] lg:h-[345px] bg-[#0c131c] overflow-hidden flex flex-col justify-between">
                      {/* Multi-Tone Industrial / Clinical Robotics Lab Perspective Scene (creates dynamic split inversion under difference cursor) */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 600 380"
                        preserveAspectRatio="xMidYMid slice"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <defs>
                          <linearGradient
                            id="zenithCeiling"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#0b121b" />
                            <stop offset="52%" stopColor="#162230" />
                            <stop offset="100%" stopColor="#0c1117" />
                          </linearGradient>
                          <linearGradient
                            id="zenithRailLight"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#9fb3c8" />
                            <stop offset="50%" stopColor="#52657a" />
                            <stop offset="100%" stopColor="#1b2430" />
                          </linearGradient>
                        </defs>
                        <rect
                          width="600"
                          height="380"
                          fill="url(#zenithCeiling)"
                        />
                        {/* Architectural Ceiling Trusses */}
                        <g stroke="#2c3e52" strokeWidth="1.5" opacity="0.55">
                          <line x1="0" y1="58" x2="600" y2="58" />
                          <line x1="0" y1="92" x2="600" y2="92" />
                          <line x1="90" y1="0" x2="220" y2="165" />
                          <line x1="510" y1="0" x2="380" y2="165" />
                          <line x1="200" y1="0" x2="265" y2="165" />
                          <line x1="400" y1="0" x2="335" y2="165" />
                        </g>
                        {/* Bright Cleanroom Overhead Light Strips */}
                        <g opacity="0.65">
                          <polygon
                            points="155,48 180,48 250,150 238,150"
                            fill="#dbeafe"
                          />
                          <polygon
                            points="445,48 420,48 350,150 362,150"
                            fill="#dbeafe"
                          />
                        </g>
                        {/* Perspective Lab Diagnostic Gantry & Conveyor Rails */}
                        <polygon
                          points="40,380 235,195 365,195 560,380"
                          fill="#121922"
                        />
                        <polygon
                          points="95,380 252,202 276,202 158,380"
                          fill="url(#zenithRailLight)"
                          opacity="0.7"
                        />
                        <polygon
                          points="505,380 348,202 324,202 442,380"
                          fill="url(#zenithRailLight)"
                          opacity="0.7"
                        />
                        {/* Center Metallic Track Ties */}
                        <g stroke="#64748b" strokeWidth="2" opacity="0.55">
                          <line x1="238" y1="225" x2="362" y2="225" />
                          <line x1="215" y1="255" x2="385" y2="255" />
                          <line x1="186" y1="292" x2="414" y2="292" />
                          <line x1="150" y1="336" x2="450" y2="336" />
                        </g>
                        {/* Warm Diagnostic Status Beacons on Left Bay */}
                        <rect
                          x="118"
                          y="176"
                          width="42"
                          height="54"
                          rx="4"
                          fill="#d9dbe0"
                          opacity="0.78"
                        />
                        <circle
                          cx="196"
                          cy="205"
                          r="7"
                          fill="#eab308"
                          opacity="0.85"
                        />
                        {/* Cool Steel Module on Right Bay */}
                        <rect
                          x="432"
                          y="182"
                          width="115"
                          height="92"
                          rx="6"
                          fill="#94a3b8"
                          opacity="0.45"
                        />
                      </svg>

                      {/* Dark Vignette Scrim for Crisp Headline Readability */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-b from-[#070d14]/90 via-[#0a121b]/45 to-[#070b10]/70 pointer-events-none"
                      />

                      {/* Dark Top Navbar inside Screen (produces sharp split-circle inversion on #e8e8e8 card) */}
                      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#080e16]/90 border-b border-white/10 text-[9px] sm:text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1d63dc] text-white font-bold text-[8px] flex items-center justify-center">
                            ZH
                          </span>
                          <span className="font-mono font-semibold tracking-wider text-white">
                            ZENITH
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-3.5 text-[8px] font-mono uppercase tracking-wider text-zinc-300">
                          <span>Platform</span>
                          <span>Clinical AI</span>
                          <span>Triage</span>
                          <span>Compliance</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[8px]">
                          Contact ↗
                        </span>
                      </div>

                      {/* Center Screen Headline (Axiom Studio's Zenith Health Project) */}
                      <div className="relative z-10 my-auto text-center px-4 sm:px-8">
                        <h3 className="text-lg sm:text-2xl lg:text-[25px] font-normal text-white tracking-tight leading-[1.2] drop-shadow">
                          Creating the New
                          <br />
                          Standard for Autonomous
                          <br />
                          <span className="font-semibold">
                            Clinical AI &amp; Diagnostics.
                          </span>
                        </h3>

                        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/90 text-[#0b1017] text-[9px] font-semibold tracking-wide">
                          <span>Learn More</span>
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      <div className="relative z-10 h-3" />
                    </div>
                  </div>

                  {/* Brushed Silver Aluminum iMac Chin */}
                  <div className="w-full h-9 sm:h-11 rounded-b-[14px] bg-gradient-to-b from-[#d8dade] via-[#cfd2d7] to-[#bfc3ca] border-x border-b border-black/15 flex items-center justify-center shadow-md">
                    {/* Minimalist Dark Studio Mark on Chin */}
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#232529] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#cfd2d7]" />
                    </div>
                  </div>

                  {/* Tapered Silver Aluminum Stand (cropped cleanly at bottom of card) */}
                  <div className="relative w-24 sm:w-28 h-12 sm:h-14 bg-gradient-to-b from-[#aeb2ba] via-[#cfd2d8] to-[#b5b9c2] [clip-path:polygon(14%_0%,86%_0%,100%_100%,0%_100%)] shadow-inner" />
                  <div className="w-36 sm:w-44 h-2 rounded-full bg-gradient-to-r from-black/10 via-[#d8dbe0] to-black/10 shadow-[0_4px_12px_rgba(0,0,0,0.22)]" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
