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
      "Launch reliable websites and web applications with maintainable code, useful integrations, and performance built around your business needs.",
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
    id: "ui-ux-design",
    slug: "ui-ux-design",
    title: "UI/UX Web Design",
    badge: "Figma & Design Systems",
    summary:
      "Help customers understand your offer and navigate confidently with responsive website layouts, accessible user journeys, and developer-ready prototypes.",
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
      "Reduce repetitive work and improve response times with AI support, lead qualification, and knowledge assistants grounded in your business data.",
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

const SERVICE_ORDER = ["ui-ux-design", "web-development", "ai-agents"];
STUDIO_SERVICES.sort((a,b)=>SERVICE_ORDER.indexOf(a.slug)-SERVICE_ORDER.indexOf(b.slug));
