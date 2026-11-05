import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import JsonLd from "@/components/JsonLd";
import { breadcrumbList } from "@/lib/seo";
import { servicesData } from "@/data/services";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Services — Web Development, Web Designing, UI/UX & AI Agents | Axioms Lab",
  description:
    "All four Axioms Lab disciplines in one place: custom web development, conversion-focused web designing, product UI/UX design, and practical AI agents — each with deliverables, process and pricing context.",
  alternates: { canonical: `${SITE_URL}/services` },
};

export default function ServicesIndexPage() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: servicesData.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: `${SITE_URL}/services/${s.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#121317]">
      <JsonLd
        data={breadcrumbList([
          { name: "Home", url: SITE_URL },
          { name: "Services", url: `${SITE_URL}/services` },
        ])}
      />
      <JsonLd data={itemList} />

      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 px-4 sm:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FC] border border-[#212226]/[0.08] text-xs font-mono text-[#121317] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3186FF]" />
            <span>04 CORE DISCIPLINES</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Our Services
          </h1>
          <p className="max-w-2xl text-base sm:text-lg text-[#45474D] leading-relaxed mb-12">
            Axioms Lab works across four connected disciplines. Every engagement
            is scoped in clear weekly milestones, priced with published starting
            estimates, and delivered with full source ownership.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {servicesData.map((service, idx) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group p-8 rounded-3xl bg-[#F8F9FC] border border-[#212226]/[0.08] hover:border-[#3186FF]/40 hover:bg-[#F2F6FF] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3186FF]"
              >
                <span className="font-mono text-xs font-bold text-[#3186FF]">
                  {String(idx + 1).padStart(2, "0")} / DISCIPLINE
                </span>
                <h2 className="text-2xl font-bold mt-3 mb-3">{service.title}</h2>
                <p className="text-sm sm:text-base text-[#45474D] leading-relaxed mb-6">
                  {service.shortDesc}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-[#3186FF] group-hover:gap-3 transition-all">
                  Explore {service.title}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  );
}
