export interface NavLink {
  label: string;
  href: string;
  description?: string;
  badge?: string;
}

export const headerNavLinks = [
  { label: "Services", href: "#services", hasMegaMenu: true },
  { label: "Work", href: "/work", hasMegaMenu: false },
  { label: "Company", href: "/company", hasMegaMenu: false },
  {
    label: "Resources",
    href: "/resources/vendor-matrix",
    hasDropdown: true,
    dropdownItems: [
      { label: "AI Vendor Matrix", href: "/resources/vendor-matrix", description: "Evaluate & compare enterprise AI platforms" },
      { label: "Open Axiom", href: "/open-axiom", description: "Open-source agent skills, templates & tools" },
      { label: "Engineering Blog", href: "/blog", description: "Technical blueprints, architecture & evals" },
      { label: "Interactive Labs", href: "/demos/threat-monitor", description: "Live threat monitor, vector search & AI demos" },
    ]
  },
  { label: "Contact", href: "/contact", hasMegaMenu: false },
];

export const clientLogos = [
  { name: "Strata Systems", symbol: "◈ STRATA SYSTEMS" },
  { name: "Zenith Health AI", symbol: "✦ ZENITH HEALTH" },
  { name: "Vortex Capital", symbol: "▲ VORTEX CAPITAL" },
  { name: "Helix Cybersecurity", symbol: "⬡ HELIX DEFENSE" },
  { name: "Nova Commerce", symbol: "◆ NOVA COMMERCE" },
  { name: "Pulse Matrix", symbol: "◬ PULSE MATRIX" },
  { name: "Synthetix Labs", symbol: "⦿ SYNTHETIX" },
  { name: "Apex Protocol", symbol: "❖ APEX CLOUD" },
];

export const footerLinks = {
  services: [
    { label: "UI/UX Design", href: "/services/ui-ux-design" },
    { label: "Website Design", href: "/services/website-design" },
    { label: "Web Development", href: "/services/website-development" },
    { label: "AI Development", href: "/services/ai-development" },
    { label: "AI Agents", href: "/services/ai-agents" },
    { label: "Healthcare Apps", href: "/services/healthcare-apps" },
  ],
  work: [
    { label: "Strata Autonomous Resolution", href: "/work/strata-systems" },
    { label: "Zenith Clinician Copilot", href: "/work/zenith-health" },
    { label: "Vortex Signal Intelligence", href: "/work/vortex-capital" },
    { label: "Helix Zero-Trust Defense", href: "/work/helix-cyber" },
    { label: "Nova Headless Commerce", href: "/work/nova-commerce" },
    { label: "Pulse Matrix Routing", href: "/work/pulse-matrix" },
    { label: "Synthetix Media Studio", href: "/work/synthetix-labs" },
  ],
  resources: [
    { label: "AI Vendor Matrix", href: "/resources/vendor-matrix" },
    { label: "Open Axiom (Open Source)", href: "/open-axiom" },
    { label: "Technical Blog & Evals", href: "/blog" },
    { label: "Architecture Principles", href: "/company#principles" },
    { label: "Case Study Archive", href: "/work" },
  ],
  demos: [
    { label: "Threat Monitor (ATOM Red Team)", href: "/demos/threat-monitor" },
    { label: "Buyer Intent IQ", href: "/demos/intent-iq" },
    { label: "Infrastructure & Fiber Atlas", href: "/demos/infrastructure-atlas" },
    { label: "Acoustic Voice Sentiment", href: "/demos/voice-sentiment" },
    { label: "Vector Semantic Search", href: "/demos/vector-search" },
    { label: "Multimodal Emotion AI", href: "/demos/emotion-ai" },
  ],
  company: [
    { label: "About Axiom Labs", href: "/company" },
    { label: "Core Beliefs & Philosophy", href: "/company#beliefs" },
    { label: "Engineering Careers", href: "/contact" },
    { label: "Book Technical Consultation", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security & SOC2 Statement", href: "#" },
  ],
};
