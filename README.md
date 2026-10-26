# Axiom Studio — Enterprise AI Architecture & Digital Engineering

> **Axiom Studio** is an enterprise-grade digital flagship and autonomous systems studio platform. Built from scratch with Next.js 14 (App Router), Tailwind CSS, TypeScript, and native WebGL/Canvas shaders.

---

## Key Features & Capabilities

- **Light-Ray Conic Canvas Background**: GPU-accelerated ray-casting shader with zero client latency.
- **Dedicated Portfolio Gallery (`/work`)**: Category filter tabs (`All`, `AI Apps`, `Websites`, `Enterprise`), interactive dossier cards with verified ROI stats.
- **7 Detailed Case Study Dossiers (`/work/[slug]`)**:
  - *Strata Systems*: Autonomous cloud incident resolution engine (84% MTTR reduction).
  - *Zenith Health AI*: Clinician intelligence & real-time diagnostic copilot (78% charting reduction).
  - *Vortex Capital*: High-frequency market sentiment & execution engine (<12ms latency).
  - *Helix Cybersecurity*: Zero-trust edge security & automated pen-test defense (99.4% containment).
  - *Nova Commerce*: Headless omnichannel e-commerce & recommendation mesh (41% conversion lift).
  - *Pulse Matrix*: Global logistics route optimization & predictive dispatch (28% fuel savings).
  - *Synthetix Labs*: Generative multimodal audio & media synthesis platform (92% turnaround compression).
- **Company Narrative Hub (`/company`)**:
  - Three founding pillars (Design-First Innovation, Engineering Excellence, Real-World Impact).
  - Core Beliefs (01: Code as Deterministic Proof, 02: Human Sovereignty & Privacy, 03: Velocity Through Rigor).
  - Interactive Showcase Reel player simulation.
  - Expandable FAQ accordion.
- **Technical Blog & Insights (`/blog` & `/blog/[slug]`)**:
  - Production blueprints covering multi-agent orchestration, fine-tuning vs RAG, training economics, and synthetic evals.
  - Category filters, reading times, author avatars, and key architectural takeaway callout boxes.
- **Open-Source Catalog (`/open-axiom`)**:
  - 9 open-source tools across Agent Skills, Templates, Apps, and Tools.
  - One-click copyable terminal install commands (`npx create-axiom-template ...` / `pip install ...`).
  - Star ratings, fork counters, license badges, and direct GitHub links.
- **Interactive AI Vendor Matrix (`/resources/vendor-matrix`)**:
  - Comparative matrix across OpenAI, Claude, AWS Bedrock, Google Vertex AI, Azure OpenAI, Cohere, and Sovereign vLLM.
  - Interactive column sorting (Latency, Tool Calling Accuracy, Platform Name).
  - Dynamic filter chips (Dedicated VPC, Self-Hosted / On-Prem, HIPAA Compliant, PQC Ready).
  - Client-side dynamic CSV export download generator.
- **6 Upgraded Service Pages (`/services/[slug]`)**:
  - UI/UX Design, Website Design, Web Development, AI Development, AI Agents, Healthcare Apps.
  - 6 "What You Get" deliverables per discipline.
  - 4-phase "How We Work" structured delivery roadmaps with durations and tangible outputs.
  - Dedicated service-specific inline consultation forms and Accordion FAQs.
- **Interactive Labs & Demos**:
  - `ATOM Threat Monitor` (`/demos/threat-monitor`): Live simulated threat telemetry, MITRE ATLAS 16-technique heatmap, and auto-scrolling terminal log stream.
  - `Buyer Intent IQ` (`/demos/intent-iq`): Interactive sensitivity threshold slider (50 - 100) and AI outreach generator.
  - `Infrastructure Atlas` (`/demos/infrastructure-atlas`): Geospatial data center map, subsea fiber route explorer, and live round-trip ping calculations.
  - `Voice Sentiment Analyzer` (`/demos/voice-sentiment`): Real-time acoustic frequency spectrum, micro-tremor detector, and stress probability gauge.
  - `Atom Vector Search` (`/demos/vector-search`): Instant semantic vector search with live sub-50ms stopwatch timer.
  - `Multimodal Emotion AI` (`/demos/emotion-ai`): Real-time emotional radar visualizer for arbitrary user-entered text.
- **Real Backend Contact Form (`/api/contact`)**:
  - Native Next.js App Router API Route (`POST /api/contact`).
  - Anti-spam honeypot verification (`botField`).
  - Timestamp velocity protection (rejects automated bot submissions < 1000ms).
  - Strict regex email validation and payload verification.
- **Accessibility & Motion Compliance**:
  - Full `@media (prefers-reduced-motion: reduce)` support across all CSS transitions and animations.
  - WCAG 2.1 AA compliant contrast ratios and keyboard-accessible navigation drawers and accordions.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components & Client Hydration)
- **Styling**: Tailwind CSS 3.4
- **Language**: TypeScript 5.6
- **Icons**: Lucide React
- **Runtime**: Node.js 18+ / 20+ / 24+

---

## Decoupled System Architecture (Separate Front-End & Back-End)

Axiom Studio enforces a **strictly separated Front-End and Back-End service architecture**:

1. **Front-End Web Application (`src/`, Next.js 14 App Router on `0.0.0.0:3000`)**:
   - Pure UI, SSR/SSG pre-rendered routes (47 static/SSG pages including `/services/[slug]`), and `antimatterai.agency`-grade motion choreography (`Lenis` smooth scroll, character/word `SplitTextReveal`, vertical `0–9` slot-machine odometer `RollingNumber`, horizon rim-light `LogoStrip`, 3D `OrbitalThreatGlobe`, and volumetric `LightRays` + dust particle `<canvas>`).
   - Communicates exclusively via relative `/api/*` HTTP calls (`src/lib/apiClient.ts`) proxied by `next.config.mjs` to `BACKEND_INTERNAL_URL` (`http://127.0.0.1:4000`) so browser code never hardcodes `localhost`.
2. **Standalone Back-End API Service (`backend/`, Express + TypeScript + Zod on `0.0.0.0:4000`)**:
   - Independently installable, type-checked, and compiled Node.js REST service (`backend/package.json` & `backend/tsconfig.json`).
   - Provides `/api/health`, `/api/contact` (dual honeypot + `<1000ms` velocity gate + sliding-window IP rate limiter + Zod schema + Slack/Resend/Supabase/JSONL dispatch), `/api/vendors` & `/api/vendors/export.csv`, and live capability lab inference endpoints (`/api/labs/emotion-analyze`, `/api/labs/vector-search`, `/api/labs/intent-outreach`, `/api/labs/threat-telemetry`).

---

## Getting Started

### 1. Start the Standalone Back-End API (`:4000`)
```bash
cd backend
npm install
npm run build
npm run start
```

### 2. Start the Front-End Web Application (`:3000`)
```bash
# From repository root:
npm install
npm run dev:frontend
```
Open `http://localhost:3000` (all `/api/*` requests proxy seamlessly to the standalone Back-End on port `4000`).

### 3. Production Verification & Builds
```bash
npm run typecheck
npm run lint
npm run build:backend
npm run build:frontend
```

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/contact/route.ts        # Real contact backend API route (anti-spam)
│   │   ├── blog/                       # Engineering blog index
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx         # Dynamic article reader
│   │   ├── company/page.tsx            # Company narrative, story, pillars & FAQ
│   │   ├── contact/page.tsx            # Contact hub with global offices & FAQ
│   │   ├── demos/                      # Interactive Demos & Labs
│   │   │   ├── threat-monitor/page.tsx # ATOM Red Team Threat Monitor
│   │   │   ├── intent-iq/page.tsx      # Buyer Intent IQ Simulator
│   │   │   ├── infrastructure-atlas/   # Data Center & Fiber Map
│   │   │   ├── voice-sentiment/        # Acoustic Voice & Tremor Analyzer
│   │   │   ├── vector-search/          # Sub-50ms Vector Search
│   │   │   └── emotion-ai/             # Multimodal Sentiment Visualizer
│   │   ├── open-axiom/page.tsx         # Open-source catalog (skills, templates, tools)
│   │   ├── resources/vendor-matrix/    # Enterprise AI Vendor Matrix with CSV export
│   │   ├── services/[slug]/page.tsx    # 6 upgraded service pages (phases, deliverables, FAQs)
│   │   ├── work/                       # Portfolio gallery with category filters
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx         # 7 case study dossiers
│   │   ├── globals.css                 # Shaders, glassmorphism, prefers-reduced-motion
│   │   ├── layout.tsx                  # Global metadata, skip link, dark theme
│   │   └── page.tsx                    # Landing page
│   ├── components/
│   │   ├── Navbar.tsx                  # Header with mega-menu, resources dropdown, mobile drawer
│   │   ├── Hero.tsx                    # Light-ray hero with staggered text
│   │   ├── LightRays.tsx               # Conic light ray shader backdrop
│   │   ├── StatsSection.tsx            # Rolling-digit counters
│   │   ├── RollingNumber.tsx           # Scroll-triggered counter primitive
│   │   ├── ServicesGrid.tsx            # 6 service pillars
│   │   ├── CaseStudies.tsx             # Featured client dossiers
│   │   ├── LogoStrip.tsx               # Continuous marquee strip
│   │   ├── ContactSection.tsx          # Validated contact form (connected to /api/contact)
│   │   └── Footer.tsx                  # 5-column footer with dynamic live local clock
│   └── data/
│       ├── blog.ts                     # 4 technical blueprints & articles
│       ├── caseStudies.ts              # Compatibility alias
│       ├── clients.ts                  # 7 dummy client profiles & case studies
│       ├── navigation.ts               # Nav links, dropdowns, footer columns
│       ├── openSource.ts               # 9 open-source tools & templates
│       ├── services.ts                 # 6 services with deliverables, phases & FAQs
│       └── vendorMatrix.ts             # Comparison data for 7 AI platforms
├── AGENTS.md                           # Auto-discovered AI coding agent instructions
├── Animations.md                       # Exact antimatterai.agency animation & shader blueprint
├── MASTER_PROMPT.md                    # Master prompt for generating the 5-part architecture suite
├── PROGRESS.md                         # Detailed phase-by-phase implementation log
├── docs/
│   ├── 01-PRODUCTION-REQUIREMENTS-DOCUMENT.md
│   ├── 02-DESIGN-ARCHITECTURE.md
│   ├── 03-TECHNICAL-ARCHITECTURE.md
│   ├── 04-AGENT-INSTRUCTIONS.md
│   └── 05-TECHNICAL-WORKFLOW.md
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Architecture & Engineering Documentation Suite

| Document | Path | Description |
| :--- | :--- | :--- |
| **Production Requirements Document (PRD)** | [`docs/01-PRODUCTION-REQUIREMENTS-DOCUMENT.md`](docs/01-PRODUCTION-REQUIREMENTS-DOCUMENT.md) | Personas, conversion funnels, KPIs, and functional/non-functional specs across all 42 routes. |
| **Design Architecture** | [`docs/02-DESIGN-ARCHITECTURE.md`](docs/02-DESIGN-ARCHITECTURE.md) | Obsidian color tokens, glassmorphism recipes, volumetric lighting, typography, and component states. |
| **Technical Architecture** | [`docs/03-TECHNICAL-ARCHITECTURE.md`](docs/03-TECHNICAL-ARCHITECTURE.md) | Next.js 14 RSC/Client boundary map, typed domain schemas, and `POST /api/contact` anti-spam architecture. |
| **Agent Instructions** | [`AGENTS.md`](AGENTS.md) / [`docs/04-AGENT-INSTRUCTIONS.md`](docs/04-AGENT-INSTRUCTIONS.md) | Hard guardrails, codebase file-ownership map, and verification gates for autonomous coding agents. |
| **Technical Workflow** | [`docs/05-TECHNICAL-WORKFLOW.md`](docs/05-TECHNICAL-WORKFLOW.md) | Local dev setup, animation/content/API engineering playbooks, GitHub Actions CI, and rollback SOP. |
| **Animations Blueprint** | [`Animations.md`](Animations.md) | Drop-in `Lenis`, `GSAP`, `Framer Motion`, odometer, split-text, and shader parity guide from `antimatterai.agency`. |

---

## License
MIT License. 100% original code, copy, and architecture created for Axiom Studio.
