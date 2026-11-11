import { pricing, pricingDescription, getServicePricing } from "@/config/pricing";
import React from "react";
import type { Metadata } from "next";
import { SITE_URL } from "@/config/site";
import JsonLd from "@/components/JsonLd";
import { breadcrumbList, faqPage } from "@/lib/seo";
import Link from "next/link";
import Footer from "@/components/Footer";
import { retiredServicePages } from "@/data/retiredServices";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/services";
import ServiceDetailClient from "@/components/ServiceDetailClient";

interface ServicePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return [...servicesData, ...retiredServicePages].map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: ServicePageProps): Metadata {
  const service = servicesData.find((s) => s.slug === params.slug);
  const retired = retiredServicePages.find(s => s.slug === params.slug);
  if (retired) return {
    title: `${retired.title} — Informational Guide | Axioms Lab`,
    description: `${retired.description} This is an informational resource, not a currently offered standalone service.`,
    alternates: { canonical: `${SITE_URL}/services/${retired.slug}` },
    robots: { index: true, follow: true },
  };
  if (!service) {
    return { title: "Service Not Found | Axioms Lab" };
  }

  return {
    title: `${service.title} — ${service.heroHeadline} | Axioms Lab`,
    description: `${service.shortDesc} ${pricingDescription(service.slug)}`,
    alternates: { canonical: `${SITE_URL}/services/${service.slug}` },
  };
}

export default function ServicePage({ params }: ServicePageProps) {
  const retired = retiredServicePages.find(s => s.slug === params.slug);
  if (retired) return <>
    <JsonLd data={breadcrumbList([{ name: "Home", url: SITE_URL }, { name: retired.title, url: `${SITE_URL}/services/${retired.slug}` }])} />
    <main id="main-content" className="min-h-screen bg-[#FFFFFF] px-4 pb-20 pt-32 text-[#121317] sm:px-8 sm:pt-40">
      <article className="mx-auto max-w-3xl" data-page-header>
        <p className="mb-4 text-sm font-medium text-[#3186FF]">Informational resource · Not a standalone service</p>
        <h1 data-reveal="lines" className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">{retired.title}</h1>
        <p className="mb-8 text-lg leading-relaxed text-[#45474D]">{retired.description}</p>
        <div className="space-y-6 text-base leading-relaxed text-[#45474D]">{retired.paragraphs.map(text => <p key={text}>{text}</p>)}</div>
        <aside className="mt-10 rounded-3xl border border-[#212226]/10 bg-[#F8F9FC] p-6 sm:p-8">
          <h2 className="mb-3 text-xl font-semibold">Our current services</h2>
          <p className="mb-4 text-sm leading-relaxed text-[#45474D]">This URL is retained for reference. Axioms Lab currently offers the three services below.</p>
          <ul className="space-y-3">{servicesData.map(s => <li key={s.slug}><Link className="text-[#3186FF] underline underline-offset-4" href={`/services/${s.slug}`}>{s.title}</Link></li>)}</ul>
        </aside>
      </article>
    </main><Footer />
  </>;

  const service = servicesData.find((s) => s.slug === params.slug);
  if (!service) {
    notFound();
  }

  const otherServices = servicesData.filter((s) => s.slug !== params.slug);
  const rate=getServicePricing(service.slug);
  const jsonLd={"@context":"https://schema.org","@type":"Service",name:service.title,description:`${service.shortDesc} ${pricingDescription(service.slug)}`,provider:{"@type":"Organization",name:"Axioms Lab"},...(rate?{offers:{"@type":"AggregateOffer",priceCurrency:pricing.currency,lowPrice:rate.typicalRange[0],highPrice:rate.typicalRange[1],description:pricingDescription(service.slug)}}:{})};
  return <><JsonLd data={breadcrumbList([{ name: "Home", url: SITE_URL }, { name: service.title, url: `${SITE_URL}/services/${service.slug}` }])} /><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd).replace(/</g,"\\u003c")}} /><JsonLd data={faqPage(service.faqs)} /><ServiceDetailClient service={service} otherServices={otherServices} /></>;
}
