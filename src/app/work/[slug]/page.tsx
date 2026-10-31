import React from "react";
import { notFound } from "next/navigation";
import { clientsData } from "@/data/clients";
import CaseStudyDetailClient from "@/components/CaseStudyDetailClient";

interface CaseStudyPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return clientsData.map((study) => ({
    slug: study.slug,
  }));
}

export function generateMetadata({ params }: CaseStudyPageProps) {
  const study = clientsData.find((s) => s.slug === params.slug);
  if (!study) return { title: "Case Study Not Found | Axiom Studio" };

  return {
    title: `${study.title} — ${study.client} Dossier | Axiom Studio`,
    description: study.summary,
  };
}

export default function CaseStudyDetail({ params }: CaseStudyPageProps) {
  const currentIndex = clientsData.findIndex((s) => s.slug === params.slug);

  if (currentIndex === -1) {
    notFound();
  }

  const study = clientsData[currentIndex];
  const prevStudy =
    currentIndex > 0
      ? clientsData[currentIndex - 1]
      : clientsData[clientsData.length - 1];
  const nextStudy =
    currentIndex < clientsData.length - 1
      ? clientsData[currentIndex + 1]
      : clientsData[0];

  return (
    <CaseStudyDetailClient
      study={study}
      prevStudy={prevStudy}
      nextStudy={nextStudy}
    />
  );
}
