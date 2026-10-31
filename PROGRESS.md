# Axiom Studio — Implementation Status

> **Reconciled 31 October 2026** against branch `arena/c1f221f4-axioms-labs` (commit `e93cf7a`, identical to `origin/main`).
> This file was rewritten to describe the site that actually exists. The previous version documented a 42-route site with seven fictional clients, six services, an open-source hub, a vendor matrix and six interactive demo labs — **none of those routes or assets exist in the current codebase**. That history is preserved in §3.

---

## 1. Current snapshot

| | |
| :--- | :--- |
| **Brand** | Axiom Studio · `https://axiomstudio.agency` |
| **Studios** | Kuopio, Finland · Lahore, Pakistan |
| **Core disciplines** | 4 — Web Development · Web Designing · UI/UX Design · AI Agents |
| **Portfolio** | 4 *Studio Concept* builds (explicitly not real third-party clients) |
| **Editorial** | 4 technical articles |
| **Routes generated** | **12** route definitions → **23** prerendered routes → **26** pages in the Next.js build counter |
| **Front-end** | Next.js 14.2 App Router · React 18.3 · TypeScript 5.6 strict · Tailwind 3.4 — `0.0.0.0:3000` |
| **Back-end** | Express 4 + Zod — `0.0.0.0:4000` |
| **API ownership** | Back-end only; the front-end has **zero** route handlers |
| **Shared first-load JS** | 87.4 kB |
| **Type-check / lint / build** | Pass · Pass (5 pre-existing warnings, all in retained unwired code) · Pass (26 routes) |

---

## 2. Implemented surface

### 2.1 Routes (12 route definitions → 23 prerendered routes → 26 pages in the build counter)

| Route | Type | Content |
| :--- | :--- | :--- |
| `/` | Static | Hero → LogoStrip → Stats → ConceptBuilds → Services deck → Methodology → Contact → Footer |
| `/work` | Static | Concept build index with discipline filter |
| `/work/[slug]` | SSG ×4 | Nexus · Aura · FinFlow · Atlas dossiers |
| `/case-study/[slug]` | SSG ×4 | Compatibility route — `redirect()` → **307** to `/work/[slug]` |
| `/company` | Static | Mission statement, two studio hubs (Kuopio & Lahore), four core beliefs, closing CTA |
| `/contact` | Static | Scoping form, two studio hubs, FAQ |
| `/blog` | Static | Article index with category filter |
| `/blog/[slug]` | SSG ×4 | Article readers |
| `/services/[slug]` | SSG ×4 | `web-development` · `web-designing` · `ui-ux-design` · `ai-agents` |
| `/sitemap.xml` · `/robots.txt` · `/_not-found` | Static | SEO + 404 |

### 2.2 Back-end API

| Method | Path | State |
| :--- | :--- | :--- |
| `GET` | `/` | Live — service status card |
| `GET` | `/api/health` | Live — uptime + adapter metrics |
| `GET` | `/api/services` | Live — catalogue + studio locations |
| `POST` | `/api/contact` | Live — rate limit → anti-spam → Zod → persist/deliver |
| `GET` | `/api/contact/status` | Live — operational flag + session metrics |

Probed live during reconciliation: `GET /api/health` → `{"status":"operational",...}` and `GET /api/services` → 4 services + 2 studio locations, both through the Next.js rewrite.

**Anti-spam:** primary honeypot (`botField`), secondary honeypot (`websiteUrl`), velocity gate below 1000 ms. Trapped requests receive a silent `200`.

**Rate limit:** 10 `POST /api/contact` per 10 minutes per IP, sliding window, `X-RateLimit-*` and `Retry-After` headers.

**Delivery:** local JSONL audit ledger always on; Resend, webhook and Supabase adapters activate only when their environment variables are present.

### 2.3 Motion & interaction systems (live)

- Lenis smooth scroll wired to GSAP `ScrollTrigger` (`scrollerProxy` sync), native touch scrolling, refresh on fonts/decode/route.
- Character-split kinetic typography, `0123456789` slot-machine odometer counters, horizon light-curve marquee, glassmorphic scroll-morph navbar with mega-menu and accessible mobile drawer.
- Shared Three.js particle engine (`src/lib/particleEngine.ts`) driving both the Hero sphere and the Services morph, with a device performance tier + adaptive FPS governor (`src/lib/performanceTier.ts`: high 7200 / medium 3600 / low 2160 particles).
- Services: scroll-scrubbed pinned opaque card deck on desktop, native swipe carousel below 1024 px, static reduced-motion fallback, ink-wipe card transitions.
- `prefers-reduced-motion` honoured across every animation surface.
- `ScrollTrigger.refresh()` after route changes and after the concept-build gate mounts.

---

## 3. Delivery history (11 merged PRs)

| PR | Scope | Outcome |
| :--- | :--- | :--- |
| #1 | Rebrand to Axiom Studio, decouple front-end/back-end | Foundation — established the two-service architecture |
| #2 | Hero 3D background centring, View Work cursor showcase | Superseded |
| #3 | Case-study showcase moved above Services; cursor clipping | Superseded |
| #4 | Black & White + **Antigravity palette**, 4 core services, site-wide motion choreography | **Live theme** |
| #5 | Services particle entry, opaque card deck, responsive ticker | Live |
| #6 | Dark landing page (hero intro, particle morph, card→service transition, contact API) | **Merged, then retained unwired** — see §4 |
| #7 | Guard against WebGL setup failure crashing the landing page | Live |
| #8 | Mobile/tablet overhaul, centralised launch pricing | Live — largest change set |
| #9 | Remove interactive concept index and synchronised preview | Live |
| #10 | Opaque ink-wipe card transitions + purple reference styling | Live |
| #11 | Remove the coloured-dot services badge above the Hero headline | Live (HEAD) |

**The pivotal decision (PR #8, commit `4ed1706f`, "preserve light overhaul per owner choice").** The dark landing experience from PR #6 was merged, but when the mobile/tablet overhaul landed the owner chose to keep the **light Antigravity** composition as the shipped home page. The dark implementation was left in the tree as reference material rather than deleted. Nothing in `src/app/` imports `src/components/landing/`, which is why 29 source files are currently unreachable from the route tree.

---

## 4. Retained but unwired code

Unreachable from `src/app/` (verified by an import-graph walk from every route entry point):

| Group | Files |
| :--- | :--- |
| Dark landing experience | `src/components/landing/` — 17 files (`Landing`, `BrandShell`, `BrandNavbar`, `IntroController`, `ParticleSphere`, `SplitHeadline`, `ServicesSection`, `ServiceCard`, `TransitionProvider`, `TransitionLink`, `ContactForm`, `ServicePageClient`, `ServicePageGlare`, `CountStat`, `StatsRow`, `LightBeam`, `Watermark`) |
| Supporting libraries | `src/lib/landingConfig.ts`, `src/lib/introContext.tsx`, `src/lib/particleContext.tsx`, `src/lib/splitText.ts`, `src/lib/morphTargets.ts`, `src/lib/registry.ts`, `src/lib/firstFrame.ts` |
| Data & hooks | `src/data/brand.ts`, `src/hooks/useAppReady.ts`, `src/hooks/useReducedMotion.ts` |
| Earlier iterations | `src/data/navigation.ts` (Navbar/Footer/LogoStrip link inline), `src/data/caseStudies.ts` (alias for `src/data/clients.ts`) |

Consequences to keep in mind:

- `src/lib/landingConfig.ts` still contains the literal template placeholder `name: "[NAME]"`.
- All five `react-hooks/exhaustive-deps` warnings from `npm run lint` originate here.
- The front-end `zod` dependency is imported only by `src/components/landing/ContactForm.tsx`; live form validation happens in the back-end.

Wiring this folder in is a design decision requiring owner sign-off, not a maintenance chore. See `README.md` §8.

---

## 5. Verification status

Commands run during this reconciliation, from the repository root:

| Gate | Command | Result |
| :--- | :--- | :--- |
| Type-check (front-end + back-end) | `npm run typecheck` | **Pass**, 0 errors |
| Lint | `npm run lint` | **Pass** — 5 pre-existing warnings, all in `src/components/landing/*` |
| Production build | `npm run build` | **Pass** — 26 pages in the build counter (23 prerendered routes across 12 route definitions), 87.4 kB shared JS |
| Back-end compile | `npm run build:backend` | Pass (`tsc -p backend/tsconfig.json`) |
| Route health | `curl` on `/`, `/work`, `/services/web-development` | HTTP 200 |
| API proxy | `curl /api/health`, `/api/services` | Operational, correct payloads |

Route-by-route status, all verified HTTP 200 in the current build:

| Route | Status |
| :--- | :--- |
| `/` | ✅ 200 |
| `/work` · `/work/[slug]` ×4 | ✅ 200 |
| `/case-study/[slug]` ×4 | ✅ 200 (redirect to `/work/[slug]`) |
| `/company` · `/contact` | ✅ 200 |
| `/blog` · `/blog/[slug]` ×4 | ✅ 200 |
| `/services/[slug]` ×4 | ✅ 200 |
| `/sitemap.xml` · `/robots.txt` | ✅ 200 |
| `/api/health` · `/api/services` · `/api/contact/status` | ✅ 200 |
| `POST /api/contact` | ✅ Live — rate limit, anti-spam and Zod validation confirmed in code |

### 5.1 Reduced-motion hydration fix — reproduction and verification

Browser evidence captured with Playwright 1.64.1 driving a bundled Chromium 153 against the production build (`npm run build && npm start`), at 1440×900 and 390×844, with `reducedMotion` set per context.

**Root cause.** `framer-motion`'s `useReducedMotion()` calls `initPrefersReducedMotion()`, which reads `window.matchMedia("(prefers-reduced-motion)")` *synchronously during render* (`motion-dom/dist/…/reduced-motion`). On the server that yields `false`; on the client's first render it yields the real value. Four components branch their **markup** on it, so with Reduce Motion enabled the server HTML and the client's first render disagreed → React #418, then #423 when the root fell back to a full client re-render.

Fixed by importing the existing SSR-safe `@/hooks/useReducedMotion` (`useState(false)` + `useEffect`) in `Hero.tsx`, `ScrollProgressBar.tsx`, `SplitTextReveal.tsx` and `SpotlightCard.tsx`. `SplitTextReveal`'s `if (prefersReduced) return <Tag>{text}</Tag>` branch is what made this a *structural* mismatch (plain text vs. a per-character `span` tree).

| Check | Before | After |
| :--- | :--- | :--- |
| Hydration signals, 23 routes × 2 modes (46 loads) | **23 failures** — every route under `reduce` threw #418/#423; `no-preference` clean | **0 failures** — clean in both modes |
| Server-rendered HTML, 11 routes | — | **byte-identical** to pre-fix (script/RSC-payload chunks normalised) |
| Behavioural assertions (branch selection, a11y names, layout, mobile overflow) | — | **38 / 38 pass** |
| Content invisible after a full scroll, `reduce` | 0 | **0**, stable across 5 repeat runs |
| `SpotlightCard` reveal, `reduce` | instant (via the crash-driven client re-render) | **41 ms — instant**, no framer reveal animation |
| `SpotlightCard` reveal, `no-preference` | 650 ms | **650 ms — unchanged** (two WAAPI animations at 650 ms) |

`SpotlightCard` needed one extra line: `initial` is read only at mount, so the `initial={prefersReduced ? false : …}` shortcut can no longer apply on the first render. `transition.duration`/`delay` are now zeroed when `prefersReduced` is true, preserving the instant reveal `Animations.md` §12.3 requires without touching the normal 0.65 s animation.

Two caveats recorded honestly:
- The `no-preference` "elements still invisible after a synthetic scroll" count is **not** a stable metric — five repeat runs on one unchanged build returned `[75, 5, 41, 31, 41]`, because GSAP ScrollTrigger scrub timelines are sampled mid-animation. Under `reduce` the same measurement was `[0, 0, 0, 0, 0]`.
- `MethodologySection`'s PHASE cards and `/work`'s hand-rolled `WORK` heading never consult `prefers-reduced-motion` at all (§6.2 item 9). Pre-existing, unrelated to hydration, and left untouched.

---

## 6. Open items

### 6.1 Requires an owner decision
1. **Launch pricing.** 20 `TODO(owner): confirm` markers in `src/config/pricing.ts`: currency, locale, each service's starting price and typical range, the custom-app starting price, all six budget-band labels, and the launch copy. The values currently published are explicit placeholders, not market research. The free 30-minute consultation is configured but disabled (`showConsultation: false`).
2. **Budget band defaults.** `DEFAULT_BUDGET` resolves to "Not sure yet, let's talk" and is shared by `ContactSection`, `/contact` and `ServiceDetailClient`.
3. **Dark landing scope.** Decide whether `src/components/landing/` is promoted to the live home page or formally retired.

### 6.2 Engineering work available
4. ~~**Reduced-motion hydration errors** (React 418/423 on initial load).~~ **DONE.** Fixed by switching the four branching components from `framer-motion`'s render-time `useReducedMotion()` to the SSR-safe `@/hooks/useReducedMotion`. Evidence in §5.1.
5. **Dead `/api/labs/*` helpers** in `src/lib/apiClient.ts` — four exported functions with no back-end endpoint and no call sites.
6. **Orphaned modules** — `src/data/navigation.ts`, `src/data/caseStudies.ts` and the landing folder can be deleted if the owner chooses to retire them (documentation in `README.md` §8 would need one line of adjustment).
7. **CI brand-hygiene grep** references a `public/` directory that does not exist in this repository; the check still passes, but the path is noise.
8. **Footer contact address is inconsistent with the rest of the site.** `src/components/Footer.tsx` links `hello@axiomstudio.ai`, while the canonical address everywhere else — metadata, JSON-LD, contact page, back-end notification default — is `contact@axiomstudio.agency`. Confirm which address is correct and align the footer.
9. **Two components never consult `prefers-reduced-motion`** (pre-existing; found while verifying the hydration fix, and *not* hydration bugs — they render identically on server and client):
   - `src/components/MethodologySection.tsx` — the four PHASE cards use `initial={{opacity:0,y:28,filter:"blur(6px)"}}` + `whileInView` with a hard-coded `duration: 0.68`, so they fade and slide in even for reduced-motion users.
   - `src/components/WorkPageContent.tsx` — the hand-rolled `<h1 aria-label="WORK">` splits `"WORK"` into `motion.span` characters driven by `initial`/`animate` and gated only on `useBlurFilter`, never on reduced motion.
   `Animations.md` §12.3 asks for "instant, zero-motion states with 100% content visibility". Content *is* fully visible in both cases; only the motion is not suppressed. Fixing either changes animation behaviour, so both were left alone under the "smallest possible fix" constraint.

### 6.3 Verification still owed
8. Real-device iOS Safari and Android QA.
9. Real-GPU frame-rate certification for the Services deck (software-WebGL emulation measured 3.69 average FPS under 4× CPU throttling).
10. Lighthouse, CLS and long-task measurement.
11. Heap-growth and long-session route-soak testing.

---

## 7. Architecture suite status

| Document | State |
| :--- | :--- |
| `AGENTS.md` | **Reconciled** — file-ownership map now matches the codebase |
| `README.md` | **Reconciled** — describes the 26-route site and the decoupled back-end |
| `PROGRESS.md` | **Reconciled** (this file) |
| `Animations.md` | Current — motion blueprint, parity matrix, plus §14 responsive motion and §15 services deck (29 Oct 2026) |
| `docs/responsive-audit.md` | Current — measured Chromium evidence with explicit limitations |
| `docs/mobile-tablet-overhaul.md` | Current — gesture/swipe specification and the pricing audit |
| `docs/services-polish.md` | Current — deck geometry, morph constants, ticker behaviour |
| `docs/card-transition-fix.md` | Current — ink-wipe choreography and frame analysis |
| `docs/FILE_TREE.md` | Historical — describes the retained unwired landing scope |
| `docs/01`–`docs/05`, `docs/TEST_CHECKLIST.md`, `docs/TIMING_TABLE.md` | Historical — written for the earlier 42-route site; retained as design rationale only |
| `MASTER_PROMPT.md` | Historical — the prompt that produced the `docs/01`–`docs/05` suite |

---

## 8. Suggested next steps

Ordered by risk-to-benefit, assuming owner decisions from §6.1 land first:

1. **Documentation truth** — completed in this pass (README, PROGRESS, AGENTS reconciled).
2. **Pricing confirmation** — resolve the 20 `TODO(owner)` markers; values propagate automatically to every form, service page, `<title>`, description and JSON-LD.
3. ~~**Reduced-motion hydration fix**~~ — **completed** (evidence in §5.1). Follow-on: the two reduced-motion *compliance* gaps found while verifying it, listed in §6.2 item 9.
4. **Dead-code sweep** — remove the four `/api/labs/*` client helpers and the two orphaned data modules; keep the landing folder until the owner decides.
5. **Landing decision** — promote or retire, with a documented migration plan if promoted.
6. **Device and performance certification** — the outstanding evidence gaps in §6.3.

---

*All implementation work in this repository follows the rules in `AGENTS.md`. Read it — and `Animations.md` for anything motion-related — before changing code.*
