import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/services";
import ServiceDetailClient from "@/components/ServiceDetailClient";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return servicesData.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: ServicePageProps): Metadata {
  const service = servicesData.find((s) => s.slug === params.slug);
  if (!service) {
    return { title: "Service Not Found | Axiom Studio" };
  }

  return {
    title: `${service.title} — ${service.heroHeadline} | Axiom Studio`,
    description: service.shortDesc,
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  const service = servicesData.find((s) => s.slug === params.slug);
  if (!service) {
    notFound();
  }

  const otherServices = servicesData.filter((s) => s.slug !== params.slug);
  return <ServiceDetailClient service={service} otherServices={otherServices} />;
}
