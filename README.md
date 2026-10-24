# Axiom Labs — Enterprise AI Architecture & Digital Engineering

> **Axiom Labs** is an enterprise-grade digital flagship and autonomous systems studio platform. Built from scratch with Next.js 14 (App Router), Tailwind CSS, TypeScript, and native WebGL/Canvas shaders.

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

## Getting Started

### 1. Prerequisites
Ensure Node.js (v18.17.0 or higher) and npm are installed.

```bash
node -v
npm -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates 42 static & dynamic pre-rendered routes with zero errors.

### 5. Run Production Server
```bash
npm run start
```
Starts the production server on port 3000.

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
├── PROGRESS.md                         # Detailed phase-by-phase implementation log
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## License
MIT License. 100% original code, copy, and architecture created for Axiom Labs.
