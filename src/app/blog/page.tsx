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
    <div className="relative min-h-screen bg-[#FFFFFF] text-[#121317] flex flex-col justify-between">
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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono uppercase tracking-wider text-[#3186FF] font-semibold mb-6"
          >
            <FileText className="w-3.5 h-3.5" />
            Axiom Studio Notes &amp; Guides
          </motion.div>

          <SplitTextReveal
            as="h1"
            text="Insights on Web, UI/UX & Practical AI"
            accentFromWordIndex={4}
            accentClassName="text-[#3186FF]"
            triggerOnLoad
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#121317] mb-6 leading-tight text-center"
          />

          <p className="text-base sm:text-lg text-[#45474D] leading-relaxed max-w-2xl mx-auto">
            Practical guides from our design and engineering team on modern web
            development, high-converting web design, scalable UI/UX systems,
            and AI agents.
          </p>
        </div>

        {/* Category Filters Bar with Spring Sliding #121317 Pill */}
        <div className="flex items-center gap-2 border-b border-[#212226]/[0.08] pb-6 mb-12 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-[#6A6A71] mr-2 shrink-0 hidden sm:inline" />
          {blogCategories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? "text-white"
                    : "bg-[#B7BFD9]/[0.16] text-[#45474D] hover:bg-[#F0F1F5] hover:text-[#121317] border border-[#212226]/[0.07]"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="blogCategoryPill"
                    transition={MOTION_SPRING.snappy}
                    className="absolute inset-0 rounded-full bg-[#121317] shadow-md -z-0"
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
              className="rounded-3xl bg-[#F8F9FC] hover:bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 p-8 sm:p-12 shadow-sm hover:shadow-[0_20px_56px_rgba(18,19,23,0.08)] transition-all"
            >
              <Link href={`/blog/${featuredPost.slug}`} className="block group">
                <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity pointer-events-none">
                  <Sparkles className="w-40 h-40 text-[#3186FF]" />
                </div>

                <div className="max-w-3xl relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#3186FF]/[0.1] text-[#3186FF] border border-[#3186FF]/20 font-semibold">
                      Featured Blueprint
                    </span>
                    <span className="text-xs font-mono text-[#45474D]">
                      {featuredPost.category}
                    </span>
                    <span className="text-[#CDD4DC]">•</span>
                    <span className="text-xs font-mono text-[#6A6A71] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readingTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121317] mb-4 group-hover:text-[#3186FF] transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm sm:text-base text-[#45474D] leading-relaxed mb-8">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-[#212226]/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#121317] flex items-center justify-center font-mono text-xs text-white font-bold">
                        {featuredPost.author.avatar}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#121317] block">
                          {featuredPost.author.name}
                        </span>
                        <span className="text-[11px] text-[#6A6A71]">
                          {featuredPost.author.role}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#121317] group-hover:text-[#3186FF] transition-colors">
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
                    className="h-full rounded-2xl bg-[#F8F9FC] hover:bg-[#FFFFFF] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 p-6 sm:p-8 shadow-sm"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex flex-col justify-between h-full group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#FFFFFF] border border-[#212226]/[0.07] text-[#3186FF] font-medium">
                            {post.category}
                          </span>
                          <span className="text-xs font-mono text-[#6A6A71] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readingTime}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#121317] mb-3 group-hover:text-[#3186FF] transition-colors leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#45474D] line-clamp-3 leading-relaxed mb-6">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#212226]/[0.07] flex items-center justify-between text-xs">
                        <span className="text-[#6A6A71] font-mono">
                          {post.publishedAt}
                        </span>
                        <span className="text-[#121317] group-hover:text-[#3186FF] font-semibold flex items-center gap-1">
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

        {/* Project Inquiry Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#F8F9FC] border border-[#212226]/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold mb-2 block">
              STAY INFORMED
            </span>
            <h3 className="text-2xl font-bold text-[#121317] mb-2">
              Have a digital project in mind?
            </h3>
            <p className="text-sm text-[#45474D]">
              Our design and engineering team shares practical guides and helps
              ambitious brands launch faster.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#121317] hover:bg-[#2F3034] text-white transition-colors shrink-0"
          >
            Start Your Project
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
