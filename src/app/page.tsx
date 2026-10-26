import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogoStrip from "@/components/LogoStrip";
import StatsSection from "@/components/StatsSection";
import ServicesGrid from "@/components/ServicesGrid";
import MethodologySection from "@/components/MethodologySection";
import CaseStudies from "@/components/CaseStudies";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ViewWorkCursor from "@/components/ViewWorkCursor";

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen">
        {/* Hero Section with Volumetric Light-Ray Shader & Character-Split Typography */}
        <Hero />

        {/* Client / Partner Logo Marquee + Planetary Horizon Light Curve */}
        <LogoStrip />

        {/* Physical Slot-Machine Odometer Digit Counters */}
        <StatsSection />

        {/* Six Core Expandable & Spotlight Services Pillars */}
        <ServicesGrid />

        {/* Scroll-Scrubbed Methodology & Architectural Guardrails */}
        <MethodologySection />

        {/* 50/50 Case Study Showcase with "View Work" Difference Cursor */}
        <CaseStudies />

        {/* Anti-Spam Validated Scoping & Contact Section */}
        <ContactSection />
      </main>

      <Footer />
      <ViewWorkCursor label="View Work" />
    </>
  );
}
