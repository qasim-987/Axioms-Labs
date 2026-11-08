import React from "react";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import WorkPageContent from "@/components/WorkPageContent";

import { SITE_URL } from "@/config/site";

export const metadata = {
  title: "Concept Work | Axioms Lab",
  description:
    "Explore Axioms Lab's production-grade concept builds in UI/UX Web Design, Web Development, and AI Agents.",
  alternates: { canonical: `${SITE_URL}/work` },
};

export default function WorkPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#121317]">
      <WorkPageContent />
      <ContactSection />
      <Footer />
    </main>
  );
}
