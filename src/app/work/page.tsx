import React from "react";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import WorkPageContent from "@/components/WorkPageContent";

export const metadata = {
  title: "Concept Work | Axiom Studio",
  description:
    "Explore Axiom Studio's production-grade concept builds in Web Development, Web Designing, UI/UX Design, and AI Agents.",
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
