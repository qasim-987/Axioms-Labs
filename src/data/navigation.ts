export interface NavLink {
  label: string;
  href: string;
  description?: string;
  badge?: string;
}

export const headerNavLinks = [
  { label: "Services", href: "#services", hasMegaMenu: true },
  { label: "Concepts", href: "/work", hasMegaMenu: false },
  { label: "Company", href: "/company", hasMegaMenu: false },
  { label: "Blog", href: "/blog", hasMegaMenu: false },
  { label: "Contact", href: "/contact", hasMegaMenu: false },
];

export const clientLogos = [
  { name: "Next.js 14", symbol: "▲ NEXT.JS 14" },
  { name: "React", symbol: "⚛ REACT" },
  { name: "TypeScript", symbol: "◈ TYPESCRIPT" },
  { name: "Tailwind CSS", symbol: "✦ TAILWIND CSS" },
  { name: "Figma", symbol: "❖ FIGMA" },
  { name: "Framer Motion", symbol: "◬ FRAMER MOTION" },
  { name: "Three.js", symbol: "⬡ THREE.JS" },
  { name: "OpenAI & Agents", symbol: "⦿ AI AGENTS" },
  { name: "Supabase", symbol: "◆ SUPABASE" },
  { name: "Vercel", symbol: "▲ VERCEL" },
];

export const footerLinks = {
  services: [
    { label: "Web Development", href: "/services/web-development" },
    { label: "Web Designing", href: "/services/web-designing" },
    { label: "UI/UX Design", href: "/services/ui-ux-design" },
    { label: "AI Agents", href: "/services/ai-agents" },
  ],
  work: [
    { label: "Nexus SaaS & Commerce", href: "/work/nexus-commerce-os" },
    { label: "Aura Motion Flagship", href: "/work/aura-web-experience" },
    { label: "FinFlow UI/UX System", href: "/work/finflow-design-system" },
    { label: "Atlas Autonomous Agent", href: "/work/atlas-ai-agent" },
  ],
  company: [
    { label: "About Axiom Studio", href: "/company" },
    { label: "Core Beliefs & Process", href: "/company#beliefs" },
    { label: "Insights & Blog", href: "/blog" },
    { label: "Start Your Project", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/contact" },
    { label: "Terms of Service", href: "/contact" },
  ],
};
