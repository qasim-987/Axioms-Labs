export interface ServicePhase {
  number: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  badge: string;
  heroHeadline: string;
  shortDesc: string;
  longDesc: string;
  iconName: string;
  metrics: string;
  deliverables: {
    title: string;
    description: string;
  }[];
  processPhases: ServicePhase[];
  faqs: ServiceFAQ[];
  tools: string[];
}

export const servicesData: ServiceItem[] = [
  {
    id: "web-development",
    slug: "web-development",
    title: "Web Development",
    badge: "Full-Stack Engineering",
    heroHeadline: "Fast, Scalable Web Applications Engineered for Growth",
    shortDesc:
      "Custom Next.js and React web applications, SaaS platforms, clean REST APIs, and modern full-stack architectures built for speed and reliability.",
    longDesc:
      "We engineer production-ready web platforms, SaaS dashboards, portals, and custom e-commerce storefronts using modern TypeScript stacks. Every codebase is structured for sub-second load times, SEO authority, security, and effortless future scaling.",
    iconName: "Code",
    metrics: "99+ Lighthouse Performance",
    deliverables: [
      {
        title: "Custom Next.js & React Applications",
        description:
          "Server-rendered and static-hybrid frontends utilizing App Router, TypeScript, and clean modular architecture.",
      },
      {
        title: "Scalable Backend & API Integration",
        description:
          "Type-safe Node.js/Express APIs, PostgreSQL & Supabase databases, authentication, and third-party webhook integrations.",
      },
      {
        title: "SaaS Dashboards & Client Portals",
        description:
          "Role-based user portals, real-time analytics views, Stripe billing flows, and responsive admin panels.",
      },
      {
        title: "Headless CMS & E-Commerce",
        description:
          "Flexible content management workflows and high-conversion custom storefronts tailored to your product catalog.",
      },
      {
        title: "Core Web Vitals & Technical SEO",
        description:
          " Asset optimization, semantic HTML5 structure, OpenGraph metadata, JSON-LD schema, and sub-second page transitions.",
      },
      {
        title: "Cloud Deployment & CI/CD Setup",
        description:
          "Automated GitHub preview builds, Vercel/cloud hosting, environment security, and zero-downtime production releases.",
      },
    ],
    processPhases: [
      {
        number: "01",
        title: "Architecture & Technical Scope",
        duration: "Week 1",
        description:
          "Defining database schemas, API contracts, authentication requirements, and clear sprint milestones.",
        deliverables: [
          "System Architecture Brief",
          "Database & API Schema",
          "Milestone Roadmap",
        ],
      },
      {
        number: "02",
        title: "Core Frontend & API Build",
        duration: "Weeks 2-4",
        description:
          "Developing modular React components, backend endpoints, and responsive layouts on live preview URLs.",
        deliverables: [
          "Live Staging Preview",
          "Typed REST/Server Endpoints",
          "Responsive UI Implementation",
        ],
      },
      {
        number: "03",
        title: "Integrations, QA & Speed Tuning",
        duration: "Week 5",
        description:
          "Connecting payments, emails, CMS, and running cross-browser QA plus Lighthouse performance optimization.",
        deliverables: [
          "99+ Lighthouse Audit",
          "End-to-End QA Verification",
          "Security & Rate-Limit Checks",
        ],
      },
      {
        number: "04",
        title: "Production Launch & Handover",
        duration: "Week 6",
        description:
          "Custom domain cutover, SSL/DNS setup, analytics configuration, and full source-code documentation.",
        deliverables: [
          "100% Source Code Ownership",
          "Production Deployment",
          "Post-Launch Support Window",
        ],
      },
    ],
    faqs: [
      {
        question: "What tech stack do you use for Web Development?",
        answer:
          "Our primary stack is Next.js, React, TypeScript, Tailwind CSS, Node.js/Express, and Supabase/PostgreSQL—deployed on Vercel or your preferred cloud provider.",
      },
      {
        question: "Do I get full ownership of the code after launch?",
        answer:
          "Yes, 100%. Once delivered, your repository, custom components, backend services, and deployment accounts belong entirely to you with zero vendor lock-in.",
      },
      {
        question: "Can you rebuild or modernize our existing slow website?",
        answer:
          "Absolutely. We regularly migrate legacy WordPress, Wix, or outdated React sites to clean Next.js architectures while preserving your SEO rankings and URLs.",
      },
    ],
    tools: [
      "Next.js 14",
      "React",
      "TypeScript",
      "Node.js",
      "Supabase",
      "PostgreSQL",
      "Vercel",
    ],
  },
  {
    id: "web-designing",
    slug: "web-designing",
    title: "Web Designing",
    badge: "Brand & Motion",
    heroHeadline: "High-Converting Websites That Make Your Brand Unforgettable",
    shortDesc:
      "Bespoke marketing websites, landing pages, interactive motion storytelling, and responsive visual layouts crafted to turn visitors into clients.",
    longDesc:
      "Your website is your first impression. We design modern, visually striking websites that combine strong brand identity, crisp typography, smooth Framer Motion & GSAP animations, and clear conversion architecture—never generic off-the-shelf templates.",
    iconName: "Globe",
    metrics: "< 1.2s LCP Load Speed",
    deliverables: [
      {
        title: "Custom Brand Website Design",
        description:
          "Tailor-made visual direction, color palettes, typography pairings, and layout composition aligned with your brand.",
      },
      {
        title: "High-Converting Landing Pages",
        description:
          "Conversion-focused hero sections, clear value propositions, social-proof blocks, and friction-free CTAs.",
      },
      {
        title: "Interactive Motion & Scroll Effects",
        description:
          "Tasteful 60fps animations, smooth Lenis scrolling, subtle 3D/WebGL accents, and hover micro-interactions.",
      },
      {
        title: "Mobile-First Responsive Layouts",
        description:
          "Fluid layouts carefully tuned for mobile phones, tablets, laptops, and ultra-wide desktop displays.",
      },
      {
        title: "Visual Assets & Custom Graphics",
        description:
          "Bespoke section illustrations, bento cards, glassmorphic UI previews, and crisp SVG iconography.",
      },
      {
        title: "Conversion & Copy Hierarchy",
        description:
          "Structured messaging flow that immediately communicates what you do, why it matters, and how to take action.",
      },
    ],
    processPhases: [
      {
        number: "01",
        title: "Brand Discovery & Moodboard",
        duration: "Days 1-4",
        description:
          "Understanding your audience, brand personality, visual references, and conversion goals.",
        deliverables: [
          "Visual Direction & Moodboard",
          "Typography & Color Palette",
          "Site Sitemap & Page Flow",
        ],
      },
      {
        number: "02",
        title: "Wireframing & Content Structure",
        duration: "Week 2",
        description:
          "Structuring every section from Hero to CTA so visitors effortlessly understand your offer.",
        deliverables: [
          "Page-by-Page Wireframes",
          "CTA & Conversion Map",
          "Responsive Grid Blueprint",
        ],
      },
      {
        number: "03",
        title: "High-Fidelity Visual & Motion Design",
        duration: "Weeks 3-4",
        description:
          "Designing polished desktop and mobile screens along with interactive hover and scroll motion concepts.",
        deliverables: [
          "Full Desktop & Mobile Mockups",
          "Interactive Motion Prototype",
          "Custom Visual Assets",
        ],
      },
      {
        number: "04",
        title: "Responsive Polish & Launch Readiness",
        duration: "Week 5",
        description:
          "Final visual QA across devices ensuring pixel-accurate spacing, contrast, and smooth animation timing.",
        deliverables: [
          "Organized Figma Master File",
          "Style Guide & Asset Kit",
          "Developer-Ready Specs",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you use pre-made themes or design everything from scratch?",
        answer:
          "Every website we design is custom-crafted from scratch around your brand positioning, target customers, and business goals—no recycled templates.",
      },
      {
        question: "Can you both design and develop our website end-to-end?",
        answer:
          "Yes! Most clients pair our Web Designing and Web Development services so our team takes your site from initial Figma concept all the way to a live Vercel deployment.",
      },
      {
        question: "Will animations slow down our website on mobile?",
        answer:
          "No. We use GPU-accelerated transforms and respect reduced-motion preferences so animations stay silky-smooth without hurting mobile speed.",
      },
    ],
    tools: [
      "Figma",
      "Tailwind CSS",
      "Framer Motion",
      "GSAP",
      "Lenis",
      "Three.js",
    ],
  },
  {
    id: "ui-ux-design",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    badge: "Product Experience",
    heroHeadline: "Intuitive Product Interfaces & Scalable Design Systems",
    shortDesc:
      "User research, wireframes, clickable Figma prototypes, and reusable component libraries for SaaS products, mobile apps, and web platforms.",
    longDesc:
      "Great software feels effortless to use. We turn complex workflows into clean, intuitive user experiences backed by structured user flows, interactive Figma prototypes, accessibility standards, and tokenized design systems your developers love.",
    iconName: "Layout",
    metrics: "100% WCAG 2.1 AA Accessible",
    deliverables: [
      {
        title: "UX Audits & User Journey Mapping",
        description:
          "Identifying friction points, drop-offs, and navigation bottlenecks across new or existing digital products.",
      },
      {
        title: "Information Architecture & Wireframes",
        description:
          "Clear user flows, onboarding sequences, and low-fidelity wireframes covering every state and edge case.",
      },
      {
        title: "Interactive Clickable Prototypes",
        description:
          "Realistic Figma prototypes you can test with stakeholders, investors, and real users before writing code.",
      },
      {
        title: "Scalable Design Systems",
        description:
          "Reusable buttons, inputs, modals, tables, color tokens, and spacing scales documented for fast development.",
      },
      {
        title: "SaaS & Dashboard UI Craft",
        description:
          "Clean data visualization, dark and light themes, clear visual hierarchy, and scannable workspace layouts.",
      },
      {
        title: "Developer Handoff & Design QA",
        description:
          "Annotated component specs, auto-layout tokens, and collaborative review with frontend engineers.",
      },
    ],
    processPhases: [
      {
        number: "01",
        title: "Product Discovery & User Flows",
        duration: "Week 1",
        description:
          "Mapping user personas, core tasks, and end-to-end product journeys to eliminate unnecessary clicks.",
        deliverables: [
          "User Flow Diagrams",
          "Information Architecture",
          "UX Audit Notes",
        ],
      },
      {
        number: "02",
        title: "Wireframing & Rapid Iteration",
        duration: "Week 2",
        description:
          "Validating screen layouts, navigation patterns, and empty/loading/error states quickly.",
        deliverables: [
          "Low-Fidelity Wireframes",
          "Core Screen Blueprints",
          "Navigation Prototype",
        ],
      },
      {
        number: "03",
        title: "UI Design System & High-Fi Screens",
        duration: "Weeks 3-4",
        description:
          "Building a cohesive component library and applying polished UI across every product screen.",
        deliverables: [
          "Tokenized Figma UI Kit",
          "High-Fidelity Product Screens",
          "Clickable User Prototype",
        ],
      },
      {
        number: "04",
        title: "Engineering Handoff & Walkthrough",
        duration: "Week 5",
        description:
          "Delivering clean spacing tokens, states, and responsive rules directly aligned with Tailwind/React.",
        deliverables: [
          "Component Documentation",
          "Exported Icons & Tokens",
          "Implementation Review",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the difference between Web Designing and UI/UX Design?",
        answer:
          "Web Designing focuses on brand websites and conversion-driven landing pages, while UI/UX Design focuses on interactive software products—such as SaaS dashboards, web apps, mobile apps, onboarding flows, and reusable component systems.",
      },
      {
        question: "Can you create a clickable prototype for our MVP or pitch?",
        answer:
          "Yes. Interactive Figma prototypes are one of our most popular deliverables for founders validating an MVP with customers or investors prior to full development.",
      },
      {
        question: "How do you hand off UI/UX files to developers?",
        answer:
          "Every Figma file uses clean Auto Layout, named color/spacing variables, component variants, and Tailwind-friendly scales so frontend build time is cut dramatically.",
      },
    ],
    tools: [
      "Figma",
      "Auto Layout & Variables",
      "FigJam",
      "Radix UI",
      "Tailwind CSS",
      "Framer Motion",
    ],
  },
  {
    id: "ai-agents",
    slug: "ai-agents",
    title: "AI Agents",
    badge: "Autonomous Workflows",
    heroHeadline: "Custom AI Agents That Automate Real Business Operations",
    shortDesc:
      "Intelligent AI assistants, lead-qualification bots, RAG knowledge copilots, and multi-step workflow agents connected directly to your tools.",
    longDesc:
      "We build practical, reliable AI agents tailored to your business workflows—from 24/7 website sales & support concierges and internal knowledge-base assistants (RAG) to automated CRM, email, and operations agents with strict accuracy guardrails.",
    iconName: "Bot",
    metrics: "24/7 Autonomous Execution",
    deliverables: [
      {
        title: "Website Sales & Support AI Agents",
        description:
          "Custom-branded conversational agents that answer customer questions, qualify leads, and book meetings 24/7.",
      },
      {
        title: "RAG Knowledge-Base Assistants",
        description:
          "AI copilots grounded strictly in your PDFs, docs, Notion pages, and product catalog with cited answers.",
      },
      {
        title: "Workflow & CRM Automation Agents",
        description:
          "Multi-step agents integrated with Slack, HubSpot, Gmail, Calendly, Supabase, and custom APIs.",
      },
      {
        title: "Structured Tool-Calling & Guardrails",
        description:
          "Schema-validated tool execution (Zod/MCP) and human-in-the-loop approvals so agents never go off-script.",
      },
      {
        title: "Custom Agent UI & Admin Logs",
        description:
          "Clean chat interfaces, conversation history dashboards, and prompt/performance monitoring.",
      },
      {
        title: "Model Selection & Cost Optimization",
        description:
          "Smart routing across OpenAI, Claude, Gemini, or open-weight models to keep responses fast and API costs low.",
      },
    ],
    processPhases: [
      {
        number: "01",
        title: "Workflow Audit & Use-Case Mapping",
        duration: "Week 1",
        description:
          "Identifying the highest-ROI repetitive tasks, data sources, and safety boundaries for your AI agent.",
        deliverables: [
          "Agent Scope & Tool Map",
          "Knowledge Source Inventory",
          "Guardrail & Escalation Rules",
        ],
      },
      {
        number: "02",
        title: "Knowledge Indexing & Agent Core",
        duration: "Weeks 2-3",
        description:
          "Building the retrieval pipeline, structured tool integrations, and prompt orchestration logic.",
        deliverables: [
          "Working Agent Prototype",
          "Vector Search / RAG Pipeline",
          "Typed API Tool Connectors",
        ],
      },
      {
        number: "03",
        title: "Testing, Guardrails & UI Integration",
        duration: "Week 4",
        description:
          "Testing edge cases, preventing hallucinations, and embedding the agent cleanly into your website or workspace.",
        deliverables: [
          "Accuracy & Safety Test Suite",
          "Embedded Web/Slack Interface",
          "Human Handoff Triggers",
        ],
      },
      {
        number: "04",
        title: "Deployment & Iteration",
        duration: "Week 5",
        description:
          "Launching to production with conversation logging so responses improve continuously from real usage.",
        deliverables: [
          "Live Production AI Agent",
          "Usage & Cost Telemetry",
          "Team Training & Playbook",
        ],
      },
    ],
    faqs: [
      {
        question: "How do you prevent an AI agent from giving wrong or made-up answers?",
        answer:
          "We ground agents strictly on your verified documents (RAG), enforce typed JSON schemas for tool calls, and configure clear fallback rules to hand over uncertain queries to your human team.",
      },
      {
        question: "Can you embed an AI agent directly into our existing website or CRM?",
        answer:
          "Yes. We build custom web chat widgets, full-page AI workspaces, Slack bots, and backend webhook agents that connect directly with your current site and tools.",
      },
      {
        question: "Which AI models do you build with?",
        answer:
          "We work across OpenAI (GPT-4o), Anthropic (Claude), Google Gemini, and open-source models—selecting the best fit for your speed, accuracy, and monthly API budget.",
      },
    ],
    tools: [
      "OpenAI API",
      "Anthropic Claude",
      "LangGraph",
      "Vercel AI SDK",
      "Supabase pgvector",
      "MCP",
      "TypeScript",
    ],
  },
];
