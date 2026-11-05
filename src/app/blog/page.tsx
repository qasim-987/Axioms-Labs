import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";
import BlogIndexContent from "@/components/BlogIndexContent";

export const metadata: Metadata = {
  title: "Insights — Web, UI/UX & Practical AI Guides | Axioms Lab",
  description:
    "Practical blueprints from Axioms Lab on AI agents, Next.js performance, web design hierarchy and design systems that scale.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogIndexPage() {
  return <BlogIndexContent />;
}
