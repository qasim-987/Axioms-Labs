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
    id: "ui-ux-design",
    slug: "ui-ux-design",
    title: "UI/UX Web Design",
    badge: "Product Experience",
    heroHeadline: "Clear, Confident Web Experiences Designed Around Your Customers",
    shortDesc:
      "Help visitors understand your offer and find their next step with responsive websites, clear user journeys, accessible interfaces, and developer-ready Figma designs.",
    longDesc:
      "We bring website design and product UX together: clear messaging, responsive layouts, intuitive navigation, interactive prototypes, and reusable design systems. Validate the experience before development and give your team a consistent foundation for future updates.",
    iconName: "Layout",
    metrics: "WCAG 2.1 AA-focused design & builds",
    deliverables: [
      { title: "Responsive Websites & Landing Pages", description: "Clear page layouts, brand-consistent visuals, and purposeful calls to action that help customers understand your offer on any screen." },
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
        question: "Does this include website design as well as product UX?",
        answer:
          "Yes. UI/UX Web Design combines responsive marketing websites and landing pages with user journeys, product interfaces, prototypes, and reusable design systems. We agree the deliverables around your audience and business goals.",
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
    id: "web-development",
    slug: "web-development",
    title: "Web Development",
    badge: "Full-Stack Engineering",
    heroHeadline: "Fast, Scalable Web Applications Engineered for Growth",
    shortDesc:
      "Turn your designs into fast, reliable websites and web applications, with integrations and maintainable code that support your business as it grows.",
    longDesc:
      "We engineer production-ready web platforms, SaaS dashboards, portals, and custom e-commerce storefronts using modern TypeScript stacks. We focus on performance, accessibility, technical SEO, security, and maintainable code so your team can launch confidently and keep improving the product.",
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
    id: "ai-agents",
    slug: "ai-agents",
    title: "AI Agents",
    badge: "Autonomous Workflows",
    heroHeadline: "Custom AI Agents That Automate Real Business Operations",
    shortDesc:
      "Reduce repetitive work, answer customer questions, and qualify inquiries with AI assistants connected to your business knowledge and tools, with clear guardrails and human handoff.",
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
