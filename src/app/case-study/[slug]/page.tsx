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
  permanentRedirect(`/work/${params.slug}`);
}
