export interface ClientCaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  tagline: string;
  category: "Web Development" | "Web Designing" | "UI/UX Design" | "AI Agents";
  impactMetric: string;
  impactLabel: string;
  year: string;
  duration: string;
  summary: string;
  challenge: string;
  solution: string;
  architectureHighlights: {
    title: string;
    description: string;
  }[];
  results: string[];
  techStack: string[];
  liveUrl?: string;
}

export const clientCategories = [
  "All",
  "Web Development",
  "Web Designing",
  "UI/UX Design",
  "AI Agents",
] as const;

export const clientsData: ClientCaseStudy[] = [
  {
    id: "nexus-commerce-os",
    slug: "nexus-commerce-os",
    title: "Nexus SaaS & Headless Commerce Platform",
    client: "Studio Concept • 01",
    tagline:
      "Internal full-stack Next.js 14 & Supabase reference platform demonstrating sub-second storefront rendering and real-time analytics.",
    category: "Web Development",
    impactMetric: "99/100",
    impactLabel: "Lighthouse Performance & Core Web Vitals Benchmark",
    year: "2026",
    duration: "Studio Prototype",
    summary:
      "An internal Axiom Studio engineering build showcasing how we architect modern full-stack web applications—combining Next.js App Router, typed Express APIs, real-time inventory state, and instant edge page loads.",
    challenge:
      "Conventional template-based websites and bloated e-commerce themes suffer from 4+ second mobile load times, rigid checkout flows, and fragile plugin updates that hurt conversions.",
    solution:
      "We engineered a modular headless reference architecture pairing server-rendered Next.js routes with a clean TypeScript API layer, optimistic cart mutations, and responsive Tailwind components.",
    architectureHighlights: [
      {
        title: "Hybrid Edge & SSR Rendering",
        description:
          "Static product and landing routes paired with dynamic streaming dashboards for instant navigation.",
      },
      {
        title: "End-to-End TypeScript Contracts",
        description:
          "Shared Zod validation schemas across frontend forms and backend API endpoints to eliminate runtime bugs.",
      },
      {
        title: "Zero-Bloat Bundle Architecture",
        description:
          "Code-split interactive islands keeping initial JavaScript lean and mobile Lighthouse scores at 99+.",
      },
    ],
    results: [
      "99/100 Lighthouse Performance and Accessibility benchmark on desktop & mobile",
      "Sub-300ms route transitions with Next.js App Router prefetching",
      "Clean, reusable full-stack starter blueprint ready for client customization",
    ],
    techStack: [
      "Next.js 14",
      "React",
      "TypeScript",
      "Node.js",
      "Supabase",
      "Tailwind CSS",
      "Vercel",
    ],
  },
  {
    id: "aura-web-experience",
    slug: "aura-web-experience",
    title: "Aura Interactive Brand & Motion Flagship",
    client: "Studio Concept • 02",
    tagline:
      "Concept brand website pairing editorial typography, 60fps Framer Motion & GSAP choreography, and conversion-first storytelling.",
    category: "Web Designing",
    impactMetric: "<1.1s",
    impactLabel: "First Contentful Paint with Full 60fps Motion Suite",
    year: "2026",
    duration: "Studio Prototype",
    summary:
      "Created by our design and motion team to demonstrate how high-impact visual storytelling, WebGL depth, and smooth scroll choreography can coexist with fast load speeds and clear conversion hierarchy.",
    challenge:
      "Many modern agency websites either look generic and static or overload the browser with heavy animations that stutter on laptops and mobile devices.",
    solution:
      "We crafted a balanced dark-and-light visual language using GPU-composited transforms, Lenis smooth scrolling, magnetic micro-interactions, and responsive typographic scales.",
    architectureHighlights: [
      {
        title: "60fps GPU Motion Choreography",
        description:
          "Every reveal, hover spotlight, and cursor interaction animates strictly via transform and opacity.",
      },
      {
        title: "Conversion-Led Visual Hierarchy",
        description:
          "Structured hero, proof, capability, and CTA rhythm engineered to guide visitors naturally toward inquiry.",
      },
      {
        title: "Adaptive Mobile & Desktop Polish",
        description:
          "Fluid clamp() typography and touch-aware fallbacks across phones, tablets, and studio monitors.",
      },
    ],
    results: [
      "Under 1.1s First Contentful Paint alongside interactive WebGL & scroll motion",
      "Full prefers-reduced-motion accessibility support built in from day one",
      "Modular visual language adaptable to SaaS, AI, and modern digital brands",
    ],
    techStack: [
      "Figma",
      "Tailwind CSS",
      "Framer Motion",
      "GSAP ScrollTrigger",
      "Lenis",
      "Three.js",
    ],
  },
  {
    id: "finflow-design-system",
    slug: "finflow-design-system",
    title: "FinFlow Multi-Theme SaaS UI/UX System",
    client: "Studio Concept • 03",
    tagline:
      "Comprehensive Figma-to-React product UI/UX concept featuring 120+ tokenized components, user flows, and dark/light parity.",
    category: "UI/UX Design",
    impactMetric: "120+",
    impactLabel: "Tokenized Figma & React UI Components",
    year: "2026",
    duration: "Studio Prototype",
    summary:
      "An internal UI/UX design system and SaaS workspace prototype demonstrating how Axiom Studio turns complex product workflows into clean, accessible, developer-ready interfaces.",
    challenge:
      "Growing software teams often struggle with inconsistent screens, confusing user onboarding, and messy design-to-developer handoffs that slow down feature releases.",
    solution:
      "We designed a unified variable-driven Figma library mapped 1:1 to Tailwind CSS tokens, complete with interactive onboarding flows, data tables, command palettes, and WCAG AA contrast.",
    architectureHighlights: [
      {
        title: "1:1 Figma-to-Tailwind Tokens",
        description:
          "Color, spacing, radius, and typography tokens structured identically across design files and React code.",
      },
      {
        title: "Frictionless User Flows",
        description:
          "Streamlined onboarding, empty states, inline validation, and keyboard-first navigation patterns.",
      },
      {
        title: "WCAG 2.1 AA Accessibility",
        description:
          "Verified contrast ratios, focus rings, and screen-reader semantics across every interactive state.",
      },
    ],
    results: [
      "120+ documented component variants covering forms, charts, modals, and navigation",
      "100% WCAG 2.1 AA contrast compliance across both dark and light modes",
      "Cuts frontend UI implementation time in half through clean auto-layout handoff",
    ],
    techStack: [
      "Figma",
      "Design Tokens",
      "Auto Layout",
      "Radix UI",
      "Tailwind CSS",
      "React",
    ],
  },
  {
    id: "atlas-ai-agent",
    slug: "atlas-ai-agent",
    title: "Atlas Autonomous Support & Lead-Qualification Agent",
    client: "Studio Concept • 04",
    tagline:
      "Custom RAG & tool-calling AI agent prototype that answers product queries from verified docs, qualifies leads, and books calls 24/7.",
    category: "AI Agents",
    impactMetric: "<1.4s",
    impactLabel: "Median Grounded Response & Tool Execution",
    year: "2026",
    duration: "Studio Prototype",
    summary:
      "An internal AI Agent build showcasing how we connect LLMs to real business workflows—combining document-grounded RAG answers, structured CRM lead capture, and human handoff guardrails.",
    challenge:
      "Off-the-shelf chatbots frustrate visitors with generic scripted replies or hallucinated answers disconnected from a company's real services, pricing, and calendar.",
    solution:
      "We built a schema-validated AI concierge grounded strictly on indexed company knowledge, equipped with typed tool calls to capture project requirements and route qualified leads directly to Slack/CRM.",
    architectureHighlights: [
      {
        title: "Strict Document-Grounded RAG",
        description:
          "Answers only from verified knowledge chunks with automatic fallback when a question is out of scope.",
      },
      {
        title: "Typed Zod Tool Execution",
        description:
          "Structured JSON function calling for lead qualification, service matching, and meeting scheduling.",
      },
      {
        title: "Human-in-the-Loop Escalation",
        description:
          "Instant conversation summary handoff to human team members for high-intent custom inquiries.",
      },
    ],
    results: [
      "Sub-1.4s median first-token response with streaming conversational UI",
      "Zero ungrounded pricing or policy hallucinations under adversarial prompt tests",
      "Embeddable across Next.js websites, client portals, Slack, and CRM webhooks",
    ],
    techStack: [
      "OpenAI / Claude",
      "Vercel AI SDK",
      "LangGraph",
      "Supabase pgvector",
      "Zod",
      "TypeScript",
    ],
  },
];

export const clientCaseStudies = clientsData;

