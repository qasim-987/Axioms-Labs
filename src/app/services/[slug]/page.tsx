import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES_BY_SLUG } from "@/data/brand";
import ServicePageClient from "@/components/landing/ServicePageClient";

export function generateStaticParams() {
  return Object.keys(SERVICES_BY_SLUG).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const service = SERVICES_BY_SLUG[params.slug];
  if (!service) {
    return { title: "Service not found — [NAME]" };
  }

  return {
    title: `${service.title} — ${service.eyebrow} | [NAME]`,
    description: service.description,
    openGraph: {
      title: `${service.title} — ${service.eyebrow} | [NAME]`,
      description: service.description,
      type: "website",
    },
  };
}

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICES_BY_SLUG[params.slug];
  if (!service) {
    notFound();
  }

  return <ServicePageClient service={service} />;
}
