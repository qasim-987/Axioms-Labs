import { MetadataRoute } from "next";
import { servicesData } from "@/data/services";
import { clientCaseStudies } from "@/data/clients";
import { blogPosts } from "@/data/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://axiomstudio.agency";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/work`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/company`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = servicesData.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.95,
  }));

  const conceptRoutes: MetadataRoute.Sitemap = clientCaseStudies.map((c) => ({
    url: `${baseUrl}/work/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...serviceRoutes, ...conceptRoutes, ...blogRoutes];
}
