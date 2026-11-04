import React from "react";
import Footer from "@/components/Footer";
import CompanyPageContent from "@/components/CompanyPageContent";

export const metadata = {
  title: "About Us | Axioms Lab",
  description:
    "Axioms Lab is a focused digital product & AI lab across Kuopio, Finland and Lahore, Pakistan specializing in Web Development, Web Designing, UI/UX Design, and AI Agents.",
};

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#121317]">
      <CompanyPageContent />
      <Footer />
    </main>
  );
}
