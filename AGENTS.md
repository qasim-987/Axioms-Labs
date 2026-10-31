# Axiom Studio — AI Coding Agent Instructions (`AGENTS.md`)

> Canonical operating rules for autonomous coding agents working in this repository. Part of the architecture suite under `/docs/` and `/Animations.md`.
>
> **Document currency (reconciled 31 October 2026, commit `e93cf7a`):** the shipped site is **12 route definitions / 23 prerendered routes** (26 pages in the Next.js build counter) with **4 service pillars** and **4 studio concept builds**. `/docs/01`–`docs/05` were written for an earlier 42-route site and are **historical design rationale only** — they describe routes (`/demos/*`, `/open-axiom`, `/resources/vendor-matrix`) that no longer exist. The authoritative motion reference is `/Animations.md`; the authoritative status reference is `/PROGRESS.md`; the authoritative file-ownership map is **§2 below**, which has been reconciled against the codebase.

- **Brand Identity**: **Axiom Studio** (`AXIOM STUDIO` / `AX` monogram / `https://axiomstudio.agency`)
- **Decoupled Service Architecture**:
  - **Front-End (`src/`)**: Next.js `14.2` (App Router on `0.0.0.0:3000`), React `18.3`, TypeScript `5.6` (`strict: true`), Tailwind CSS `3.4`, `lucide-react` — zero API route handlers in `src/app/api/*`; communicates exclusively via relative `/api/*` HTTP calls (`src/lib/apiClient.ts`) proxied to `BACKEND_INTERNAL_URL`.
  - **Back-End (`backend/`)**: Standalone Express + TypeScript + Zod REST service (`0.0.0.0:4000`) owning `GET /api/health`, `GET /api/services`, `POST /api/contact` and `GET /api/contact/status`. There is **no** `/api/vendors/*` and **no** `/api/labs/*` — those belonged to the removed demo routes and must not be reintroduced without the corresponding back-end implementation.
- **Motion Stack (per `/Animations.md`)**: `Lenis` + `GSAP ScrollTrigger` + `Framer Motion` + HTML5 `<canvas>` / CSS Volumetric Shaders
- **Visual & Motion Benchmark**: `https://antimatterai.agency` (documented in `/Animations.md` and `/docs/02-DESIGN-ARCHITECTURE.md`)

---

## 1. Non-Negotiable Invariants ("ALWAYS / NEVER" Rules)

1. **STRICT BRANDING — "Axiom Studio" ONLY**:
   - **ALWAYS** use `"Axiom Studio"` (or `"AXIOM STUDIO"` in uppercase lockups, `contact@axiomstudio.agency`, `https://axiomstudio.agency`). **KNOWN EXCEPTION pending owner confirmation:** `src/components/Footer.tsx` currently links `hello@axiomstudio.ai`; do not silently change it — flag it and let the owner decide which address is canonical.
   - **NEVER** re-introduce legacy strings `"Axiom Labs"`, `"axiomlabs"`, `"Anti Quanta"`, `"anti-quanta"`, or third-party `"Antimatter"` / `"Antimatter AI"` in any UI copy, `<title>`, OpenGraph tag, JSON response, or package manifest. (Exceptions, all verified present in the tree: the `/open-antimatter -> /work` and `/open-axiom -> /work` compatibility redirects in `next.config.mjs`, and "Antimatter-inspired" attribution inside **code comments only** in `src/components/`. The former "Synthetix Labs" client no longer exists.)
2. **SERVER-FIRST (RSC) ARCHITECTURE**:
   - **ALWAYS** keep pages and static layout wrappers as React Server Components unless interactive browser state/hooks (`useState`, `useEffect`, `IntersectionObserver`, `requestAnimationFrame`, event handlers) are strictly required.
   - **NEVER** access `window`, `document`, `navigator`, or `new Date()` time formatting directly in top-level render bodies of `"use client"` components—run them inside `useEffect` to prevent Next.js SSR hydration mismatches.
3. **COMPOSITOR-ONLY 60FPS ANIMATIONS & ACCESSIBILITY**:
   - **ALWAYS** consult `/Animations.md` before building or modifying any animation, scroll trigger, counter, marquee, or shader.
   - **ALWAYS** animate GPU-composited properties only (`transform: translate3d/scale/rotate`, `opacity`, short entrance `filter: blur()`), using the studio's primary curve `cubic-bezier(0.16, 1, 0.3, 1)`.
   - **ALWAYS** respect `@media (prefers-reduced-motion: reduce)` and `useReducedMotion()` so users with reduced motion enabled receive immediate, legible static states (`opacity: 1`, `transform: none`).
   - **NEVER** import `useReducedMotion` from `framer-motion` in a component whose **rendered markup** branches on it. That hook resolves the media query *synchronously during render*, so the server renders `false` while the client's first render produces the real value — a guaranteed React #418/#423 hydration mismatch for every reduced-motion user. **ALWAYS** import `@/hooks/useReducedMotion` instead (`useState(false)` + `useEffect`, so the first client render matches the server). Reading `window.matchMedia` inside `useEffect`/GSAP callbacks is fine and remains the pattern elsewhere.
   - **NOTE** on `initial`: framer-motion reads a component's `initial` prop only at mount, so `initial={prefersReduced ? false : …}` cannot take effect once the SSR-safe hook resolves after mount. Zero the `transition` (`duration`/`delay`) in the reduced branch instead — see `SpotlightCard.tsx`.
   - **ALWAYS** place `aria-label={fullText}` on split-character headings (`SplitTextReveal`) and vertical odometer counters (`RollingNumber`), with `aria-hidden="true"` on internal animated character/digit spans.
4. **CLOUD PREVIEW & NETWORK SAFETY**:
   - **NEVER** hardcode `http://localhost:3000` or `127.0.0.1` in client-side `fetch()` calls. Always use relative URLs (e.g., `fetch("/api/contact", ...)`).
   - When starting a dev server in cloud sandboxes, bind to `0.0.0.0` (e.g., `npx next dev -H 0.0.0.0 -p 3000`).
5. **TYPESCRIPT RIGOR**:
   - **NEVER** disable TypeScript checks with `@ts-ignore` or untyped `any` in domain models. Every data array in `src/data/*.ts` must conform strictly to its exported interface.

---

## 2. Codebase Map & File Ownership Lookup

> Reconciled against the codebase on 31 October 2026. Every path below was verified to exist. The historical `docs/01`–`docs/05` suite is listed separately at the end because it still explains *why* the system looks the way it does, but it no longer describes the shipped routes.

### 2.1 Live code — read and edit these

| Task / Domain | Authoritative File(s) to Read & Edit |
| :--- | :--- |
| **Motion blueprint & parity matrix** | `Animations.md` (authoritative for every animation, scroll trigger, counter, marquee and shader) |
| **Implementation status & roadmap** | `PROGRESS.md` |
| **Global SEO, Metadata, Root Shell** | `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts` |
| **Home page composition** | `src/app/page.tsx` |
| **Sticky Header, Mega-Menu, Mobile Drawer** | `src/components/Navbar.tsx` (its links are inline — `src/data/navigation.ts` is orphaned, see §3) |
| **Hero Stage, Particle Sphere, Light Rays & Beam** | `src/components/Hero.tsx`, `src/components/ParticleSphereHero.tsx`, `src/components/TouchHeroSphere.tsx`, `src/components/LightRays.tsx`, `src/components/LightBeam.tsx` |
| **Shared particle engine & device tiering** | `src/lib/particleEngine.ts`, `src/lib/performanceTier.ts`, `src/lib/serviceParticleShapes.ts` |
| **Odometer counters (`0123456789` strip)** | `src/components/RollingNumber.tsx`, `src/components/StatsSection.tsx` |
| **Technology marquee & tool icons** | `src/components/LogoStrip.tsx`, `src/components/ServiceToolIcons.tsx`, `src/components/ToolChipContent.tsx` |
| **Services deck (desktop pinned + ink-wipe)** | `src/components/ServicesGrid.tsx` |
| **Services carousel (native swipe, <1024px)** | `src/components/MobileServices.tsx`, `src/components/ServicesParticleCanvas.tsx` |
| **Service pillar pages (4) + launch pricing** | `src/app/services/[slug]/page.tsx`, `src/components/ServiceDetailClient.tsx`, `src/components/LaunchPricing.tsx`, `src/data/services.ts`, `src/config/pricing.ts` |
| **Portfolio index & 4 concept build dossiers** | `src/app/work/page.tsx`, `src/components/WorkPageContent.tsx`, `src/app/work/[slug]/page.tsx`, `src/components/CaseStudyDetailClient.tsx`, `src/components/CaseStudyScrollShowcase.tsx`, `src/data/clients.ts` |
| **Home concept-build showcase (desktop-only gate)** | `src/components/ConceptBuildsGate.tsx`, `src/components/CaseStudies.tsx` |
| **Company page, studio hubs & core beliefs** | `src/app/company/page.tsx`, `src/components/CompanyPageContent.tsx` |
| **Delivery methodology section** | `src/components/MethodologySection.tsx` |
| **Engineering blog index & 4 articles** | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/data/blog.ts` |
| **Contact page & scoping form** | `src/app/contact/page.tsx`, `src/components/ContactSection.tsx` |
| **Footer & live studio clock** | `src/components/Footer.tsx` |
| **Smooth scroll, scroll progress, motion tokens** | `src/components/SmoothScrollProvider.tsx`, `src/components/ScrollProgressBar.tsx`, `src/lib/motionTokens.ts`, `src/components/SplitTextReveal.tsx`, `src/components/SpotlightCard.tsx` |
| **Typed front-end ↔ back-end client** | `src/lib/apiClient.ts` |
| **Redirects, `/api` rewrites, security headers** | `next.config.mjs` |
| **Back-end app wiring & middleware** | `backend/src/app.ts`, `backend/src/index.ts`, `backend/src/config/env.ts`, `backend/src/middleware/{securityHeaders,requestLogger,rateLimiter}.ts` |
| **Anti-spam, rate limiting & inquiry delivery** | `backend/src/routes/contact.routes.ts`, `backend/src/schemas/contact.schema.ts`, `backend/src/services/{antiSpam,delivery}.service.ts` |
| **Back-end service catalogue** | `backend/src/routes/catalog.routes.ts`, `backend/src/services/catalog.service.ts` |
| **Back-end health** | `backend/src/routes/health.routes.ts` |
| **CI pipeline** | `.github/workflows/ci.yml` |
| **Optional offline QA harnesses** | `scripts/check-*.cjs` (require Playwright/pngjs installed **outside** the repo — never add them to `package.json`) |

### 2.2 Historical documents — rationale only, not a route map

| Document | Note |
| :--- | :--- |
| `docs/01-PRODUCTION-REQUIREMENTS-DOCUMENT.md` | Written for the earlier 42-route site (7 clients, 6 services, demo labs) |
| `docs/02-DESIGN-ARCHITECTURE.md` | Palette, glass and volumetric principles still current |
| `docs/03-TECHNICAL-ARCHITECTURE.md` | Describes removed `/api/vendors/*` and `/api/labs/*` endpoints |
| `docs/04-AGENT-INSTRUCTIONS.md` | Superseded by this file |
| `docs/05-TECHNICAL-WORKFLOW.md` | Local dev and CI guidance still largely usable |
| `docs/TEST_CHECKLIST.md`, `docs/TIMING_TABLE.md` | Route lists are outdated |
| `MASTER_PROMPT.md` | The prompt that produced `docs/01`–`docs/05` |

---

## 3. Retained but Unwired Code (`src/components/landing/`)

`src/components/landing/` (17 files) plus its supporting modules are **not reachable from any route**. They form a complete dark-theme landing experience (hero intro timeline, WebGL particle morph, pinned services, card→service transition, its own contact form) that was merged in PR #6 and then deliberately left unwired when the owner preserved the light Antigravity overhaul (commit `4ed1706f`, "preserve light overhaul per owner choice").

Unwired supporting modules: `src/lib/landingConfig.ts`, `src/lib/introContext.tsx`, `src/lib/particleContext.tsx`, `src/lib/splitText.ts`, `src/lib/morphTargets.ts`, `src/lib/registry.ts`, `src/lib/firstFrame.ts`, `src/data/brand.ts`, `src/hooks/useAppReady.ts`, `src/hooks/useReducedMotion.ts`.
Earlier-iteration orphans: `src/data/navigation.ts` (Navbar/Footer/LogoStrip carry their links inline) and `src/data/caseStudies.ts` (alias for `src/data/clients.ts`).

- **ALWAYS** treat the light Antigravity composition in `src/app/page.tsx` as the shipped home page.
- **NEVER** surface `src/lib/landingConfig.ts`'s literal template placeholder `name: "[NAME]"` in UI copy, metadata or JSON-LD.
- **NEVER** "fix" the five `react-hooks/exhaustive-deps` lint warnings as if they were live code — they all originate in the unwired folder and are expected while it stays unwired.
- **NEVER** wire the landing folder in without explicit owner sign-off; it is a design decision, not a cleanup task.
- **NEVER** delete the folder without owner sign-off either — it is the reference implementation of the morph/transition choreography.

---

## 4. Mandatory Pre-Completion Verification (Definition of Done)

Every agent task modifying code **MUST** execute and pass all four checks before reporting completion:

```bash
# 1. Verify zero legacy brand strings remain
! grep -rn -i "axiom labs\|axiomlabs\|anti-quanta" src/ backend/src/ README.md PROGRESS.md package.json

# 2. Type-check the entire TypeScript project (front-end AND back-end)
npm run typecheck

# 3. Lint Next.js App Router rules
npm run lint

# 4. Compile the full production build (must emit the complete route table)
npm run build
```

A change that touches `backend/` **must** additionally pass:

```bash
npm run build:backend
```

Reference route table produced by a healthy `npm run build` — **12** route definitions, **23** prerendered routes, **26** pages in the build counter:

```
/  /_not-found  /blog  /blog/[slug] ×4  /case-study/[slug] ×4  /company
/contact  /robots.txt  /services/[slug] ×4  /sitemap.xml  /work  /work/[slug] ×4
```

The five `react-hooks/exhaustive-deps` warnings in `src/components/landing/*` are **pre-existing and accepted** (§3). Any *new* warning is a regression and must be fixed.

---

## 5. Reporting Rules

- **ALWAYS** state which files were changed and why, and paste the actual verification output.
- **ALWAYS** record the real limitations of a change. Where a behaviour was not measured (FPS on real hardware, Lighthouse, physical Safari, CLS, heap growth), say so explicitly rather than implying it was verified.
- **ALWAYS** follow the collaborator's documentation pattern for non-trivial work: a short report under `docs/` capturing root causes, the exact constants changed, what was verified, and what was left open.
- **NEVER** describe removed routes, renamed clients, or superseded components as if they were live. If you are unsure whether a file is live, check `PROGRESS.md` §3–§4 or walk the import graph from `src/app/`.
