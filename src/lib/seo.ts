/**
 * SEO helpers: structured-data builders and small date normalisers.
 * Every value fed to these builders must come from verified site content
 * (src/data/*, src/config/site.ts) — never invent facts for schema markup.
 */

import { SITE_NAME, SITE_URL } from "@/config/site";

const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

/** "October 2026" -> "2026-10" (valid ISO-8601 month precision). Falls back to undefined. */
export function isoMonthYear(label: string): string | undefined {
  const m = label.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return undefined;
  const mm = MONTHS[m[1].toLowerCase()];
  return mm ? `${m[2]}-${mm}` : undefined;
}

/** "6 min read" -> "PT6M" (schema.org Duration). Falls back to undefined. */
export function isoReadingDuration(label: string): string | undefined {
  const m = label.trim().match(/(\d+)\s*min/i);
  return m ? `PT${m[1]}M` : undefined;
}

export interface BreadcrumbTrailItem {
  name: string;
  url: string;
}

export function breadcrumbList(trail: BreadcrumbTrailItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function blogPostingJsonLd(opts: {
  title: string;
  excerpt: string;
  publishedLabel: string;
  readingTime: string;
  category: string;
  canonicalUrl: string;
}) {
  const datePublished = isoMonthYear(opts.publishedLabel);
  const timeRequired = isoReadingDuration(opts.readingTime);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.excerpt,
    inLanguage: "en",
    articleSection: opts.category,
    ...(datePublished ? { datePublished } : {}),
    ...(timeRequired ? { timeRequired } : {}),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/axl-monogram-512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.canonicalUrl },
  };
}

/** Blog category label -> live service route slug (verified against src/data/services.ts). */
export const SERVICE_SLUG_BY_CATEGORY: Record<string, string> = {
  "Web Development": "web-development",
  "Web Designing": "ui-ux-design",
  "UI/UX Design": "ui-ux-design",
  "UI/UX Web Design": "ui-ux-design",
  "AI Agents": "ai-agents",
};
