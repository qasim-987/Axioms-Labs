import type { Metadata } from "next";
import { SITE_EMAIL, SITE_URL } from "@/config/site";
import ContactPageClient from "@/components/ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us — Start Your Web or AI Project | Axioms Lab",
  description: `Tell Axioms Lab about your website, web application, UI/UX system or AI agent. Email ${SITE_EMAIL} or send a project brief — replies within 24 hours, Mon–Sat.`,
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
