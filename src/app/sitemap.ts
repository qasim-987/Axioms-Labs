import { MetadataRoute } from "next";
import { servicesData } from "@/data/services";
import { clientCaseStudies } from "@/data/clients";
import { blogPosts } from "@/data/blog";
import { SITE_URL } from "@/config/site";
import { isoMonthYear } from "@/lib/seo";

/**
 * Sitemap lastmod must reflect real content revisions, not build time.
 * Using the deploy timestamp made every URL look freshly changed on each
 * deploy. Static surfaces share one manually-maintained revision date —
 * bump it only when published copy actually changes. Blog entries derive
 * their lastmod from their published month.
 */
const STATIC_CONTENT_LASTMOD = new Date("2026-11-05");

/** "October 2026" -> first day of that month; falls back to the static revision date. */
function blogLastmod(label: string): Date {
  const ym = isoMonthYear(label);
  return ym ? new Date(`${ym}-01T00:00:00.000Z`) : STATIC_CONTENT_LASTMOD;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: STATIC_CONTENT_LASTMOD,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: STATIC_CONTENT_LASTMOD,
    },
    {
      url: `${baseUrl}/company`,
      lastModified: STATIC_CONTENT_LASTMOD,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: STATIC_CONTENT_LASTMOD,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: STATIC_CONTENT_LASTMOD,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: STATIC_CONTENT_LASTMOD,
    },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = servicesData.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: STATIC_CONTENT_LASTMOD,
  }));

  const conceptRoutes: MetadataRoute.Sitemap = clientCaseStudies.map((c) => ({
    url: `${baseUrl}/work/${c.slug}`,
    lastModified: STATIC_CONTENT_LASTMOD,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: blogLastmod(b.publishedAt),
  }));

  return [...staticRoutes, ...serviceRoutes, ...conceptRoutes, ...blogRoutes];
}
