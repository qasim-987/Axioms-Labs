"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import SpotlightCard from "@/components/SpotlightCard";
import { blogPosts, blogCategories } from "@/data/blog";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motionTokens";
import {
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredPosts =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];
  const regularPosts = filteredPosts.filter(
    (p) => p.slug !== featuredPost.slug
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
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: MOTION_EASE.cinematicOut }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-brand-primary mb-6"
          >
            <FileText className="w-3.5 h-3.5" />
            Engineering Blueprints &amp; Evals
          </motion.div>

          <SplitTextReveal
            as="h1"
            text="Insights from the Frontiers of AI Systems"
            accentFromWordIndex={3}
            triggerOnLoad
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight text-center"
          />

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            In-depth technical writeups on multi-agent orchestration, model
            evaluation frameworks, hardware economics, and enterprise AI
            production architecture.
          </p>
        </div>

        {/* Category Filters Bar with Spring Sliding Pill */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-6 mb-12 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-zinc-400 mr-2 shrink-0 hidden sm:inline" />
          {blogCategories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? "text-black"
                    : "bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="blogCategoryPill"
                    transition={MOTION_SPRING.snappy}
                    className="absolute inset-0 rounded-full bg-white shadow-lg shadow-white/15 -z-0"
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Hero Article */}
        {activeCategory === "All" && featuredPost && (
          <div className="mb-16">
            <SpotlightCard
              tilt
              className="rounded-3xl bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent border border-white/[0.1] hover:border-brand-primary/45 p-8 sm:p-12 hover:shadow-2xl hover:shadow-brand-primary/10"
            >
              <Link href={`/blog/${featuredPost.slug}`} className="block">
                <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <Sparkles className="w-40 h-40 text-brand-primary" />
                </div>

                <div className="max-w-3xl relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-semibold">
                      Featured Blueprint
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {featuredPost.category}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readingTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 group-hover:text-brand-light transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-8">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center font-mono text-xs text-white">
                        {featuredPost.author.avatar}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white block">
                          {featuredPost.author.name}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {featuredPost.author.role}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-brand-primary transition-colors">
                      Read Article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </SpotlightCard>
          </div>
        )}

        {/* Regular Articles Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24"
        >
          <AnimatePresence mode="popLayout">
            {(activeCategory === "All" ? regularPosts : filteredPosts).map(
              (post, idx) => (
                <motion.div
                  layout
                  key={post.slug}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.45,
                    delay: idx * 0.06,
                    ease: MOTION_EASE.cinematicOut,
                  }}
                >
                  <SpotlightCard
                    tilt
                    className="h-full rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-brand-primary/40 p-6 sm:p-8"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex flex-col justify-between h-full"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300">
                            {post.category}
                          </span>
                          <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readingTime}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-brand-light transition-colors leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                        <span className="text-zinc-400 font-mono">
                          {post.publishedAt}
                        </span>
                        <span className="text-white group-hover:text-brand-primary font-semibold flex items-center gap-1">
                          Read
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </SpotlightCard>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>

        {/* Newsletter & Project Inquiry Footer */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-primary/10 to-transparent border border-brand-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-2 block">
              STAY INFORMED
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">
              Have a technical project in mind?
            </h3>
            <p className="text-sm text-zinc-300">
              Our engineering team publishes real-world post-mortems and
              architecture blueprints regularly.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
          >
            Consult With Our Architects
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
