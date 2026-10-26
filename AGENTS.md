# Axiom Studio — AI Coding Agent Instructions (`AGENTS.md`)

> Canonical operating rules for autonomous coding agents working in this repository. Part of the complete architecture suite under `/docs/` (`01-PRODUCTION-REQUIREMENTS-DOCUMENT.md` through `05-TECHNICAL-WORKFLOW.md`) and `/Animations.md`.

- **Brand Identity**: **Axiom Studio** (`AXIOM STUDIO` / `AX` monogram / `https://axiomstudio.agency`)
- **Decoupled Service Architecture**:
  - **Front-End (`src/`)**: Next.js `14.2` (App Router on `0.0.0.0:3000`), React `18.3`, TypeScript `5.6` (`strict: true`), Tailwind CSS `3.4`, `lucide-react` — zero API route handlers in `src/app/api/*`; communicates exclusively via relative `/api/*` HTTP calls (`src/lib/apiClient.ts`) proxied to `BACKEND_INTERNAL_URL`.
  - **Back-End (`backend/`)**: Standalone Express + TypeScript + Zod REST service (`0.0.0.0:4000`) owning `/api/health`, `/api/contact`, `/api/vendors/*`, and `/api/labs/*`.
- **Motion Stack (per `/Animations.md`)**: `Lenis` + `GSAP ScrollTrigger` + `Framer Motion` + HTML5 `<canvas>` / CSS Volumetric Shaders
- **Visual & Motion Benchmark**: `https://antimatterai.agency` (documented in `/Animations.md` and `/docs/02-DESIGN-ARCHITECTURE.md`)

---

## 1. Non-Negotiable Invariants ("ALWAYS / NEVER" Rules)

1. **STRICT BRANDING — "Axiom Studio" ONLY**:
   - **ALWAYS** use `"Axiom Studio"` (or `"AXIOM STUDIO"` in uppercase lockups, `contact@axiomstudio.agency`, `https://axiomstudio.agency`).
   - **NEVER** re-introduce legacy strings `"Axiom Labs"`, `"axiomlabs"`, `"Anti Quanta"`, `"anti-quanta"`, or third-party `"Antimatter"` / `"Antimatter AI"` in any UI copy, `<title>`, OpenGraph tag, JSON response, or package manifest. (Exception: dummy client name `"Synthetix Labs"` in `src/data/clients.ts` and the backward-compatible `/open-antimatter -> /open-axiom` redirect shim).
2. **SERVER-FIRST (RSC) ARCHITECTURE**:
   - **ALWAYS** keep pages and static layout wrappers as React Server Components unless interactive browser state/hooks (`useState`, `useEffect`, `IntersectionObserver`, `requestAnimationFrame`, event handlers) are strictly required.
   - **NEVER** access `window`, `document`, `navigator`, or `new Date()` time formatting directly in top-level render bodies of `"use client"` components—run them inside `useEffect` to prevent Next.js SSR hydration mismatches.
3. **COMPOSITOR-ONLY 60FPS ANIMATIONS & ACCESSIBILITY**:
   - **ALWAYS** consult `/Animations.md` before building or modifying any animation, scroll trigger, counter, marquee, or shader.
   - **ALWAYS** animate GPU-composited properties only (`transform: translate3d/scale/rotate`, `opacity`, short entrance `filter: blur()`), using the studio's primary curve `cubic-bezier(0.16, 1, 0.3, 1)`.
   - **ALWAYS** respect `@media (prefers-reduced-motion: reduce)` and `useReducedMotion()` so users with reduced motion enabled receive immediate, legible static states (`opacity: 1`, `transform: none`).
   - **ALWAYS** place `aria-label={fullText}` on split-character headings (`SplitTextReveal`) and vertical odometer counters (`RollingNumber`), with `aria-hidden="true"` on internal animated character/digit spans.
4. **CLOUD PREVIEW & NETWORK SAFETY**:
   - **NEVER** hardcode `http://localhost:3000` or `127.0.0.1` in client-side `fetch()` calls. Always use relative URLs (e.g., `fetch("/api/contact", ...)`).
   - When starting a dev server in cloud sandboxes, bind to `0.0.0.0` (e.g., `npx next dev -H 0.0.0.0 -p 3000`).
5. **TYPESCRIPT RIGOR**:
   - **NEVER** disable TypeScript checks with `@ts-ignore` or untyped `any` in domain models. Every data array in `src/data/*.ts` must conform strictly to its exported interface.

---

## 2. Codebase Map & File Ownership Lookup

| Task / Domain | Authoritative File(s) to Read & Edit |
| :--- | :--- |
| **Production Requirements (PRD)** | `docs/01-PRODUCTION-REQUIREMENTS-DOCUMENT.md` |
| **Design System & Tokens Spec** | `docs/02-DESIGN-ARCHITECTURE.md`, `tailwind.config.ts`, `src/app/globals.css` |
| **System & API Architecture** | `docs/03-TECHNICAL-ARCHITECTURE.md` |
| **Engineering Playbooks & CI/CD** | `docs/05-TECHNICAL-WORKFLOW.md` |
| **Exact `antimatterai.agency` Motion Specs** | `Animations.md` |
| **Global SEO, Metadata, Root Shell** | `src/app/layout.tsx` |
| **Sticky Header, Mega-Menu, Mobile Drawer** | `src/components/Navbar.tsx`, `src/data/navigation.ts` |
| **Hero Stage & Volumetric Light Rays** | `src/components/Hero.tsx`, `src/components/LightRays.tsx` |
| **Odometer Counters (`0123456789` Strip)** | `src/components/RollingNumber.tsx`, `src/components/StatsSection.tsx` |
| **Partner Marquee & Horizon Light Curve** | `src/components/LogoStrip.tsx`, `src/data/navigation.ts` |
| **6 Service Pillars (Home Grid + Detail Routes)** | `src/components/ServicesGrid.tsx`, `src/app/services/[slug]/page.tsx`, `src/data/services.ts` |
| **7 Client Case Studies (Home + `/work` + Dossiers)** | `src/components/CaseStudies.tsx`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/data/clients.ts` |
| **Company Story, Showcase Reel, Core Beliefs** | `src/app/company/page.tsx` |
| **Engineering Blog Index & Articles** | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/data/blog.ts` |
| **Open-Source Hub (`/open-axiom`)** | `src/app/open-axiom/page.tsx`, `src/data/openSource.ts` |
| **Enterprise AI Vendor Matrix & CSV Export** | `src/app/resources/vendor-matrix/page.tsx`, `src/data/vendorMatrix.ts` |
| **6 Interactive Capability Labs** | `src/app/demos/{threat-monitor,intent-iq,infrastructure-atlas,voice-sentiment,vector-search,emotion-ai}/page.tsx` |
| **Contact Page, Scoping Form & Anti-Spam API** | `src/app/contact/page.tsx`, `src/components/ContactSection.tsx`, `src/app/api/contact/route.ts` |
| **Footer & Live 1Hz Studio Clock** | `src/components/Footer.tsx`, `src/data/navigation.ts` |

---

## 3. Mandatory Pre-Completion Verification (Definition of Done)

Every agent task modifying code **MUST** execute and pass all four checks before reporting completion:

```bash
# 1. Verify zero legacy brand strings remain
! grep -rn -i "axiom labs\|axiomlabs\|anti-quanta" src/ README.md PROGRESS.md package.json

# 2. Type-check entire TypeScript project
npx tsc --noEmit

# 3. Lint Next.js App Router rules
npm run lint

# 4. Compile full production build (verifies all 42+ SSG & Dynamic routes)
npm run build
```
