import { pricing, pricingDescription, getServicePricing } from "@/config/pricing";
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
    description: `${service.shortDesc} ${pricingDescription(service.slug)}`,
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  const service = servicesData.find((s) => s.slug === params.slug);
  if (!service) {
    notFound();
  }

  const otherServices = servicesData.filter((s) => s.slug !== params.slug);
  const rate=getServicePricing(service.slug);
  const jsonLd={"@context":"https://schema.org","@type":"Service",name:service.title,description:`${service.shortDesc} ${pricingDescription(service.slug)}`,provider:{"@type":"Organization",name:"Axiom Studio"},...(rate?{offers:{"@type":"AggregateOffer",priceCurrency:pricing.currency,lowPrice:rate.typicalRange[0],highPrice:rate.typicalRange[1],description:pricingDescription(service.slug)}}:{})};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}} /><ServiceDetailClient service={service} otherServices={otherServices} /></>;
}
