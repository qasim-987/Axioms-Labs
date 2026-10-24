"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import {
  Globe2,
  Server,
  Zap,
  Radio,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity
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
  fiberRoutes: string[];
  capacityMW: string;
  latencyMs: number;
  pqcSecure: boolean;
}

const dataCenters: DataCenterNode[] = [
  { id: "DC-VA", name: "Ashburn Metro Hub", region: "us-east-1", provider: "AWS / Equinix", city: "Ashburn, VA", country: "USA", lat: 39.0438, lng: -77.4874, fiberRoutes: ["Dunant Subsea", "MAREA Atlantic", "Transatlantic 14"], capacityMW: "180 MW", latencyMs: 14, pqcSecure: true },
  { id: "DC-CA", name: "Silicon Valley Edge 1", region: "us-west-1", provider: "Cloudflare / CoreSite", city: "San Jose, CA", country: "USA", lat: 37.3382, lng: -121.8863, fiberRoutes: ["Pacific Light Cable", "Southern Cross Cable"], capacityMW: "120 MW", latencyMs: 42, pqcSecure: true },
  { id: "DC-FR", name: "Frankfurt Rhine-Main", region: "eu-central-1", provider: "GCP / Interxion", city: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821, fiberRoutes: ["DE-CIX Core", "Apollo South", "SeaMeWe-5"], capacityMW: "210 MW", latencyMs: 88, pqcSecure: true },
  { id: "DC-LDN", name: "London Docklands Hub", region: "eu-west-2", provider: "Telehouse / Azure", city: "London", country: "UK", lat: 51.5074, lng: -0.1278, fiberRoutes: ["Grace Hopper Cable", "Circe South"], capacityMW: "150 MW", latencyMs: 76, pqcSecure: true },
  { id: "DC-TYO", name: "Tokyo Bay Equinix TY11", region: "ap-northeast-1", provider: "AWS / Equinix", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, fiberRoutes: ["JUPITER Trans-Pacific", "FASTER Cable System"], capacityMW: "160 MW", latencyMs: 132, pqcSecure: true },
  { id: "DC-SIN", name: "Singapore Jurong Edge", region: "ap-southeast-1", provider: "GCP / ST Telemedia", city: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, fiberRoutes: ["Bifrost Cable", "Echo Trans-Pacific"], capacityMW: "140 MW", latencyMs: 164, pqcSecure: true }
];

export default function InfrastructureAtlasDemoPage() {
  const [selectedNode, setSelectedNode] = useState<DataCenterNode>(dataCenters[0]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredNodes = dataCenters.filter((dc) =>
    dc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dc.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dc.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <LightRays />

        {/* Header Block */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono uppercase tracking-wider text-blue-400 mb-6">
            <Globe2 className="w-3.5 h-3.5" />
            Geospatial Network Telemetry
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Infrastructure Atlas: <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-brand-primary">
              Global Data Center &amp; Fiber Map
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Explore primary compute nodes, low-latency edge points of presence, and trans-oceanic subsea fiber backbones supporting Axiom Labs private sovereign clusters.
          </p>
        </div>

        {/* Interactive Map Canvas Simulation + Search Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24">
          {/* Left Column: Interactive Map Grid */}
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
              <span className="text-xs font-mono text-zinc-500 shrink-0">
                {filteredNodes.length} Nodes
              </span>
            </div>

            {/* Visual Geospatial Coordinate Matrix */}
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.1] bg-[#050508] p-8 shadow-2xl min-h-[420px] flex flex-col justify-between">
              {/* Radial Coordinate Grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(rgba(105, 106, 172, 0.4) 1px, transparent 1px)`,
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-zinc-500 border-b border-white/[0.06] pb-3">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  OPTICAL BACKBONE: 99.999% HEALTHY
                </span>
                <span>SUB-SEA FIBER CARRIERS: 18 ACTIVE</span>
              </div>

              {/* Data Center Pins Grid */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4 my-8">
                {filteredNodes.map((dc) => (
                  <button
                    key={dc.id}
                    type="button"
                    onClick={() => setSelectedNode(dc)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      selectedNode.id === dc.id
                        ? "bg-brand-primary/20 border-brand-primary shadow-xl shadow-brand-primary/20 scale-[1.02]"
                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.08] text-white">
                        {dc.region}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
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
                  {selectedNode.city}, {selectedNode.country} • {selectedNode.region}
                </p>

                <div className="space-y-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">Live Round-Trip Ping</span>
                    <span className="text-emerald-400 font-bold text-sm">{selectedNode.latencyMs} ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">Facility Power Capacity</span>
                    <span className="text-white font-semibold">{selectedNode.capacityMW}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">Infrastructure Host</span>
                    <span className="text-zinc-300">{selectedNode.provider}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                    <span className="text-zinc-500">Post-Quantum Cryptography</span>
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
                        <div key={fIdx} className="p-2 rounded-lg bg-white/[0.03] text-zinc-300 text-[11px] flex items-center gap-2">
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
