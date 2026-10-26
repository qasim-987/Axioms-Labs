import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogoStrip from "@/components/LogoStrip";
import StatsSection from "@/components/StatsSection";
import CaseStudies from "@/components/CaseStudies";
import ServicesGrid from "@/components/ServicesGrid";
import MethodologySection from "@/components/MethodologySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ViewWorkCursor from "@/components/ViewWorkCursor";

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen">
        {/* Hero Section with Centered 3D Particle Sphere & Volumetric Aura */}
        <Hero />

        {/* Client / Partner Logo Marquee + Planetary Horizon Light Curve */}
        <LogoStrip />

        {/* Physical Slot-Machine Odometer Digit Counters */}
        <StatsSection />

        {/* 50/50 Case Study Showcase (01 & 02) with "View Work" Magnetic Difference Cursor */}
        <CaseStudies />

        {/* Six Core Expandable & Spotlight Services Pillars (shifted below Case Studies) */}
        <ServicesGrid />

        {/* Scroll-Scrubbed Methodology & Architectural Guardrails */}
        <MethodologySection />

        {/* Anti-Spam Validated Scoping & Contact Section */}
        <ContactSection />
      </main>

      <Footer />
      <ViewWorkCursor label="View Work" />
    </>
  );
}
