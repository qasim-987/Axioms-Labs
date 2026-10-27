export interface StudioServiceCatalogItem {
  id: string;
  slug: string;
  title: string;
  badge: string;
  summary: string;
  stack: string[];
}

export const STUDIO_LOCATIONS = [
  {
    city: "Kuopio",
    country: "Finland",
    timezone: "EET (UTC+2)",
    role: "Nordics & EU Client Strategy Hub",
  },
  {
    city: "Lahore",
    country: "Pakistan",
    timezone: "PKT (UTC+5)",
    role: "Full-Stack Web, UI/UX & AI Engineering Studio",
  },
];

export const STUDIO_SERVICES: StudioServiceCatalogItem[] = [
  {
    id: "web-development",
    slug: "web-development",
    title: "Web Development",
    badge: "Next.js & Full-Stack",
    summary:
      "Custom web applications, SaaS platforms, headless e-commerce, and scalable APIs built with Next.js 14, React, and TypeScript.",
    stack: [
      "Next.js 14",
      "React 18",
      "TypeScript",
      "Node.js",
      "PostgreSQL",
      "Supabase",
      "Vercel",
    ],
  },
  {
    id: "web-designing",
    slug: "web-designing",
    title: "Web Designing",
    badge: "Brand & Conversion",
    summary:
      "Modern, responsive, high-converting marketing websites and landing pages with distinct visual identity and 60fps motion.",
    stack: [
      "Figma",
      "Tailwind CSS",
      "Framer Motion",
      "GSAP",
      "Responsive Grids",
      "Technical SEO",
    ],
  },
  {
    id: "ui-ux-design",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    badge: "Figma & Design Systems",
    summary:
      "User flows, wireframes, interactive clickable prototypes, and tokenized Figma component libraries for web and mobile products.",
    stack: [
      "Figma Variables",
      "Auto-Layout",
      "Interactive Prototyping",
      "WCAG AA Accessibility",
      "Design Tokens",
    ],
  },
  {
    id: "ai-agents",
    slug: "ai-agents",
    title: "AI Agents",
    badge: "24/7 AI Automation",
    summary:
      "Custom AI support, lead-qualification, RAG knowledge retrieval, and tool-calling workflow agents grounded in your real business data.",
    stack: [
      "OpenAI",
      "Anthropic Claude",
      "Vercel AI SDK",
      "LangGraph",
      "Supabase pgvector",
      "Zod",
    ],
  },
];
