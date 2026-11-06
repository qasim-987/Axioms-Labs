import { permanentRedirect } from "next/navigation";
import { clientsData } from "@/data/clients";

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return clientsData.map((s) => ({
    slug: s.slug,
  }));
}

export default function CaseStudyRedirect({ params }: PageProps) {
  // Permanent (308, method-preserving): these URLs moved for good, so link
  // equity and crawlers settle on /work/[slug] instead of a temporary hop.
  // Retired concept slugs hop straight to their successor in one step.
  const LEGACY_WORK_SLUGS: Record<string, string> = {
    "nexus-commerce-os": "kuopio-bites",
    "strata-systems": "kuopio-bites",
  };
  permanentRedirect(`/work/${LEGACY_WORK_SLUGS[params.slug] ?? params.slug}`);
}
