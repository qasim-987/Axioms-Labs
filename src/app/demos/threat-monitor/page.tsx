"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import OrbitalThreatGlobe from "@/components/OrbitalThreatGlobe";
import {
  fetchThreatTelemetryViaApi,
  ThreatArcTelemetry,
} from "@/lib/apiClient";
import {
  ShieldAlert,
  Activity,
  Terminal,
  Lock,
  Zap,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  ArrowRight
} from "lucide-react";

interface ThreatLog {
  id: string;
  timestamp: string;
  level: "CRITICAL" | "HIGH" | "MEDIUM";
  technique: string;
  target: string;
  action: "BLOCKED" | "CONTAINED" | "ESCALATED";
  latencyMs: number;
}

const mitreAtlasTechniques = [
  { name: "Prompt Injection", id: "AML.T0051", severity: "CRITICAL", hits: 412 },
  { name: "Data Poisoning", id: "AML.T0018", severity: "HIGH", hits: 88 },
  { name: "Model Evasion", id: "AML.T0015", severity: "HIGH", hits: 142 },
  { name: "Model Theft", id: "AML.T0024", severity: "CRITICAL", hits: 19 },
  { name: "Backdoor ML", id: "AML.T0020", severity: "HIGH", hits: 63 },
  { name: "ML Supply Chain", id: "AML.T0010", severity: "CRITICAL", hits: 104 },
  { name: "Membership Inversion", id: "AML.T0025", severity: "MEDIUM", hits: 37 },
  { name: "Agent Hijack (MCP)", id: "AML.T0054", severity: "CRITICAL", hits: 279 },
  { name: "RAG Poisoning", id: "AML.T0052", severity: "CRITICAL", hits: 310 },
  { name: "Sponge Attack", id: "AML.T0029", severity: "MEDIUM", hits: 51 },
  { name: "Gradient Leakage", id: "AML.T0031", severity: "HIGH", hits: 28 },
  { name: "Context Poisoning", id: "AML.T0053", severity: "HIGH", hits: 196 },
  { name: "Tool Schema Exploit", id: "AML.T0055", severity: "CRITICAL", hits: 215 },
  { name: "LLM Jailbreak", id: "AML.T0050", severity: "CRITICAL", hits: 531 },
  { name: "PQC Lattice Decrypt", id: "AML.T0090", severity: "CRITICAL", hits: 8 },
  { name: "Training Exfiltration", id: "AML.T0035", severity: "HIGH", hits: 44 }
];

const initialLogs: ThreatLog[] = [
  { id: "LOG-9012", timestamp: "18:44:02", level: "CRITICAL", technique: "Agent Hijack (MCP)", target: "Autonomous Worker Node #4", action: "BLOCKED", latencyMs: 3.2 },
  { id: "LOG-9011", timestamp: "18:43:58", level: "HIGH", technique: "Prompt Injection", target: "Enterprise Copilot API", action: "CONTAINED", latencyMs: 4.8 },
  { id: "LOG-9010", timestamp: "18:43:52", level: "CRITICAL", technique: "RAG Vector Poison", target: "Internal HR Vector DB", action: "BLOCKED", latencyMs: 2.1 },
  { id: "LOG-9009", timestamp: "18:43:45", level: "MEDIUM", technique: "Model Evasion", target: "Customer Support LLaMA-3", action: "CONTAINED", latencyMs: 5.4 },
  { id: "LOG-9008", timestamp: "18:43:39", level: "CRITICAL", technique: "Tool Schema Exploit", target: "SQL Query Tool Executor", action: "ESCALATED", latencyMs: 1.8 }
];

export default function ThreatMonitorDemoPage() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [attacksCount, setAttacksCount] = useState<number>(14847);
  const [logs, setLogs] = useState<ThreatLog[]>(initialLogs);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [orbitalArcs, setOrbitalArcs] = useState<ThreatArcTelemetry[]>([]);

  useEffect(() => {
    fetchThreatTelemetryViaApi().then((res) => {
      if (res) {
        setAttacksCount(res.last24hBlocked);
        setOrbitalArcs(res.activeArcs);
      }
    });
  }, []);

  // Simulated live telemetry loop
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setAttacksCount((prev) => prev + Math.floor(Math.random() * 3) + 1);

      // Add dynamic threat log occasionally
      const randomTechnique = mitreAtlasTechniques[Math.floor(Math.random() * mitreAtlasTechniques.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      const newLog: ThreatLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: timeStr,
        level: randomTechnique.severity as any,
        technique: randomTechnique.name,
        target: ["Claude 3.5 API", "GPT-4o Endpoint", "Cluster Worker #2", "RAG Ingestion Mesh"][Math.floor(Math.random() * 4)],
        action: ["BLOCKED", "CONTAINED", "BLOCKED"][Math.floor(Math.random() * 3)] as any,
        latencyMs: +(Math.random() * 4 + 1.2).toFixed(1)
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 7)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "CRITICAL") return log.level === "CRITICAL";
    if (activeFilter === "AI-ASSISTED") return log.technique.includes("Prompt") || log.technique.includes("Jailbreak");
    if (activeFilter === "AGENT-LEVEL") return log.technique.includes("Agent") || log.technique.includes("Tool");
    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-8 sm:px-12 lg:px-16 max-w-6xl mx-auto w-full flex-1">
        <LightRays />

        {/* Header Block with Live Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/[0.08] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                DEFENSE POSTURE: ELEVATED
              </span>
              <span className="text-xs font-mono text-zinc-500">• Simulated Telemetry Feed</span>
            </div>
            <SplitTextReveal
              as="h1"
              text="Axiom ATOM Threat Monitor"
              accentFromWordIndex={2}
              triggerOnLoad
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
            />
            <p className="text-sm text-zinc-400 mt-2">
              Real-time adversarial LLM telemetry, MITRE ATLAS attack taxonomy, and automated PQC perimeter defense.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.08] transition-colors"
            >
              {isLive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isLive ? "Pause Feed" : "Resume Feed"}</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>PQC Lattice Active</span>
            </div>
          </div>
        </div>

        {/* Telemetry Stat Strip (4 Metric Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="p-5 rounded-2xl bg-[#08080c] border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
              Attacks / 24h
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {attacksCount.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono text-rose-400 mt-1 block">
              +8.4% above baseline
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#08080c] border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
              AI-Assisted Probes
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold font-mono text-purple-400 tracking-tight">
              3,291
            </div>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
              Automated jailbreak bots
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#08080c] border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
              Active Defense Agents
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
              12 / 12
            </div>
            <span className="text-[10px] font-mono text-emerald-500 mt-1 block">
              100% cluster health
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#08080c] border border-white/[0.08]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
              Mean Time to Contain (MTTR)
            </span>
            <div className="text-2xl sm:text-4xl font-extrabold font-mono text-brand-primary tracking-tight">
              3.4ms
            </div>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
              Sub-5ms policy enforcement
            </span>
          </div>
        </div>

        {/* Interactive 3D Orbital Threat Globe (antimatterai.agency/demos/atom-red-team parity) */}
        <div className="mb-12">
          <OrbitalThreatGlobe arcs={orbitalArcs} isLive={isLive} />
        </div>

        {/* MITRE ATLAS Technique Heatmap */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold block">
                ADVERSARIAL TAXONOMY
              </span>
              <h2 className="text-xl font-bold text-white">
                MITRE ATLAS &amp; Quantum Technique Heatmap (Last 60 Min)
              </h2>
            </div>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Click a cell to inspect vector signature
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {mitreAtlasTechniques.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedTechnique(item.name === selectedTechnique ? null : item.name)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  selectedTechnique === item.name
                    ? "bg-brand-primary/20 border-brand-primary shadow-lg shadow-brand-primary/20"
                    : item.severity === "CRITICAL"
                    ? "bg-rose-500/[0.04] border-rose-500/20 hover:border-rose-500/40"
                    : item.severity === "HIGH"
                    ? "bg-amber-500/[0.04] border-amber-500/20 hover:border-amber-500/40"
                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/20"
                }`}
              >
                <div className="text-[9px] font-mono text-zinc-500 mb-1 flex justify-between">
                  <span>{item.id}</span>
                  <span className={item.severity === "CRITICAL" ? "text-rose-400" : "text-amber-400"}>
                    {item.hits}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white truncate">
                  {item.name}
                </div>
              </button>
            ))}
          </div>

          {selectedTechnique && (
            <div className="mt-4 p-4 rounded-xl bg-[#09090e] border border-brand-primary/30 flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-brand-primary" />
                <span className="text-zinc-200">
                  Inspecting vector: <strong className="text-white">{selectedTechnique}</strong> — Protected by Axiom deterministic validation schemas.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTechnique(null)}
                className="text-zinc-400 hover:text-white underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Live Defense Operations Terminal Log */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#060609] overflow-hidden shadow-2xl mb-16">
          <div className="bg-[#0b0b10] p-4 border-b border-white/[0.08] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-white">
                DEFENSE OPERATIONS LOG STREAM
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {["ALL", "CRITICAL", "AI-ASSISTED", "AGENT-LEVEL"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-md text-[10px] font-mono transition-colors ${
                    activeFilter === f
                      ? "bg-white text-black font-semibold"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 font-mono text-xs space-y-2.5 max-h-[380px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-zinc-500">{log.timestamp}</span>
                  <span className="text-zinc-300 font-semibold">{log.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.level === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-white">{log.technique}</span>
                  <span className="text-zinc-500">→ {log.target}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-zinc-400 text-[11px]">{log.latencyMs}ms</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.action === "BLOCKED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {log.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Consultation Link */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-primary/10 to-transparent border border-brand-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              ENTERPRISE AI DEFENSE
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">
              Protect your LLM endpoints from adversarial exploits
            </h3>
            <p className="text-sm text-zinc-300">
              Axiom Studio integrates real-time MITRE ATLAS threat mitigation, Post-Quantum Cryptography, and MCP boundary guardrails.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
          >
            Deploy ATOM Defense
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
