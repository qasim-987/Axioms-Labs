import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import { blogPosts } from "@/data/blog";
import {
  ArrowLeft,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) {
    return { title: "Article Not Found | Axiom Studio" };
  }
  return {
    title: `${post.title} — Axiom Studio Insights`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}

export default function BlogArticlePage({ params }: ArticlePageProps) {
  const postIndex = blogPosts.findIndex((p) => p.slug === params.slug);
  if (postIndex === -1) {
    notFound();
  }

  const post = blogPosts[postIndex];
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="relative min-h-screen bg-[#FFFFFF] text-[#121317] flex flex-col justify-between">
      <Navbar />

      <main
        id="main-content"
        className="relative pt-32 pb-24 px-4 sm:px-8 lg:px-16 max-w-4xl mx-auto w-full flex-1"
      >
        <LightRays />

        {/* Back Link */}
        <Link
          href="/blog"
          className="min-h-[44px] lg:min-h-0 inline-flex items-center gap-2 text-xs font-mono text-[#6A6A71] hover:text-[#121317] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Insights &amp; Guides
        </Link>

        {/* Centered Article Header */}
        <header className="mb-12 pb-10 border-b border-[#212226]/[0.08] text-center flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-[#3186FF]/[0.08] text-[#3186FF] border border-[#3186FF]/20 font-semibold">
              {post.category}
            </span>
            <span className="text-xs font-mono text-[#6A6A71] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.publishedAt}
            </span>
            <span className="text-[#CDD4DC]">•</span>
            <span className="text-xs font-mono text-[#6A6A71] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#121317] leading-tight mb-6 max-w-3xl mx-auto">
            {post.title}
          </h1>

          <p className="text-lg text-[#45474D] leading-relaxed mb-8 max-w-2xl mx-auto">
            {post.excerpt}
          </p>

          {/* Author Strip */}
          <div className="flex items-center justify-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#121317] flex items-center justify-center font-mono text-sm font-bold text-white">
              {post.author.avatar}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-[#121317]">
                {post.author.name}
              </div>
              <div className="text-xs text-[#6A6A71]">{post.author.role}</div>
            </div>
          </div>
        </header>

        {/* Structured Article Body */}
        <article className="space-y-10 mb-16">
          <p className="text-base sm:text-lg text-[#121317] leading-relaxed font-normal">
            {post.content.introduction}
          </p>

          {post.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#121317] tracking-tight">
                {section.heading}
              </h2>

              <p className="text-sm sm:text-base text-[#45474D] leading-relaxed">
                {section.body}
              </p>

              {section.takeaways && section.takeaways.length > 0 && (
                <ul className="space-y-2.5 pt-2">
                  {section.takeaways.map((bullet, bIdx) => (
                    <li
                      key={bIdx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F9FC] border border-[#212226]/[0.07] text-xs sm:text-sm text-[#121317]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#00B95C] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="p-6 rounded-2xl bg-[#F8F9FC] border border-[#212226]/[0.08] text-sm sm:text-base text-[#121317] leading-relaxed">
            {post.content.conclusion}
          </div>
        </article>

        {/* Consultation Callout */}
        <div className="p-8 rounded-3xl bg-[#F8F9FC] border border-[#212226]/[0.08] mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#3186FF] font-semibold block mb-1">
              WORK WITH AXIOM STUDIO
            </span>
            <h3 className="text-xl font-bold text-[#121317] mb-1">
              Want this built for your website or product?
            </h3>
            <p className="text-xs sm:text-sm text-[#45474D]">
              Speak directly with our designers and engineers in Kuopio &amp;
              Lahore to scope your build.
            </p>
          </div>
          <Link
            href="/contact"
            className="w-full sm:w-auto min-h-[48px] lg:min-h-0 inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#121317] hover:bg-[#2F3034] text-white transition-colors shrink-0"
          >
            Start Your Project
          </Link>
        </div>

        {/* Related Insights */}
        {relatedPosts.length > 0 && (
          <section className="pt-10 border-t border-[#212226]/[0.08]">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#6A6A71] mb-6">
              Continue Reading
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group p-6 rounded-2xl bg-[#F8F9FC] hover:bg-[#EFF2F7] border border-[#212226]/[0.08] hover:border-[#3186FF]/35 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-mono text-[#3186FF] font-semibold block mb-2">
                      {rel.category} • {rel.readingTime}
                    </span>
                    <h4 className="text-base font-bold text-[#121317] group-hover:text-[#3186FF] transition-colors mb-2">
                      {rel.title}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#45474D] group-hover:text-[#121317] mt-4">
                    Read Guide
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
