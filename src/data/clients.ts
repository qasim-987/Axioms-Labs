export interface ClientCaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  tagline: string;
  category: "Web Development" | "UI/UX Web Design" | "AI Agents";
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
  "UI/UX Web Design",
  "AI Agents",
] as const;

export const clientsData: ClientCaseStudy[] = [
  {
    id: "kuopio-bites",
    slug: "kuopio-bites",
    title: "Kuopio Bites — Restaurant Website & Online Ordering",
    client: "Live Product • Kuopio, Finland",
    tagline: "Grilli, pizzeria & South Asian kitchen under one roof — a full online menu, live offers and ordering info for Kuopio.",
    category: "Web Development",
    impactMetric: "Live",
    impactLabel: "Production product at kuopiobites.fi — a real business, not a concept build",
    year: "Live",
    duration: "Founder-built, in production",
    summary: "Kuopio Bites is a working restaurant on Jalkasenkatu, Kuopio — a grilli, wood-fired pizzeria and South Asian kitchen in one. We built its public home: a category-driven online menu with item deep-links, daily specials, time-boxed offers, opening hours, map, phone ordering, and clear links to Wolt, Uber Eats and WhatsApp.",
    challenge: "A neighbourhood restaurant with three food cultures and dozens of dishes had its story scattered across delivery apps, phone orders and social posts — customers could not see today's specials, offers or opening hours in one place.",
    solution: "One fast, mobile-first website: a browse-by-category menu with featured dishes, a specials and offers layer, an hours-map-contact block with pickup and delivery radius, and external delivery partners linked exactly where they belong.",
    architectureHighlights: [
      {
        title: "Online Ordering Menu",
        description:
          "Category grid and item deep-links across 20+ menu sections, with featured house favourites.",
      },
      {
        title: "Specials & Offers",
        description:
          "Daily specials and time-boxed offers — like weekend halwa puri pre-orders — visible at a glance.",
      },
      {
        title: "Hours, Map & Phone Ordering",
        description:
          "Per-day opening hours, address with directions, and tap-to-call during kitchen hours.",
      },
      {
        title: "Delivery Partner Links",
        description:
          "Wolt, Uber Eats and WhatsApp ordering linked clearly alongside pickup and 6 km delivery info.",
      },
    ],
    results: [
      "Live in production at kuopiobites.fi",
      "Menu, specials and offers presented from a single source",
      "Pickup and delivery within 6 km, min order €0.00, stated up front",
    ],
    techStack: [
      "Mobile-first responsive build",
      "Structured menu & offers data",
      "Wolt / Uber Eats / WhatsApp integrations",
    ],
    liveUrl: "https://www.kuopiobites.fi",
  },
  {
    id: "aura-web-experience",
    slug: "aura-web-experience",
    title: "Aura Interactive Brand & Motion Flagship",
    client: "Lab Concept • 01",
    tagline:
      "Concept brand website pairing editorial typography, 60fps Framer Motion & GSAP choreography, and conversion-first storytelling.",
    category: "UI/UX Web Design",
    impactMetric: "Sub-1.1s",
    impactLabel: "first contentful paint target with the full motion suite (lab target, unmeasured)",
    year: "2026",
    duration: "Lab Prototype",
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
      "Sub-1.1s first contentful paint target alongside interactive WebGL & scroll motion (lab target, unmeasured)",
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
    client: "Lab Concept • 02",
    tagline:
      "Comprehensive Figma-to-React product UI/UX concept featuring 120+ tokenized components, user flows, and dark/light parity.",
    category: "UI/UX Web Design",
    impactMetric: "120+",
    impactLabel: "Tokenized Figma & React UI Components",
    year: "2026",
    duration: "Lab Prototype",
    summary:
      "An internal UI/UX design system and SaaS workspace prototype demonstrating how Axioms Lab turns complex product workflows into clean, accessible, developer-ready interfaces.",
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
          "Contrast ratios, focus rings, and screen-reader semantics designed to WCAG 2.1 AA across every interactive state.",
      },
    ],
    results: [
      "Documented component variant library covering forms, charts, modals, and navigation",
      "WCAG 2.1 AA contrast targeted across both dark and light modes (design target, not an audit result)",
      "Designed to shorten frontend UI implementation through clean auto-layout handoff (target, not measured)",
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
    client: "Lab Concept • 03",
    tagline:
      "Custom RAG & tool-calling AI agent prototype that answers product queries from verified docs, qualifies leads, and books calls 24/7.",
    category: "AI Agents",
    impactMetric: "<1.4s",
    impactLabel: "Median Grounded Response & Tool Execution",
    year: "2026",
    duration: "Lab Prototype",
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

/** Service -> concept builds that demonstrate it (internal authority links). */
export const SERVICE_RELATED_BUILDS: Record<string, string[]> = {
  "web-development": ["kuopio-bites", "finflow-design-system"],
  "ui-ux-design": ["finflow-design-system", "aura-web-experience"],
  "web-designing": ["aura-web-experience"],
  "ai-agents": ["atlas-ai-agent"],
  "seo-aeo": ["kuopio-bites"],
  "graphic-design": ["aura-web-experience"],
  "video-editing": ["aura-web-experience"],
};
