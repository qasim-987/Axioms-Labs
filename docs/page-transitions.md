# Page transitions — implementation and QA

## Scope / status

Implemented locally on `arena/1b6026bf-axioms-labs`. No commit, push, or deployment performed. Existing light page designs and below-fold motion are retained; the dark curtain is transition-only. Unrelated readiness and mobile-card edits already in this working tree are not part of this report.

**Functional checks passed, but full performance acceptance remains incomplete.** In particular, capture cadence, target first-text timing, and sustained 60fps have not been established. One later edge run failed before observing text masks (details below).

## Framework and strategy

Next.js App Router / React 18 with existing GSAP, SplitText, ScrollTrigger, Framer Motion, and Lenis. No new application dependency. Persistent root provider owns `idle → covering → waiting → revealing → idle`; delegated anchor interception preserves ordinary anchors/no-JS navigation. Navbar lives outside the swapped route content and above the curtain. Covering ignores repeat requests; waiting retains the latest destination.

Opaque bottom-up curtain with blue leading band, small settle, upward exit/trailing band. Old content dims; optional −40px drift is limited to fine-pointer desktop **high performance tier**. Mobile timings are 15% faster. Fonts/above-fold image readiness is bounded; a watchdog unlocks the page and preserves the requested navigation. History navigation uses a short snap-cover. Native hash/modified/external/download/new-tab exceptions remain supported, with hover/focus/touch prefetch.

Header-only presentation clones provide masked text lines without rewriting React-owned text. Flex/icon labels use fade-up to preserve layout; label precedes headline and paragraph. CTA/first media fade up. Resize safely completes/cleans masks rather than re-splitting mid-transition. Existing below-fold particle/card choreography remains owned by its original components.

Content is inert while covered; wheel/touch/scroll keys are blocked, Lenis pauses/resets, and destination heading/main receives focus with a live announcement. Overlay is presentation-only. Reduced-motion follows the short fade/instant path. Old ScrollTriggers are cleaned without indiscriminately killing new effects; refresh is deferred. Particle renderer disposal explicitly releases its WebGL context.

## Configuration

`src/config/pageTransition.config.ts` is the tuning surface. Durations are seconds unless suffixed `MS`.

| Setting | Value |
| --- | --- |
| COLOR_CURTAIN | `var(--palette-grey-1200)` = `#121317` |
| COLOR_BAND | `var(--ag-blue)` = `#3186FF` |
| COLOR_PROGRESS | `var(--ag-periwinkle)` = `#749BFF` |
| COLOR_TEXT | `var(--theme-on-primary)` = `#FFFFFF` |
| BAND_HEIGHT_VH / MOBILE_BAND_HEIGHT_VH | 8 / 4.5 |
| DURATION_COVER / DURATION_REVEAL / MIN_HOLD | .65 / .7 / .15 |
| EASE_COVER / EASE_TEXT | `power3.inOut` / `expo.out` |
| TEXT_DURATION / LINE_STAGGER | .65 / .09 |
| MOBILE_DURATION_FACTOR | .85 |
| READY_TIMEOUT_MS / PROGRESS_DELAY_MS / SAFETY_TIMEOUT_MS | 800 / 600 / 4000 |
| NAV_ABOVE_CURTAIN | true |
| PLAY_ON_FIRST_LOAD / SHOW_PAGE_LABEL | false / false |

Uses existing Plus Jakarta Sans and brand tokens, not a new page palette.

## Added / changed files

- `src/components/transitions/PageTransitionProvider.tsx`: state machine, navigation delegation/queue, readiness, history, cleanup, accessibility, watchdog, performance-tier guard.
- `context.ts`, `TransitionLink.tsx`, `Reveal.tsx`, `TransitionErrorBoundary.tsx`: reusable context/link/reveal APIs and failure cleanup.
- `revealPage.ts`: isolated header presentation masks and fade-up orchestration, including safe resize cleanup.
- `src/config/pageTransition.config.ts`: centralized tokens and timings.
- `src/app/layout.tsx`: persistent provider/navbar ownership.
- `src/components/Navbar.tsx`: pending active destination, animated shared active pill, mobile drawer cooperation.
- `src/app/globals.css`: curtain/band/progress/masks, stable scrollbar gutter and navbar layering.
- `src/components/SmoothScrollProvider.tsx`: Lenis transition pause/resume/reset bridge.
- `src/lib/particleEngine.ts`: release disposed WebGL contexts.
- Route pages and header components (`Hero`, `CompanyPageContent`, `WorkPageContent`, `ServiceDetailClient`, `CaseStudyDetailClient`, blog/contact/work/service/case-study route files): remove duplicate navbar ownership and mark header/first-media reveal targets. No redesign intended.
- `scripts/check-page-transitions.cjs`, `check-page-transition-edges.cjs`, `check-page-transition-stress.cjs`, `capture-page-transition.cjs`: reproducible browser checks/capture. Browser tooling is outside application dependencies.

## Validation and limitations

- Final code, including the high-tier drift guard: **typecheck, lint, production build, git diff --check passed**.
- Latest full browser smoke before the final tier-only guard: **9 destinations**, back **and forward**, persistent navbar/focus/mask cleanup, mobile **390×844** normal and reduced-motion, **no page errors**. 30 screenshots. Reported first reveal: **2019.6ms**, above the requested target. Guard was subsequently build/typechecked, not browser re-tested.
- Earlier successful edge run: covering curtain traversed y900→0, 21 mask samples, skip exceptions respected, latest waiting queue worked, delayed progress appeared, watchdog released inert lock. First visible text was **2026.1ms** under concurrent software-rendered browser load.
- **Later edge refresh failed** `maskedLineSamples > 0`: first timer sample was delayed to approximately **3852ms**, and the 4s watchdog released before sampled masks. A rendering/scheduling stall is suspected, not proven; the historical edge pass must not be represented as an unconditional final pass. The revised edge script's additional middle-click/tel cases were not reached in this failed refresh.
- Stress: **20 Home↔Company navigations**; no page errors or residual masks/inert locks, tracked global listeners stable, off-Home WebGL contexts zero. Home generally four contexts (one cycle two); rounded heap grew **9→11MiB**. This does not prove zero leaks or explain heap growth.
- Actual screenshot/compositor captures were obtained, including the blue band/dark rising curtain with navbar visible. However screenshot gaps were seconds long and CDP yielded only nine frames. **50–80ms frame cadence, sustained 60fps, physical Safari behavior, and the full every-CTA/every-direction visual matrix remain unverified.** No fabricated frame/FPS claims.

Artifacts in this sandbox: `/home/user/page-transition-qa/` (`results.json`, screenshots, `stress.json`, historical `edges.json`, latest failed `timing.json`, `screencast/`). These are external QA artifacts, not large committed assets. Test launch environment: `LD_LIBRARY_PATH=/tmp/chromium-libs/lib NODE_PATH=/home/user/browser-tools/node_modules node scripts/<script>.cjs`, with a production server on port 3000. Re-run on a representative GPU-backed browser before performance sign-off; investigate main-thread/rendering stalls rather than widening watchdog thresholds to conceal them.

## Merge verification (2026-10-31)

The PR isolates transitions from the previously uncommitted readiness/framework-upgrade and mobile-card work. It retains main's **Next.js 14.2.35** lockfile/framework rather than including the unrelated Next 15 upgrade. An isolated export of the exact staged files passed fresh `npm ci`, frontend TypeScript, lint, and production build. The earlier browser results above were obtained in the complete Next 15 working tree; they are not a claim of fresh browser acceptance on the isolated PR. A fresh smoke launch was attempted but could not run because the external Playwright tooling was no longer installed. The performance limitations remain open. No deployment is included.
