import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LightRays from "@/components/LightRays";
import SplitTextReveal from "@/components/SplitTextReveal";
import { blogPosts } from "@/data/blog";
import {
  ArrowLeft,
  Clock,
  User,
  Share2,
  Bookmark,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return { title: "Article Not Found | Axiom Studio" };

  return {
    title: `${post.title} | Axiom Studio Engineering`,
    description: post.excerpt,
  };
}

export default function BlogPostDetail({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((p) => p.slug !== params.slug).slice(0, 2);

  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-[#030303] text-zinc-100">
        <LightRays />

        <article className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-16">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-brand-primary">{post.category}</span>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                {post.category}
              </span>
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-mono text-zinc-400">
                {post.publishedAt}
              </span>
            </div>

            <SplitTextReveal
              as="h1"
              text={post.title}
              accentFromWordIndex={4}
              triggerOnLoad
              className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6"
            />

            <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-light mb-8">
              {post.excerpt}
            </p>

            {/* Author Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center font-mono text-xs font-bold text-white">
                  {post.author.avatar}
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">
                    {post.author.name}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {post.author.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span>VERIFIED BLUEPRINT</span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert max-w-none mb-16 text-zinc-300 text-base leading-relaxed space-y-8">
            <p className="text-lg text-zinc-200 leading-relaxed font-normal border-l-2 border-brand-primary/50 pl-4 py-1">
              {post.content.introduction}
            </p>

            {post.content.sections.map((section, idx) => (
              <div key={idx} className="pt-6 space-y-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {section.heading}
                </h2>
                <p className="text-zinc-300 leading-relaxed">
                  {section.body}
                </p>

                {section.takeaways && section.takeaways.length > 0 && (
                  <div className="p-6 rounded-2xl bg-[#08080c] border border-white/[0.08] my-6">
                    <span className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-3 block">
                      Architectural Takeaways
                    </span>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {section.takeaways.map((t, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-8 border-t border-white/[0.08]">
              <h3 className="text-xl font-bold text-white mb-3">
                Summary &amp; Strategic Horizon
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                {post.content.conclusion}
              </p>
            </div>
          </div>

          {/* Related Articles Footer */}
          <div className="pt-12 border-t border-white/[0.08] mb-16">
            <h3 className="text-xs font-mono uppercase tracking-widest text-brand-primary font-semibold mb-6">
              Related Engineering Blueprints
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.slug}
                  href={`/blog/${rPost.slug}`}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-brand-primary/30 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 mb-3 inline-block">
                      {rPost.category}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-brand-primary transition-colors">
                      {rPost.title}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-zinc-400 mt-4 flex items-center gap-1 group-hover:text-white">
                    Read Post
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Consultation CTA */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-primary/10 to-transparent border border-brand-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">
                Implement these systems in your stack
              </h4>
              <p className="text-xs text-zinc-400">
                Book a scoping session with our lead authors and machine learning architects.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
            >
              Get In Touch
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
