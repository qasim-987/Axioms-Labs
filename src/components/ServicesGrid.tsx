"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { servicesData } from "@/data/services";
import SpotlightCard from "./SpotlightCard";
import SplitTextReveal from "./SplitTextReveal";
import { MOTION_EASE } from "@/lib/motionTokens";
import { Cpu, Bot, Globe, Layout, Code, ArrowUpRight } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code className="w-6 h-6 text-[#3186FF]" />,
  Globe: <Globe className="w-6 h-6 text-[#00B95C]" />,
  Layout: <Layout className="w-6 h-6 text-[#FC413D]" />,
  Bot: <Bot className="w-6 h-6 text-[#FBBC04]" />,
  Cpu: <Cpu className="w-6 h-6 text-[#3186FF]" />,
};

export default function ServicesGrid() {
  return (
    <section
      id="services"
      className="relative py-24 sm:py-32 bg-[#F8F9FC] border-t border-[#212226]/[0.07]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
              <span>OUR 4 CORE SERVICES</span>
            </div>
            <SplitTextReveal
              as="h2"
              text="Focused Craft. Built to Perform."
              accentFromWordIndex={2}
              accentClassName="text-[#3186FF]"
              className="text-3xl sm:text-5xl font-bold tracking-tight text-[#121317]"
            />
          </div>
          <p className="text-[#45474D] max-w-md text-sm sm:text-base leading-relaxed">
            We specialize strictly in four disciplines so every line of code,
            pixel, user flow, and AI workflow gets senior-level focus.
          </p>
        </div>

        {/* Clean 2x2 Bento Grid for the 4 Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {servicesData.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.65,
                delay: idx * 0.08,
                ease: MOTION_EASE.cinematicOut,
              }}
            >
              <SpotlightCard
                tilt
                className="group relative h-full rounded-3xl p-8 lg:p-9 bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 shadow-[0_8px_30px_rgba(18,19,23,0.04)] hover:shadow-[0_20px_48px_rgba(18,19,23,0.09)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.07] group-hover:scale-105 transition-transform duration-300">
                        {iconMap[service.iconName]}
                      </div>
                      <span className="font-mono text-sm font-bold text-[#6A6A71] group-hover:text-[#3186FF] transition-colors">
                        0{idx + 1}
                      </span>
                    </div>

                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#3186FF]/[0.08] text-[#3186FF] border border-[#3186FF]/20 font-medium">
                      {service.metrics}
                    </span>
                  </div>

                  <span className="text-xs font-mono uppercase tracking-wider text-[#6A6A71] block mb-2">
                    {service.badge}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-bold text-[#121317] mb-3 group-hover:text-[#3186FF] transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#45474D] leading-relaxed mb-6">
                    {service.shortDesc}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {service.tools.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#F8F9FC] text-[#45474D] border border-[#212226]/[0.07]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deep-link Action */}
                <div className="pt-5 border-t border-[#212226]/[0.07] flex items-center justify-between">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#121317] group-hover:text-[#3186FF] transition-colors after:absolute after:inset-0"
                  >
                    <span>Explore {service.title}</span>
                    <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>

                  <span className="text-xs font-mono text-[#6A6A71]">
                    0{idx + 1} / 04
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
