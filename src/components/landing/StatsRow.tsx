"use client";

import React from "react";
import CountStat from "./CountStat";
import { BRAND_STATS } from "@/data/brand";

/**
 * Bottom-right hero stats row: 3 items, large number + two-line label.
 * Desktop: horizontal row (gap 48-64px). Mobile: stacked column.
 * Each stat self-registers its count-up with the master intro timeline.
 */
export default function StatsRow() {
  return (
    <div
      className="flex items-baseline gap-6 sm:gap-10 lg:gap-16 flex-wrap"
      aria-label="Key stats"
    >
      {BRAND_STATS.map((stat) => (
        <CountStat key={stat.key} stat={stat} />
      ))}
    </div>
  );
}
