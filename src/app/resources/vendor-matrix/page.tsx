"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import { vendorPlatforms, VendorPlatform } from "@/data/vendorMatrix";
import {
  Layers,
  ArrowUpDown,
  Download,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Filter,
  ArrowRight,
  Info
} from "lucide-react";

type SortField = "name" | "latency" | "accuracy";
type FilterType = "all" | "vpc" | "self-hosted" | "hipaa" | "pqc";

export default function VendorMatrixPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<SortField>("accuracy");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredData = useMemo(() => {
    let list = [...vendorPlatforms];

    if (activeFilter === "vpc") {
      list = list.filter((p) => p.deploymentModels.includes("Dedicated VPC"));
    } else if (activeFilter === "self-hosted") {
      list = list.filter((p) => p.deploymentModels.includes("On-Prem / Self-Hosted"));
    } else if (activeFilter === "hipaa") {
      list = list.filter((p) => p.hipaaCompliant);
    } else if (activeFilter === "pqc") {
      list = list.filter((p) => p.pqcReady);
    }

    list.sort((a, b) => {
      if (sortField === "name") {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === "latency") {
        return sortAsc ? a.medianLatencyMs - b.medianLatencyMs : b.medianLatencyMs - a.medianLatencyMs;
      }
      if (sortField === "accuracy") {
        const accA = parseFloat(a.toolCallingAccuracy);
        const accB = parseFloat(b.toolCallingAccuracy);
        return sortAsc ? accA - accB : accB - accA;
      }
      return 0;
    });

    return list;
  }, [activeFilter, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Platform",
      "Provider",
      "Flagship Model",
      "Deployment Models",
      "Context Window",
      "Latency (ms)",
      "Data Privacy Policy",
      "HIPAA",
      "SOC2",
      "PQC Ready",
      "Tool Calling Accuracy",
      "Best Fit"
    ];

    const rows = filteredData.map((p) => [
      `"${p.name}"`,
      `"${p.provider}"`,
      `"${p.flagshipModel}"`,
      `"${p.deploymentModels.join(", ")}"`,
      `"${p.contextWindow}"`,
      p.medianLatencyMs,
      `"${p.dataPrivacyPolicy}"`,
      p.hipaaCompliant ? "Yes" : "No",
      p.soc2Type2 ? "Yes" : "No",
      p.pqcReady ? "Yes" : "No",
      `"${p.toolCallingAccuracy}"`,
      `"${p.bestFitFor}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `axiom_ai_vendor_matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        <LightRays />

        {/* Header Block */}
        <div className="max-w-4xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-mono uppercase tracking-wider text-brand-primary mb-6">
            <Layers className="w-3.5 h-3.5" />
            Decision Intelligence Matrix
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Enterprise AI <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-brand-primary">
              Vendor &amp; Model Matrix
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            An objective architectural comparison of premier commercial API providers, private VPC cloud services, and sovereign self-hosted open-weight pipelines across security, latency, and tool reliability.
          </p>
        </div>

        {/* Controls Bar: Filters + Sorting + CSV Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 mb-8">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400 mr-1 hidden sm:inline" />
            {[
              { id: "all", label: "All Platforms" },
              { id: "vpc", label: "Dedicated VPC" },
              { id: "self-hosted", label: "Self-Hosted / On-Prem" },
              { id: "hipaa", label: "HIPAA Compliant" },
              { id: "pqc", label: "Post-Quantum Ready" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id as FilterType)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                  activeFilter === f.id
                    ? "bg-white text-black font-semibold shadow-md"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-mono text-white border border-white/[0.08] transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#060609]/90 overflow-hidden shadow-2xl mb-16">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0b10] border-b border-white/[0.08] text-zinc-400 font-mono uppercase tracking-wider">
                <tr>
                  <th scope="col" className="p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("name")}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span>Platform &amp; Model</span>
                      <ArrowUpDown className="w-3 h-3 text-brand-primary" />
                    </button>
                  </th>
                  <th scope="col" className="p-4 sm:p-5">Deployment Mode</th>
                  <th scope="col" className="p-4 sm:p-5">Context</th>
                  <th scope="col" className="p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("latency")}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span>Latency (TTFT)</span>
                      <ArrowUpDown className="w-3 h-3 text-brand-primary" />
                    </button>
                  </th>
                  <th scope="col" className="p-4 sm:p-5">Data Retention</th>
                  <th scope="col" className="p-4 sm:p-5 text-center">HIPAA</th>
                  <th scope="col" className="p-4 sm:p-5 text-center">PQC</th>
                  <th scope="col" className="p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={() => toggleSort("accuracy")}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <span>Tool Accuracy</span>
                      <ArrowUpDown className="w-3 h-3 text-brand-primary" />
                    </button>
                  </th>
                  <th scope="col" className="p-4 sm:p-5 min-w-[220px]">Best Architectural Fit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-4 sm:p-5">
                      <div className="font-semibold text-white text-sm group-hover:text-brand-primary transition-colors">
                        {row.name}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        {row.flagshipModel}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {row.deploymentModels.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.04]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 font-mono text-white">
                      {row.contextWindow}
                    </td>
                    <td className="p-4 sm:p-5 font-mono">
                      <span className="text-emerald-400 font-semibold">{row.medianLatencyMs}ms</span>
                    </td>
                    <td className="p-4 sm:p-5">
                      <span className="text-[11px] font-mono px-2 py-1 rounded bg-white/[0.04] text-zinc-300">
                        {row.dataPrivacyPolicy}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {row.hipaaCompliant ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {row.pqcReady ? (
                        <CheckCircle2 className="w-4 h-4 text-brand-primary mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-4 sm:p-5 font-mono">
                      <span className="text-white font-bold">{row.toolCallingAccuracy}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-xs text-zinc-400 leading-relaxed">
                      {row.bestFitFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Notes */}
        <div className="mb-20 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
          <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-400 leading-relaxed space-y-1">
            <span className="font-semibold text-white block">Evaluation Methodology Note</span>
            <p>
              Latency metrics reflect median time-to-first-token (TTFT) across 1,000 synthetic test prompts with 1k token context in North American regions. Tool-calling accuracy is benchmarked on the Berkeley Function Calling Leaderboard (BFCL) suite.
            </p>
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-primary/15 via-brand-muted/10 to-transparent border border-brand-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              INDEPENDENT ADVISORY
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">
              Unsure which model topology best suits your security profile?
            </h3>
            <p className="text-sm text-zinc-300">
              Axiom Labs provides vendor-neutral hardware sizing, VPC deployment architecture, and private weight hosting advisory.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0 shadow-xl"
          >
            Schedule Vendor Review
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
