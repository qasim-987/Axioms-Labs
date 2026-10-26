"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import {
  Globe2,
  Server,
  Radio,
  Search,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface DataCenterNode {
  id: string;
  name: string;
  region: string;
  provider: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  fiberRoutes: string[];
  capacityMW: string;
  latencyMs: number;
  pqcSecure: boolean;
}

const dataCenters: DataCenterNode[] = [
  {
    id: "DC-VA",
    name: "Ashburn Metro Hub",
    region: "us-east-1",
    provider: "AWS / Equinix",
    city: "Ashburn, VA",
    country: "USA",
    lat: 39.0438,
    lng: -77.4874,
    mapX: 162,
    mapY: 74,
    fiberRoutes: ["Dunant Subsea", "MAREA Atlantic", "Transatlantic 14"],
    capacityMW: "180 MW",
    latencyMs: 14,
    pqcSecure: true,
  },
  {
    id: "DC-CA",
    name: "Silicon Valley Edge 1",
    region: "us-west-1",
    provider: "Cloudflare / CoreSite",
    city: "San Jose, CA",
    country: "USA",
    lat: 37.3382,
    lng: -121.8863,
    mapX: 92,
    mapY: 78,
    fiberRoutes: ["Pacific Light Cable", "Southern Cross Cable"],
    capacityMW: "120 MW",
    latencyMs: 42,
    pqcSecure: true,
  },
  {
    id: "DC-LDN",
    name: "London Docklands Hub",
    region: "eu-west-2",
    provider: "Telehouse / Azure",
    city: "London",
    country: "UK",
    lat: 51.5074,
    lng: -0.1278,
    mapX: 288,
    mapY: 56,
    fiberRoutes: ["Grace Hopper Cable", "Circe South"],
    capacityMW: "150 MW",
    latencyMs: 76,
    pqcSecure: true,
  },
  {
    id: "DC-FR",
    name: "Frankfurt Rhine-Main",
    region: "eu-central-1",
    provider: "GCP / Interxion",
    city: "Frankfurt",
    country: "Germany",
    lat: 50.1109,
    lng: 8.6821,
    mapX: 316,
    mapY: 60,
    fiberRoutes: ["DE-CIX Core", "Apollo South", "SeaMeWe-5"],
    capacityMW: "210 MW",
    latencyMs: 88,
    pqcSecure: true,
  },
  {
    id: "DC-TYO",
    name: "Tokyo Bay Equinix TY11",
    region: "ap-northeast-1",
    provider: "AWS / Equinix",
    city: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    mapX: 512,
    mapY: 78,
    fiberRoutes: ["JUPITER Trans-Pacific", "FASTER Cable System"],
    capacityMW: "160 MW",
    latencyMs: 132,
    pqcSecure: true,
  },
  {
    id: "DC-SIN",
    name: "Singapore Jurong Edge",
    region: "ap-southeast-1",
    provider: "GCP / ST Telemedia",
    city: "Singapore",
    country: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    mapX: 462,
    mapY: 134,
    fiberRoutes: ["Bifrost Cable", "Echo Trans-Pacific"],
    capacityMW: "140 MW",
    latencyMs: 164,
    pqcSecure: true,
  },
];

export default function InfrastructureAtlasDemoPage() {
  const [selectedNode, setSelectedNode] = useState<DataCenterNode>(
    dataCenters[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredNodes = dataCenters.filter(
    (dc) =>
      dc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dc.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dc.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main
        id="main-content"
        className="relative pt-32 pb-24 px-8 sm:px-12 lg:px-16 max-w-6xl mx-auto w-full flex-1"
      >
        <LightRays />

        {/* Centered Header Block */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono uppercase tracking-wider text-blue-400 mb-6">
            <Globe2 className="w-3.5 h-3.5" />
            Geospatial Network Telemetry
          </div>
          <SplitTextReveal
            as="h1"
            text="Infrastructure Atlas: Global Data Center & Fiber Map"
            accentFromWordIndex={2}
            accentClassName="text-blue-300"
            triggerOnLoad
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          />
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Explore primary compute nodes, low-latency edge points of presence,
            and trans-oceanic subsea fiber backbones supporting Axiom Studio
            private sovereign clusters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          <div className="lg:col-span-8 flex flex-col justify-between">
            {/* Search Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#08080c] border border-white/[0.08] mb-6 flex items-center gap-3">
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, cloud provider, or region (e.g. Frankfurt, AWS, us-east-1)..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-zinc-600 font-mono"
              />
              <span className="text-xs font-mono text-zinc-500 shrink-0 tabular-nums">
                {filteredNodes.length} Nodes
              </span>
            </div>

            {/* Interactive Subsea Optical Fiber GIS Map + Coordinate Matrix */}
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-[#050508] p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(105, 106, 172, 0.4) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-white/[0.06] pb-3 mb-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  OPTICAL BACKBONE: 99.999% HEALTHY
                </span>
                <span>SUB-SEA FIBER CARRIERS: 18 ACTIVE</span>
              </div>

              {/* Animated SVG Subsea Fiber Topology */}
              <div className="relative z-10 rounded-2xl bg-[#07070d]/90 border border-white/[0.06] p-3 mb-6">
                <svg
                  viewBox="0 0 600 185"
                  className="w-full h-44 sm:h-52 overflow-visible"
                  aria-label="Global Subsea Fiber Optical Network Map"
                >
                  <defs>
                    <pattern
                      id="atlasDots"
                      width="12"
                      height="12"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="2"
                        cy="2"
                        r="1"
                        fill="rgba(255,255,255,0.1)"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="600"
                    height="185"
                    fill="url(#atlasDots)"
                    rx="10"
                  />

                  {/* Optical Subsea Arcs from Selected Node to All Peers */}
                  {dataCenters
                    .filter((peer) => peer.id !== selectedNode.id)
                    .map((peer) => {
                      const midX = (selectedNode.mapX + peer.mapX) / 2;
                      const midY =
                        Math.min(selectedNode.mapY, peer.mapY) - 28;
                      const d = `M ${selectedNode.mapX} ${selectedNode.mapY} Q ${midX} ${midY} ${peer.mapX} ${peer.mapY}`;
                      return (
                        <g key={peer.id}>
                          <path
                            d={d}
                            fill="none"
                            stroke="rgba(96, 165, 250, 0.2)"
                            strokeWidth="1.2"
                          />
                          <path
                            d={d}
                            fill="none"
                            stroke="#8587e3"
                            strokeWidth="1.6"
                            strokeDasharray="6 10"
                            className="animate-dash-flow"
                          />
                        </g>
                      );
                    })}

                  {/* Clickable PoP Beacons */}
                  {dataCenters.map((dc) => {
                    const isSelected = dc.id === selectedNode.id;
                    return (
                      <g
                        key={dc.id}
                        onClick={() => setSelectedNode(dc)}
                        className="cursor-pointer"
                      >
                        {isSelected && (
                          <circle
                            cx={dc.mapX}
                            cy={dc.mapY}
                            r="13"
                            fill="rgba(133, 135, 227, 0.28)"
                            className="animate-ping"
                            style={{
                              transformOrigin: `${dc.mapX}px ${dc.mapY}px`,
                              animationDuration: "2.2s",
                            }}
                          />
                        )}
                        <circle
                          cx={dc.mapX}
                          cy={dc.mapY}
                          r={isSelected ? "5.5" : "4"}
                          fill={isSelected ? "#34d399" : "#8587e3"}
                        />
                        <text
                          x={dc.mapX - 18}
                          y={dc.mapY + 16}
                          fill={isSelected ? "#ffffff" : "#a1a1aa"}
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {dc.region}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Data Center Pins Grid */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {filteredNodes.map((dc) => (
                  <button
                    key={dc.id}
                    type="button"
                    onClick={() => setSelectedNode(dc)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedNode.id === dc.id
                        ? "bg-brand-primary/20 border-brand-primary shadow-xl shadow-brand-primary/20 scale-[1.02]"
                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.08] text-white">
                        {dc.region}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                        {dc.latencyMs}ms
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white truncate">
                      {dc.city}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-1 truncate">
                      {dc.provider}
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-zinc-500 pt-3 border-t border-white/[0.06]">
                <span>GLOBAL TIME-TO-FIRST-BYTE &lt; 250MS</span>
                <span>PQC ENCRYPTED CROSS-CONNECTS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Node Details Inspector */}
          <div className="lg:col-span-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#08080c] border border-brand-primary/30 shadow-2xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-brand-primary" />
                    <span className="text-xs font-mono font-semibold text-white">
                      NODE TELEMETRY
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ONLINE
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
                  {selectedNode.name}
                </h3>
                <p className="text-xs font-mono text-zinc-400 mb-6">
                  {selectedNode.city}, {selectedNode.country} •{" "}
                  {selectedNode.region}
                </p>

                <div className="space-y-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">Live Round-Trip Ping</span>
                    <span className="text-emerald-400 font-bold text-sm tabular-nums">
                      {selectedNode.latencyMs} ms
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">
                      Facility Power Capacity
                    </span>
                    <span className="text-white font-semibold">
                      {selectedNode.capacityMW}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">Infrastructure Host</span>
                    <span className="text-zinc-300">
                      {selectedNode.provider}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">
                      Post-Quantum Cryptography
                    </span>
                    <span className="text-brand-primary flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Lattice Protected
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                      Connected Subsea &amp; Terrestrial Fiber:
                    </span>
                    <div className="space-y-1.5">
                      {selectedNode.fiberRoutes.map((f, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2 rounded-lg bg-white/[0.03] text-zinc-300 text-[11px] flex items-center gap-2"
                        >
                          <Radio className="w-3 h-3 text-brand-primary" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/[0.08]">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                >
                  Deploy Private Sovereign VPC
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
