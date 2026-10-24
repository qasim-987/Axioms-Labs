export interface OpenSourceItem {
  id: string;
  slug: string;
  title: string;
  category: "Agent Skills" | "Templates" | "Apps" | "Tools";
  description: string;
  stars: string;
  forks: string;
  license: string;
  techStack: string[];
  installCommand?: string;
  githubUrl: string;
  demoUrl?: string;
  featured?: boolean;
}

export const openSourceItems: OpenSourceItem[] = [
  {
    id: "forensic-research-engine",
    slug: "forensic-research-engine",
    title: "Forensic Research Engine",
    category: "Agent Skills",
    description: "Autonomous deep investigative research skill for agent frameworks. Ingests corporate filings, cross-references disclosures, and generates structured analytical dossiers.",
    stars: "1.4k",
    forks: "180",
    license: "MIT",
    techStack: ["Python", "FastAPI", "DuckDuckGo API", "BeautifulSoup", "Pydantic"],
    installCommand: "pip install axiom-forensic-engine",
    githubUrl: "https://github.com/axiomlabs/forensic-research-engine",
    featured: true
  },
  {
    id: "frontier-model-architect",
    slug: "frontier-model-architect",
    title: "Frontier Model Training Architect",
    category: "Agent Skills",
    description: "Agent skill that sizes distributed GPU cluster topologies, calculates FLOP budgets, and optimizes mixed-precision training hyperparameters.",
    stars: "890",
    forks: "94",
    license: "Apache-2.0",
    techStack: ["Python", "PyTorch", "Megatron-LM", "CUDA", "vLLM"],
    installCommand: "pip install axiom-training-architect",
    githubUrl: "https://github.com/axiomlabs/frontier-model-architect",
    featured: false
  },
  {
    id: "orbitly-saas",
    slug: "orbitly-saas",
    title: "Orbitly — SaaS Engine Template",
    category: "Templates",
    description: "High-conversion SaaS starter template with edge rendering, Stripe billing, auth, and light-ray shaders pre-configured.",
    stars: "3.2k",
    forks: "410",
    license: "MIT",
    techStack: ["Next.js 14", "Tailwind CSS", "TypeScript", "Stripe", "Supabase"],
    installCommand: "npx create-axiom-template orbitly",
    githubUrl: "https://github.com/axiomlabs/orbitly-template",
    featured: true
  },
  {
    id: "nexus-enterprise-ai",
    slug: "nexus-enterprise-ai",
    title: "Nexus AI — Enterprise Platform Template",
    category: "Templates",
    description: "Clean enterprise dashboard and landing template tailored for complex AI platforms with telemetry charts and live model latency widgets.",
    stars: "2.1k",
    forks: "275",
    license: "MIT",
    techStack: ["Next.js", "Tailwind CSS", "Recharts", "Lucide Icons"],
    installCommand: "npx create-axiom-template nexus-ai",
    githubUrl: "https://github.com/axiomlabs/nexus-ai-template"
  },
  {
    id: "studio-veil",
    slug: "studio-veil",
    title: "Studio Veil — Creative Agency Template",
    category: "Templates",
    description: "Dark-mode editorial showcase template for high-end design studios, featuring 3D card tilt, magnetic cursors, and case study dossiers.",
    stars: "1.8k",
    forks: "190",
    license: "MIT",
    techStack: ["Next.js", "Framer Motion", "Tailwind CSS", "Lenis"],
    installCommand: "npx create-axiom-template studio-veil",
    githubUrl: "https://github.com/axiomlabs/studio-veil"
  },
  {
    id: "prism-chat",
    slug: "prism-chat",
    title: "Prism — Conversational AI Interface",
    category: "Templates",
    description: "Clean, token-streaming AI chat UI with markdown math rendering, code highlighting, voice transcription, and multi-model switching.",
    stars: "4.5k",
    forks: "620",
    license: "MIT",
    techStack: ["React", "TypeScript", "Tailwind CSS", "AI SDK", "Shadcn UI"],
    installCommand: "npx create-axiom-template prism-chat",
    githubUrl: "https://github.com/axiomlabs/prism-chat",
    featured: true
  },
  {
    id: "groundwork-starter",
    slug: "groundwork-starter",
    title: "Groundwork — Minimal Clean Starter",
    category: "Templates",
    description: "Minimalist, zero-bloat Next.js 14 baseline configured for 100 Lighthouse performance, strict accessibility, and SEO meta tags.",
    stars: "980",
    forks: "115",
    license: "MIT",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    installCommand: "npx create-axiom-template groundwork",
    githubUrl: "https://github.com/axiomlabs/groundwork"
  },
  {
    id: "signal-chat-app",
    slug: "signal-chat-app",
    title: "Signal — Zero-Knowledge AI Assistant",
    category: "Apps",
    description: "Open-source desktop and web assistant running 100% locally via WebLLM and Ollama with zero telemetry collection.",
    stars: "5.1k",
    forks: "780",
    license: "Apache-2.0",
    techStack: ["Electron", "React", "WebLLM", "Ollama", "Tailwind CSS"],
    githubUrl: "https://github.com/axiomlabs/signal-app",
    featured: true
  },
  {
    id: "meridian-workflow-engine",
    slug: "meridian-workflow-engine",
    title: "Meridian — Multi-Agent Orchestrator",
    category: "Tools",
    description: "Lightweight Python framework for orchestrating directed acyclic graph (DAG) agent workflows with automated step-back verification.",
    stars: "2.8k",
    forks: "340",
    license: "MIT",
    techStack: ["Python", "FastAPI", "Redis", "Pydantic"],
    installCommand: "pip install meridian-agents",
    githubUrl: "https://github.com/axiomlabs/meridian"
  }
];

export const openSourceCategories = ["All", "Agent Skills", "Templates", "Apps", "Tools"] as const;
