import { redirect } from "next/navigation";
import { clientsData } from "@/data/clients";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return clientsData.map((s) => ({
    slug: s.slug,
  }));
}

export default async function CaseStudyRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/work/${slug}`);
}
