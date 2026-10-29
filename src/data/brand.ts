/**
 * [NAME] Landing — brand content placeholders.
 * Replace the `[NAME]`, "[Word]", copy, and tool/asset references with the real brand.
 * No third-party brand names, logos, or copy are used here.
 */

export interface ToolIcon {
  name: string;
  // Lucide icon key used to render a small mark next to the tool name.
  icon: string;
}

export interface SubService {
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  title: string;
  eyebrow: string;
  description: string; // one-line description
  subServices: SubService[]; // 4 items
  tools: ToolIcon[]; // 3–6 tool logos/marks
  highlightWord?: string; // the single italic gradient word in the service page H1
}

export interface Stat {
  key: string;
  label: [string, string]; // two-line label
  // `target` drives the count-up; `text` is used for static badges such as "24/7".
  target?: number;
  suffix?: string;
  text?: string;
  format: "number" | "odometer" | "static";
}

export interface HeadlineWord {
  word: string;
  emphasis: boolean; // bold italic (700 italic)
}

export interface BrandHeadline {
  line1: HeadlineWord[];
  line2: HeadlineWord[];
  // Line 2 visual indent as a percentage of line width (removed on mobile).
  lineIndent: string;
}

export const BRAND_NAME = "[NAME]";

export const BRAND_SUBTEXT =
  "We craft digital products and brand experiences that perform across every screen.";

export const BRAND_STATS: Stat[] = [
  {
    key: "projects",
    label: ["Projects", "Delivered"],
    target: 50,
    suffix: "+",
    format: "number",
  },
  {
    key: "satisfaction",
    label: ["Client", "Satisfaction"],
    target: 100,
    suffix: "%",
    format: "odometer",
  },
  {
    key: "support",
    label: ["Support", "Available"],
    text: "24/7",
    format: "static",
  },
];

export const BRAND_HEADLINE: BrandHeadline = {
  line1: [
    { word: "Building", emphasis: false },
    { word: "Digital", emphasis: true },
  ],
  line2: [
    { word: "Solutions", emphasis: true },
    { word: "That", emphasis: false },
    { word: "Matter", emphasis: false },
  ],
  lineIndent: "26%",
};

export const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Company", href: "/company" },
  {
    label: "Services",
    href: "#services",
    items: [
      { label: "Overview", href: "#services" },
      { label: "Digital Product Design", href: "/services/digital-design" },
      { label: "Web Development", href: "/services/web-development" },
      { label: "UI/UX Design", href: "/services/ui-ux-design" },
    ],
  },
  {
    label: "Resources",
    href: "#resources",
    items: [
      { label: "Journal", href: "#resources" },
      { label: "Press", href: "#resources" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const SERVICES: Service[] = [
  {
    slug: "digital-design",
    title: "Digital Product Design",
    eyebrow: "Product design",
    description:
      "Bespoke digital products, design systems, and interactive interfaces shaped around your users.",
    subServices: [
      { title: "Product Design", description: "End-to-end product design from research to high-fidelity screens." },
      { title: "Design Systems", description: "Tokenized component libraries and documentation for fast, consistent development." },
      { title: "Prototyping", description: "Clickable prototypes for stakeholder and investor validation before code." },
      { title: "Design QA", description: "Implementation review and pixel-accurate handoff to engineering." },
    ],
    tools: [
      { name: "Figma", icon: "Layout" },
      { name: "ProtoPie", icon: "Play" },
      { name: "Principle", icon: "Maximize" },
      { name: "FigJam", icon: "Brain" },
    ],
    highlightWord: "Design",
  },
  {
    slug: "web-development",
    title: "Web Development",
    eyebrow: "Engineering",
    description:
      "Performant Next.js and React applications, SaaS platforms, and APIs built for speed and reliability.",
    subServices: [
      { title: "Frontend Engineering", description: "React and Next.js frontends with App Router, TypeScript, and Tailwind CSS." },
      { title: "Backend APIs", description: "Type-safe REST APIs, authentication, databases, and third-party webhook integrations." },
      { title: "SaaS Platforms", description: "Role-based portals, Stripe billing flows, and responsive admin dashboards." },
      { title: "Performance", description: "Core Web Vitals optimisation, technical SEO, and zero-downtime deployments." },
    ],
    tools: [
      { name: "Next.js", icon: "Code" },
      { name: "React", icon: "Code" },
      { name: "TypeScript", icon: "FileTypeTs" },
      { name: "Node.js", icon: "Terminal" },
      { name: "PostgreSQL", icon: "Database" },
      { name: "Vercel", icon: "Cloud" },
    ],
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    eyebrow: "Experience design",
    description:
      "User research, wireframes, clickable prototypes, and reusable component libraries for software products.",
    subServices: [
      { title: "UX Audit", description: "Identifying friction, drop-offs, and navigation bottlenecks in existing products." },
      { title: "User Flows", description: "Information architecture and low-fidelity wireframes covering every state." },
      { title: "Clickable Prototypes", description: "Realistic Figma prototypes tested with users before development." },
      { title: "Design Systems", description: "Reusable buttons, inputs, modals, tables, and spacing tokens for engineers." },
    ],
    tools: [
      { name: "Figma", icon: "Layout" },
      { name: "Auto Layout", icon: "Layout" },
      { name: "Radix UI", icon: "Menu" },
      { name: "Tailwind CSS", icon: "FileTypeTs" },
    ],
    highlightWord: "Experience",
  },
  {
    slug: "ai-automation",
    title: "AI Automation",
    eyebrow: "Automation",
    description:
      "Intelligent assistants, knowledge copilots, and workflow agents connected to your tools.",
    subServices: [
      { title: "Support Agents", description: "Conversational agents that answer questions and qualify leads around the clock." },
      { title: "Knowledge Copilots", description: "RAG assistants grounded in your documents and product catalog." },
      { title: "Workflow Agents", description: "Multi-step agents integrated with Slack, email, CRM, and custom APIs." },
      { title: "Guardrails", description: "Schema-validated tool execution with human-in-the-loop approvals." },
    ],
    tools: [
      { name: "OpenAI", icon: "Bot" },
      { name: "Anthropic", icon: "Bot" },
      { name: "LangGraph", icon: "GitBranch" },
      { name: "Vercel AI SDK", icon: "Sparkles" },
      { name: "pgvector", icon: "Database" },
    ],
    highlightWord: "Automation",
  },
];

export const SERVICES_BY_SLUG: Record<string, Service> = Object.fromEntries(
  SERVICES.map((s) => [s.slug, s])
);

export const NAV_CTA = "Start Your Project";

export const COUNTRY_CODES = ["+1", "+44", "+49", "+61", "+81", "+92"];

export const BUDGET_OPTIONS = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
];
