import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompanyPageContent from "@/components/CompanyPageContent";

export const metadata = {
  title: "About Studio | Axiom Studio",
  description:
    "Axiom Studio is a focused digital product & AI studio across Kuopio, Finland and Lahore, Pakistan specializing in Web Development, Web Designing, UI/UX Design, and AI Agents.",
};

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#121317]">
      <Navbar />
      <CompanyPageContent />
      <Footer />
    </main>
  );
}
