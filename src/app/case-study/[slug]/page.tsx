import { redirect } from "next/navigation";
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
  redirect(`/work/${params.slug}`);
}
