# Axiom Studio — Web Development, Web Designing, UI/UX & AI Agents

> **Axiom Studio** is a digital product & AI agent studio operating from **Kuopio, Finland** and **Lahore, Pakistan**. This repository holds the production front-end (Next.js 14 App Router) and a standalone back-end API service (Express + TypeScript + Zod).

> **Document status:** this README describes the code that is actually in the repository **today** — 12 route definitions / 23 prerendered routes (26 pages in the Next.js build counter), 4 service pillars, 4 studio concept builds, and a decoupled back-end that owns the contact pipeline. It was last reconciled against the codebase on **31 October 2026** (branch `arena/c1f221f4-axioms-labs`, commit `e93cf7a`). Older architecture notes that describe removed routes (`/demos/*`, `/open-axiom`, `/resources/vendor-matrix`) are retained only as history in `docs/01`–`docs/05` and are **not** a description of the current site.

---

## 1. Platform at a glance

| | |
| :--- | :--- |
| **Brand** | Axiom Studio — `https://axiomstudio.agency` · `contact@axiomstudio.agency` |
| **Studios** | Kuopio, Finland (Nordics & EU client strategy) · Lahore, Pakistan (full-stack engineering) |
| **Core disciplines** | Web Development · Web Designing · UI/UX Design · AI Agents |
| **Routes shipped** | **12** route definitions → **23** prerendered routes → **26** pages in the Next.js production build counter (1 home, 1 work index + 4 dossiers, 4 compatibility redirects, 1 company, 1 contact, 1 blog index + 4 articles, 4 service pages, sitemap, robots, 404) |
| **Route definitions** | `/` · `/blog` · `/blog/[slug]` · `/case-study/[slug]` · `/company` · `/contact` · `/work` · `/work/[slug]` · `/services/[slug]` · `/robots.txt` · `/sitemap.xml` · `/_not-found` |
| **Front-end** | Next.js 14.2 (App Router) on `0.0.0.0:3000` |
| **Back-end** | Express 4 + TypeScript + Zod on `0.0.0.0:4000` |
| **First Load JS (shared)** | 87.4 kB |

---

## 2. What is actually implemented

### 2.1 Home (`/`)
`src/app/page.tsx` composes, in order: `Navbar` → `Hero` → `LogoStrip` → `StatsSection` → `ConceptBuildsGate` → `ServicesGrid` → `MethodologySection` → `ContactSection` → `Footer`.

- **Hero** — five-layer scene: radial micro-grid backdrop, giant `AXIOM STUDIO` ghost watermark with scroll parallax, mouse-reactive pastel light beam, centred hollow WebGL particle sphere, and character-by-character 3D kinetic typography with magnetic pill CTAs and a `0123456789` odometer strip. Multi-plane scrubbed exit.
- **LogoStrip** — continuous technology/framework marquee (Next.js, React, TypeScript, Tailwind, Figma, Framer Motion, Three.js, AI Agents, Supabase, Vercel) with inline monoline icons, desktop hover pause, offscreen pause, and a reduced-motion single-copy wrap.
- **StatsSection / RollingNumber** — scroll-triggered slot-machine odometer counters.
- **ConceptBuildsGate** — desktop-only lazy mount of the `CaseStudies` showcase (`HIDE_CONCEPT_BUILDER = "mobile"`), so phones/tablets never allocate the WebGL or the showcase subtree.
- **ServicesGrid** — the centrepiece: a scroll-scrubbed, pinned **opaque card deck** (4 services) with a shared particle canvas that morphs between service shapes, a two-level fit ladder, ink-wipe card transitions, an upcoming-card preview deck, and a separate native-swipe **mobile** composition (`MobileServices`).
- **MethodologySection** — 4-phase delivery methodology with sticky scroll choreography.
- **ContactSection** — the scoping form, validated in the browser and again on the back-end.

### 2.2 Work & concept builds (`/work`, `/work/[slug]`)
Four honest **Studio Concept** builds (no invented third-party clients):

| Slug | Build | Discipline |
| :--- | :--- | :--- |
| `nexus-commerce-os` | Nexus SaaS & Headless Commerce Platform | Web Development |
| `aura-web-experience` | Aura Interactive Brand & Motion Flagship | Web Designing |
| `finflow-design-system` | FinFlow Multi-Theme SaaS UI/UX System | UI/UX Design |
| `atlas-ai-agent` | Atlas Autonomous Support & Lead-Qualification Agent | AI Agents |

Each dossier carries a challenge → solution narrative, architecture highlights, results and a tech stack. `/case-study/[slug]` is a compatibility route that issues a **307 redirect** to `/work/[slug]` via Next.js `redirect()`.

### 2.3 Services (`/services/[slug]`)
Four pillars — `web-development`, `web-designing`, `ui-ux-design`, `ai-agents` — each with a hero headline, 6 deliverables, a 4-phase delivery roadmap with durations and outputs, a technology ribbon, an inline consultation form and an accordion FAQ. Launch pricing is centralised in `src/config/pricing.ts` and feeds the visible copy, the `<title>`/description, and the `Service` JSON-LD.

### 2.4 Company (`/company`)
Mission statement ("Companies create products. Axiom Creates Impact."), the **two studio hubs** — Kuopio and Lahore — with their roles, the **four core beliefs** under "How We Approach Every Build" (Craft Over Complexity, Direct Maker Collaboration, Motion With Purpose, Practical Autonomous AI), and a closing call to action. Rendered as a client component with split-text reveals and scroll choreography.

### 2.5 Blog (`/blog`, `/blog/[slug]`)
Four technical articles with category filters, reading times, author attribution and key-takeaway callouts:

- `how-to-build-ai-agents-that-actually-help-customers` (featured)
- `nextjs-performance-checklist-for-99-lighthouse-websites`
- `high-converting-web-design-hierarchy-and-visual-storytelling`
- `figma-to-code-ui-ux-design-systems-that-scale`

### 2.6 Contact (`/contact`)
Dedicated scoping page: "Let's Connect" hero, the **two studio hubs** (Kuopio & Lahore) with their focus areas, a trust strip (100% IP ownership, NDA available on request, response time), and the full inquiry form — name, email, company, service, estimated budget (the six centralised bands), and a project brief. The form posts to `/api/contact`, which is served by the **back-end** through the Next.js rewrite — never by a Next.js route handler.

---

## 3. Decoupled system architecture

The front-end and back-end are two independently installable, independently type-checked services. The browser never learns the back-end address.

```
Browser ── relative "/api/*" ──► Next.js 14 (0.0.0.0:3000)
                                         │  next.config.mjs → rewrites
                                         ▼
                                  Express + Zod API (0.0.0.0:4000)
```

### 3.1 Front-end (`src/`)
- Next.js `14.2` App Router, React `18.3`, TypeScript `5.6` (`strict: true`), Tailwind CSS `3.4`.
- **Zero route handlers** in `src/app/api/*` — there is no such directory.
- Server Components by default; `"use client"` only where browser state is genuinely required.
- All API traffic goes through `src/lib/apiClient.ts` using **relative URLs only**, proxied by `next.config.mjs` to `BACKEND_INTERNAL_URL` (default `http://127.0.0.1:4000`).

### 3.2 Back-end (`backend/`)
Standalone Express service with its own `package.json`, `package-lock.json` and `tsconfig.json`.

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/` | Service status card (name, version, studios, capabilities, endpoint index) |
| `GET` | `/api/health` | Liveness + uptime + delivery-adapter configuration metrics |
| `GET` | `/api/services` | Canonical service catalogue + studio locations |
| `POST` | `/api/contact` | Inquiry intake (anti-spam → Zod validation → persistence + delivery) |
| `GET` | `/api/contact/status` | Operational flag + session inquiry metrics |

**Contact pipeline, in order:**
1. **Rate limit** — sliding-window limiter, 10 `POST /api/contact` per 10 minutes per client IP, emitting `X-RateLimit-Limit` / `-Remaining` / `-Reset` and `Retry-After`.
2. **Anti-spam** — primary honeypot (`botField`), secondary honeypot (`websiteUrl`), and a velocity gate that traps submissions completed in under 1000 ms. Trapped submissions return a silent `200` so scrapers cannot fingerprint the trap.
3. **Validation** — strict Zod schema (`backend/src/schemas/contact.schema.ts`): names, corporate e-mail, company, service, budget, message (10–5000 chars), optional `phone` / `countryCode`, plus the anti-spam fields.
4. **Persistence & delivery** — every inquiry is appended to a local, git-ignored JSONL audit ledger (`backend/data/inquiries.jsonl`); optional **Resend** e-mail, **webhook** (Slack / Linear / CRM) and **Supabase** adapters activate only when their environment variables are set. Each inquiry receives an `axs_<12 hex>` id.

**Middleware stack:** `securityHeaders` (nosniff, referrer policy, permissions policy, DNS prefetch), CORS (configurable allow-list, `*` permitted for previews), a 32 kB JSON body cap, and a structured JSON request logger.

---

## 4. Tech stack

### Front-end dependencies
`next` 14.2 · `react` / `react-dom` 18.3 · `typescript` 5.6 · `tailwindcss` 3.4 · `framer-motion` 14.6 (16 files) · `gsap` 3.15 + ScrollTrigger (19 files) · `lenis` 1.3 · `three` 0.186 (+`@types/three`) · `lucide-react` 0.453 · `@fontsource/plus-jakarta-sans` · `zod` 4 (currently imported only by the retained `src/components/landing/ContactForm.tsx`; live form validation happens on the back-end).

### Back-end dependencies
`express` 4.21 · `cors` 2.8 · `zod` 3.23 · `typescript` 5.6 · `tsx` 4.19 (dev watcher).

---

## 5. Getting started

### 5.1 Back-end API (`:4000`)
```bash
cd backend
npm install
npm run dev      # tsx watch
# or
npm run build && npm run start
```

### 5.2 Front-end (`:3000`)
```bash
npm install
npm run dev:frontend
```

Open `http://localhost:3000`. All `/api/*` requests are proxied to the back-end on port `4000`; if the back-end is not running, the site still renders and only the contact submission degrades.

### 5.3 Environment variables
`.env.example` (front-end) and `backend/.env.example` (back-end):

| Variable | Service | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Front-end | Canonical public URL |
| `BACKEND_INTERNAL_URL` | Front-end | Rewrite target for `/api/*` (default `http://127.0.0.1:4000`) |
| `PORT` / `HOST` | Back-end | Listen port and interface (default `4000` / `0.0.0.0`) |
| `CORS_ALLOWED_ORIGINS` | Back-end | Comma-separated allow-list, or `*` |
| `RESEND_API_KEY` | Back-end | Enables the e-mail delivery adapter |
| `CONTACT_NOTIFICATION_EMAIL` | Back-end | Inquiry notification recipient |
| `CONTACT_WEBHOOK_URL` | Back-end | Enables the webhook adapter |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Back-end | Enable Supabase persistence |

### 5.4 Verification gate (run before every completion)
```bash
npm run typecheck   # tsc --noEmit for front-end AND back-end
npm run lint        # next lint
npm run build       # next build — must emit the full route table
npm run build:backend
```

Optional offline QA harnesses live in `scripts/` (`check-performance-tier.cjs`, `check-services-timeline.cjs`, `check-card-transitions.cjs`, `check-mobile-view.cjs`, `check-services-browser.cjs`, `check-responsive-extras.cjs`, `check-hero-restore.cjs`, `check-mobile-config.cjs`). They require Playwright/pngjs installed **outside** the repository and are therefore not part of `package.json`.

### 5.5 Continuous integration
`.github/workflows/ci.yml` runs on every push and pull request to `main`: legacy brand-string hygiene check → `npm ci` → front-end and back-end type-check → ESLint → production front-end build. The back-end job additionally compiles the service.

---

## 6. Project structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Metadata, JSON-LD, skip link, Lenis + scroll-progress shell
│   │   ├── page.tsx                   # Home composition (Navbar → … → Footer)
│   │   ├── globals.css                # Antigravity tokens, glass panels, rays, reduced-motion rules
│   │   ├── robots.ts · sitemap.ts     # SEO metadata routes
│   │   ├── company/page.tsx           # Studio narrative
│   │   ├── contact/page.tsx           # Scoping form + studio hubs
│   │   ├── work/page.tsx              # Concept build index
│   │   ├── work/[slug]/page.tsx       # Concept build dossier
│   │   ├── case-study/[slug]/page.tsx # Compatibility redirect → /work/[slug]
│   │   ├── blog/page.tsx              # Article index with category filter
│   │   ├── blog/[slug]/page.tsx       # Article reader
│   │   └── services/[slug]/page.tsx   # Service pillar page (SSG + JSON-LD + pricing)
│   ├── components/                    # Live UI (see §2 for the composition)
│   │   ├── Navbar.tsx                 # Mega-menu, mobile drawer, measured bar height
│   │   ├── Hero.tsx · ParticleSphereHero.tsx · TouchHeroSphere.tsx
│   │   ├── LightRays.tsx · LightBeam.tsx · LogoStrip.tsx
│   │   ├── StatsSection.tsx · RollingNumber.tsx · SplitTextReveal.tsx
│   │   ├── ServicesGrid.tsx · MobileServices.tsx · ServicesParticleCanvas.tsx
│   │   ├── ServiceDetailClient.tsx · ServiceToolIcons.tsx · ToolChipContent.tsx
│   │   ├── ConceptBuildsGate.tsx · CaseStudies.tsx · CaseStudyScrollShowcase.tsx
│   │   ├── CaseStudyDetailClient.tsx · WorkPageContent.tsx · CompanyPageContent.tsx
│   │   ├── MethodologySection.tsx · ContactSection.tsx · LaunchPricing.tsx
│   │   ├── Footer.tsx · SpotlightCard.tsx · ScrollProgressBar.tsx
│   │   ├── SmoothScrollProvider.tsx   # Lenis + ScrollTrigger scroller sync
│   │   └── landing/                   # RETAINED, NOT WIRED — see §8
│   ├── lib/
│   │   ├── apiClient.ts               # Typed relative-/api client
│   │   ├── particleEngine.ts          # Shared Three.js particle engine
│   │   ├── serviceParticleShapes.ts   # Per-service morph shape generators
│   │   ├── performanceTier.ts         # Device tier + FPS governor
│   │   ├── motionTokens.ts            # Shared easing curves
│   │   └── (landing-era modules — see §8)
│   ├── data/  services.ts · clients.ts · blog.ts
│   ├── config/ pricing.ts · responsive.ts
│   └── hooks/   (landing-era — see §8)
├── backend/src/
│   ├── index.ts · app.ts
│   ├── config/env.ts
│   ├── middleware/  rateLimiter · requestLogger · securityHeaders
│   ├── routes/      health · contact · catalog
│   ├── schemas/     contact.schema.ts
│   └── services/    catalog · delivery · antiSpam
├── scripts/          # Optional offline QA harnesses (external deps)
├── docs/             # Architecture suite + implementation reports
├── Animations.md     # Motion blueprint & parity matrix (authoritative motion reference)
├── AGENTS.md         # Agent operating rules
├── MASTER_PROMPT.md  # Prompt that generated the docs/01–05 architecture suite
├── PROGRESS.md       # Current implementation status & roadmap
├── next.config.mjs   # Redirects, /api rewrites, security headers
└── tailwind.config.ts
```

---

## 7. Documentation index

| Document | Path | Status |
| :--- | :--- | :--- |
| **Agent operating rules** | [`AGENTS.md`](AGENTS.md) | Current — file-ownership map reconciled against the codebase |
| **Motion blueprint & parity matrix** | [`Animations.md`](Animations.md) | Current — updated 29 Oct 2026 (§14 responsive motion, §15 services deck) |
| **Implementation status** | [`PROGRESS.md`](PROGRESS.md) | Current — reconciled 31 Oct 2026 |
| Responsive implementation audit | [`docs/responsive-audit.md`](docs/responsive-audit.md) | Current — measured Chromium evidence, 28 Oct 2026 |
| Mobile & tablet overhaul | [`docs/mobile-tablet-overhaul.md`](docs/mobile-tablet-overhaul.md) | Current — pricing audit + swipe/gesture spec, 29 Oct 2026 |
| Services deck polish | [`docs/services-polish.md`](docs/services-polish.md) | Current — opaque deck geometry & constants, 29 Oct 2026 |
| Card transition correction | [`docs/card-transition-fix.md`](docs/card-transition-fix.md) | Current — ink-wipe choreography, 30 Oct 2026 |
| Dark-landing file tree | [`docs/FILE_TREE.md`](docs/FILE_TREE.md) | Historical — describes the retained, unwired `src/components/landing/` scope |
| Production Requirements | [`docs/01-PRODUCTION-REQUIREMENTS-DOCUMENT.md`](docs/01-PRODUCTION-REQUIREMENTS-DOCUMENT.md) | Historical — written for the earlier 42-route site |
| Design Architecture | [`docs/02-DESIGN-ARCHITECTURE.md`](docs/02-DESIGN-ARCHITECTURE.md) | Historical — palette principles still current |
| Technical Architecture | [`docs/03-TECHNICAL-ARCHITECTURE.md`](docs/03-TECHNICAL-ARCHITECTURE.md) | Historical — describes removed `/api/labs/*` endpoints |
| Agent Instructions | [`docs/04-AGENT-INSTRUCTIONS.md`](docs/04-AGENT-INSTRUCTIONS.md) | Historical — superseded by [`AGENTS.md`](AGENTS.md) |
| Technical Workflow | [`docs/05-TECHNICAL-WORKFLOW.md`](docs/05-TECHNICAL-WORKFLOW.md) | Historical — local dev & CI guidance still largely usable |
| Test checklist / timing table | [`docs/TEST_CHECKLIST.md`](docs/TEST_CHECKLIST.md) · [`docs/TIMING_TABLE.md`](docs/TIMING_TABLE.md) | Historical — route list outdated |

---

## 8. Retained but unwired code — read before you build

`src/components/landing/` (17 files) is a **complete, self-contained dark-theme landing experience** — hero intro timeline, WebGL particle morph, pinned services, card→service transition and its own contact form. It was merged in PR #6, then deliberately **kept unwired** when the owner chose to preserve the light Antigravity overhaul (commit `4ed1706f`, "preserve light overhaul per owner choice"). Its supporting modules are equally unwired:

`src/lib/landingConfig.ts` · `src/lib/introContext.tsx` · `src/lib/particleContext.tsx` · `src/lib/splitText.ts` · `src/lib/morphTargets.ts` · `src/lib/registry.ts` · `src/lib/firstFrame.ts` · `src/data/brand.ts` · `src/hooks/useAppReady.ts` · `src/hooks/useReducedMotion.ts`

Two further orphaned files remain from earlier iterations: `src/data/navigation.ts` (Navbar/Footer/LogoStrip carry their own links inline) and `src/data/caseStudies.ts` (a compatibility alias for `src/data/clients.ts`).

**Rules for agents and contributors:**

- Treat the light Antigravity composition in `src/app/page.tsx` as the **single source of truth** for the shipped site. Do not silently swap the home page to the landing folder.
- `src/lib/landingConfig.ts` still contains the literal template placeholder `name: "[NAME]"`. **Never** surface it in UI copy, metadata, or JSON-LD.
- The five `react-hooks/exhaustive-deps` lint warnings that `npm run lint` reports all originate in `src/components/landing/*`. They are pre-existing and acceptable while the folder stays unwired; do not "fix" them as if they were live code.
- Wiring the landing experience in is a legitimate future task, but it is a **design decision with owner sign-off**, not a cleanup.

---

## 9. Known gaps (honest status)

Carried forward from the collaborator's own audits; none of these are silently hidden.

1. **Pricing is unconfirmed.** 20 `TODO(owner): confirm` markers live in `src/config/pricing.ts` — currency, locale, every starting price and typical range, all six budget bands and the launch copy. The "free 30-minute consultation" is configured but deliberately disabled (`showConsultation: false`), so no unverified offer is published.
2. **Reduced-motion hydration errors.** React 418/423 warnings were observed on initial load with reduced motion enabled. Reproduced on a clean baseline, not yet fixed.
3. **Services scroll performance.** Measured at 3.69 average FPS under software-WebGL with 4× CPU throttling. This is functional QA, not a GPU benchmark; **no 55–60 FPS claim is certified**.
4. **Pointer-release settle time.** Measured 182–569 ms depending on width, with a 360 px outlier above the strict target.
5. **No device certification.** No Lighthouse, CLS, physical iOS Safari/Android, real-GPU or heap-growth certification exists. All viewport results come from emulated Chromium.
6. **Dead client helpers.** `src/lib/apiClient.ts` still exports four `/api/labs/*` helpers (`analyzeEmotionViaApi`, `searchVectorsViaApi`, `synthesizeOutreachViaApi`, `fetchThreatTelemetryViaApi`) whose endpoints no longer exist in the back-end and which have no call sites.
7. **Footer contact address differs from the canonical one.** `src/components/Footer.tsx` links `hello@axiomstudio.ai`; every other surface uses `contact@axiomstudio.agency`. Needs an owner decision and alignment.

---

## 10. Licence

MIT. All code, copy, data and architecture in this repository are original to Axiom Studio. Client names in the portfolio are explicitly labelled **Studio Concept** builds rather than real third-party engagements.
