"use client";

import React from "react";
import RollingNumber from "./RollingNumber";
import { Award, CheckCircle2, TrendingUp, Clock } from "lucide-react";

export default function StatsSection() {
  return (
    <section className="relative py-16 border-y border-white/[0.08] bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Stat 1 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <Award className="w-4 h-4 text-brand-primary" />
              <span className="text-xs uppercase font-mono tracking-wider">
                Production Deployments
              </span>
            </div>
            <div className="flex items-baseline text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
              <RollingNumber value={74} duration={1800} suffix="+" />
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              High-concurrency systems delivered across enterprise AI, fintech &amp; healthcare.
            </p>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-mono tracking-wider">
                Client Satisfaction
              </span>
            </div>
            <div className="flex items-baseline text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
              <RollingNumber value={99.4} decimals={1} duration={2000} suffix="%" />
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Measured post-deployment partner retention and NPS benchmark over 36 months.
            </p>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <TrendingUp className="w-4 h-4 text-brand-light" />
              <span className="text-xs uppercase font-mono tracking-wider">
                Agent Accuracy
              </span>
            </div>
            <div className="flex items-baseline text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
              <RollingNumber value={94.8} decimals={1} duration={2200} suffix="%" />
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Autonomous tool execution fidelity validated through continuous automated eval suites.
            </p>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase font-mono tracking-wider">
                Telemetry &amp; Uptime
              </span>
            </div>
            <div className="flex items-baseline text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight font-mono">
              <span>24/7</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Autonomous self-healing infrastructure monitoring and proactive telemetry guards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
