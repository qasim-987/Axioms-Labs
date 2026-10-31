import Hero from "@/components/Hero";
import LogoStrip from "@/components/LogoStrip";
import StatsSection from "@/components/StatsSection";
import ServicesGrid from "@/components/ServicesGrid";
import ConceptBuildsGate from "@/components/ConceptBuildsGate";
import MethodologySection from "@/components/MethodologySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#FFFFFF]">
      <main id="main-content" className="flex-1">
        <Hero />
        <LogoStrip />
        <StatsSection />
        <ConceptBuildsGate />
        <ServicesGrid />
        <MethodologySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
