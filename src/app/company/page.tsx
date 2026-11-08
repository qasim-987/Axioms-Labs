import React from "react";
import Footer from "@/components/Footer";
import CompanyPageContent from "@/components/CompanyPageContent";

import { SITE_URL } from "@/config/site";

export const metadata = {
  title: "About Us | Axioms Lab",
  description:
    "Axioms Lab is a focused digital product & AI lab across Kuopio, Finland and Lahore, Pakistan specializing in UI/UX Web Design, Web Development, and AI Agents.",
  alternates: { canonical: `${SITE_URL}/company` },
};

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#121317]">
      <CompanyPageContent />
      <Footer />
    </main>
  );
}
