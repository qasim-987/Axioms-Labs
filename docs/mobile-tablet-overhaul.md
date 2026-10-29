# Mobile/tablet overhaul — implementation and verification

Date: 2026-10-29. Branch: `arena/3c08dc97-axioms-labs`. Baseline: `b513e59`.

## Merge update — 2026-10-30

PR #8 resolves conflicts with newer main by explicit owner choice: retain this session’s light homepage/service routes and root scrolling/layout, rather than the dark landing routes from PRs #6–7. Unrelated main additions remain. Post-resolution build and frontend/backend typecheck pass; lint exits successfully with five existing hook warnings in the retained, inactive `landing/` components. npm reports five dependency advisories (four high, one critical); no force-upgrade was applied. Original timing/FPS limitations still apply.

## Status and scope (implementation snapshot)

Implemented locally; **not committed, pushed, merged or deployed**. No application dependencies added. Desktop >=1024 retains its existing renderer, deck, hover and choreography; pricing is intentionally site-wide. Coarse/no-hover Hero selection follows input capability, including a coarse-pointer large screen, rather than user-agent strings.

**Not a full acceptance sign-off:** 55–60 FPS was not achieved in this software-WebGL environment, and the 180 ms nominal Hero release deadline can be delayed by main-thread contention. Physical phone/Safari testing, GPU performance acceptance and heap-leak certification remain outstanding.

## Six items, in requested order

Baseline reproduction covered 360×740, 390×844, 430×932, 768×1024 and 844×390. Baseline output is retained outside Git in `/home/user/browser-tools/before.json`; no certification is inferred from those screenshots/geometry checks.

1. **Hero touch/rest motion.** Root: the original renderer continuously ran idle/spring animation and shared hover plumbing; Hero scroll parallax also moved its stage. Touch had no press-scoped, demand-rendered lifecycle.
   - Added `TouchHeroSphere.tsx`, using the shared stage, Fibonacci buffer and screen-space spring solver, while retaining the original desktop renderer in `ParticleSphereHero.tsx`.
   - Passive touch/pen pointer handling, pointer capture, pan-y, vertical cancellation, release/cancel/lost capture/leave handling and a bounded settle path. Synthetic mouse events cannot start this renderer. Reduced motion uses only brightness/scale feedback. No resting RAF; resize/DPR/context restoration redraw on demand. Fine-hover-only sphere parallax in `Hero.tsx`.
   - **Timing limitation:** setting a 180 ms timer does not guarantee execution at 180 ms when the main thread is blocked. See measured results below.

2. **Remove concept induction on mobile/tablet.** Root: the whole home `CaseStudies` section, including two showcases and the four-item interactive index, mounted on every viewport before Services.
   - User explicitly selected removal of **entire Case Studies**. `ConceptBuildsGate.tsx` now imports/mounts it only at the permitted breakpoint. Below1024: no `#work`, showcase images, section canvas, section handlers or section ScrollTriggers.
   - Stable `display:contents` React-owned slots prevent React insert/remove errors when GSAP wraps adjacent pinned nodes. Empty slots add no layout box; this is not CSS-hiding a mounted CaseStudies subtree. Debounced refresh after gate changes and actual lazy mount.
   - Navigation already uses `/work`, not a removed home `#work` anchor; repository anchor audit found no orphan home `#work` links to replace. `/work` remains available.

3. **Services side-by-side fitting.** Root: the old mobile stage split height between a top particle canvas and bottom card, with independent size/scale calculations rather than the requested left/right composition.
   - New `MobileServices.tsx`: pinned viewport minus measured navbar, compact heading/counter/dots, left stage/right complete card, 12px grid gap and pale right-peeking deck. Uses 100vh fallback then 100svh. Safe-area padding retained.
   - Portrait stage width `clamp(112px,34vw,340px)`, tablet40%, short-landscape45%. Under340 uses stacked fallback and a development log. Fit ladder reduces padding/clamping before scale. First3 compact service bullets remain complete. Tools wrap.
   - Existing shared shape renderer and dust/ripple choreography retained, including its existing mobile fit radius (approximately74–93% of the smaller stage dimension at narrow sizes, not an exact80% guarantee).
   - Removed the obsolete parent mobile pin/choreography branch. Desktop section markup/choreography retained inside layout-neutral lifecycle slots so crossing1024 does not remove a GSAP-reparented node directly.

4. **Native swipe + vertical sync.** Root: the previous cards used vertical progress/overlaid shells; there was no native horizontal snap track or two-way touch/page ownership model.
   - Native `overflow-x:auto`, mandatory snap/start, snap-stop always, hidden scrollbar, overscroll-x contain and pan-x/pan-y. Passive touch/pen gesture observation; no custom mouse drag or touch preventDefault.
   - Direction threshold, distance/flick selection, one-step clamp and short ownership lock keep one active index shared by cards, fractional particle morph, dots, keyboard and prev/next. Settled swipe seeks its vertical pin hold; vertical progression seeks the horizontal track. Scrollend/timeout release ownership. Edge outward gestures are not captured/trapped.
   - Carousel region, numbered groups, inactive links removed from tab order, live announcement and 44px controls.

5. **Central launch pricing.** Root: three independent forms duplicated high budget bands/defaults; there was no central service-start/range/trust source. Existing service pages had no numeric service offers.
   - `src/config/pricing.ts` centralizes owner placeholders, USD/en-US Intl formatting, bands, neutral default and trust copy. `LaunchPricing.tsx` supplies visible estimates on all four service pages. Metadata and Service/AggregateOffer JSON-LD use the same values. Final scope/quote disclaimer prevents a guaranteed-price implication.
   - No existing numeric FAQ, package, CMS/widget, blog or backend price catalog was found in the repository. Backend accepts the budget string rather than an old enum, so no backend migration was necessary. Live external CMS/widget content was not queried or changed.

6. **Icons/chips/ticker/navigation.** Root: phone chips retained full text/padding and some shared tool renderers returned generic fallback glyphs, making narrow rows crowded; the ticker needed a single clear icon-only phone presentation.
   - `ToolChipContent.tsx`, `responsive.ts`, `ServiceToolIcons.tsx`, mobile CSS and chip consumers provide named/title-bearing icon tiles below640, labels at640+, and readable unknown-tool text fallback (including MCP). Desktop chip content remains text-only as before.
   - `LogoStrip.tsx`: one nonoverlapping continuous strip; duplicate group is aria-hidden; known phone tools get44px named icons, unknowns retain text. Service detail/work/detail chips wrap and remove excess known-icon shell padding on phones.
   - New mobile service controls/tool targets are44px; labels in very short >=640 landscape layouts stack under icons at9px to preserve fit. Mobile navbar Services accordion already provided full-width rows; verified four rows >=44px rather than rewriting approved navigation.

## Changed files and why

| File(s) | Purpose |
|---|---|
| `src/components/TouchHeroSphere.tsx` (new) | Demand-rendered touch Hero lifecycle |
| `ParticleSphereHero.tsx`, `Hero.tsx`, `src/lib/particleEngine.ts` | Capability boundary, touch hit-testing/parallax, optional shared pointer subscription |
| `ConceptBuildsGate.tsx` (new), `CaseStudies.tsx`, `src/app/page.tsx` | Lazy exclusion, safe pin boundary, refresh |
| `MobileServices.tsx` (new), `ServicesGrid.tsx` | Native mobile composition/sync; remove obsolete mobile implementation; retain desktop branch |
| `src/app/globals.css` | Mobile/tablet sizing, fit levels, safe-area layout, responsive chips and ticker |
| `src/config/pricing.ts` (new), `LaunchPricing.tsx` (new) | One owner-editable pricing/trust source and presentation |
| `ContactSection.tsx`, `src/app/contact/page.tsx`, `ServiceDetailClient.tsx` | All form budgets/defaults, service estimates/trust |
| `src/app/services/[slug]/page.tsx` | Central-price metadata and JSON-LD |
| `src/config/responsive.ts` (new), `ToolChipContent.tsx` (new), `ServiceToolIcons.tsx` | Breakpoints, accessible icons and unknown text fallback |
| `LogoStrip.tsx`, `WorkPageContent.tsx`, `CaseStudyDetailClient.tsx` | Responsive ticker and tool-chip consumers |
| `scripts/check-mobile-config.cjs`, `check-mobile-view.cjs`, `check-responsive-extras.cjs`, `check-hero-restore.cjs` (new) | Optional isolated browser/config regression checks |
| `scripts/check-services-browser.cjs` | Desktop-only regression suite; measure original pin spacer rather than current fixed-position pin |

Component names without a full path above are under `src/components/`.

## Configuration and thresholds

| Setting | Default / behavior |
|---|---|
| `RELEASE_MODE` | `settle`; alternative `freeze` |
| `RELEASE_SETTLE_MS` | 180; cubic offset return plus timer final draw/RAF cancellation; scheduling not a real-time guarantee |
| `HIDE_CONCEPT_BUILDER` | `mobile`; alternatives `all`, `none` |
| `MOBILE_SERVICES_LAYOUT` | `side`; alternative `stacked` |
| `MOBILE_STACKED_BELOW` | 340px |
| `SWIPE.DIRECTION_PX` | 9px |
| `SWIPE.DISTANCE_RATIO` | .25 of card width |
| `SWIPE.FLICK_PX_MS` | .45px/ms |
| `SWIPE.SYNC_LOCK_MS` | 550ms; early unlock when both destinations settle |
| `SWIPE.DECK_STEP_PX` | 12px per preview layer |
| Gesture settling debounce | 100ms; native scrollend when supported |
| Vertical hold progress | .075, .385, .695, .96 |
| `ICON_ONLY_BELOW` | 640px; matching CSS media query is explicit because CSS variables cannot parameterize media queries |
| Breakpoints | Mobile<768; tablet768–1023; desktop>=1024 |

## Pricing audit: old → new

All monetary values below are owner placeholders, **not verified market research or fixed quotes**.

| Surface/path | Old | New |
|---|---|---|
| `src/components/ContactSection.tsx` | $1,000–2,500; $2,500–5,000; $5,000–15,000; $15,000+; default second band | Six central bands; neutral Not sure default |
| `src/app/contact/page.tsx` | Same four; default $2,500–5,000 | Same central bands/default |
| `src/components/ServiceDetailClient.tsx` | Same four; default $2,500–5,000 | Same central bands/default |
| UI/UX `/services/ui-ux-design` | No numeric service offer | Starting from $300; typical $300–1,500 |
| Web Designing `/services/web-designing` | No numeric service offer | Starting from $250; typical $250–1,200 |
| Web Development `/services/web-development` | No numeric service offer | Starting from $600; typical $600–3,500; custom apps/SaaS from $2,000 |
| AI Agents `/services/ai-agents` | No numeric service offer | Starting from $800; typical $800–5,000 |
| Four service-page metadata + JSON-LD | No numeric service offers | Central descriptions and USD low/high values above |

New bands: **Under $500; $500–1,500; $1,500–3,500; $3,500–7,500; $7,500+; Not sure yet, let's talk**.

### Every owner confirmation

`TODO(owner): confirm` is attached to currency, locale, every service starting price/range, custom-app start, every budget-band label and launch copy. Confirm that these are the intended first-client offers before publication. `Free 30-minute consultation` is configured but **disabled** (`showConsultation:false`) until the offer is verified. No free consultation claim is published. Confirm estimates/disclaimer wording and tax/scope treatment; no tax rule, conversion or promise was invented.

## Verification (production build, bundled headless Chromium)

- `npm run build`: pass (26 generated pages).
- `npm run typecheck`: frontend/backend pass. `npm run lint`: pass. `git diff --check`: pass.
- Central config, fractional morph windows, Services timeline and performance-tier unit scripts: pass. Three's CJS warning is from Node QA, not a browser runtime error.
- CPU4× mobile suite: **320×740, 360×740, 390×844, 430×932, 600×960, 768×1024, 820×1180, 844×390** pass functional assertions: resting Hero frame count stable, loop eventually stopped after release, no #work, all4 cards/contents fit, zero page overflow, native left/left/right swipes, dots/keyboard/prev, vertical synchronization, ticker and drawer targets, zero console/page errors. This is **not** a settle-time/FPS pass.
- Latest measured in-browser pointerup→stopped at those widths: **182.8, 568.9, 186.8, 182.6, 183.2, 182.3, 183.2, 228.1 ms**. These exclude host/CDP dispatch latency. The large360 outlier demonstrates the unmet strict timing requirement under load. Prior runs also varied (184–410 ms).
- CPU4× desktop suite: **1920×960, 1536×730, 1366×650, 1120×685, 1024×700** pass all4 forward/reverse states, visible opaque shells, card/content fit, deck bounds and accessibility, zero console/page errors. This is functional regression coverage, not pixel-diff equivalence.
- Additional unthrottled checks pass: synthetic mouse ignored on touch Hero; native vertical Hero scroll; repeated844→1024→768→1366→390 transitions with correct section mounting/no overflow/errors; reduced-motion brightness-only Hero and static 2D/no-WebGL Services; four price/meta/JSON-LD pages; contact bands/default.
- DPR change and forced WebGL loss/restore: pass; redraw followed by stable frame count and stopped resting loop.
- Services scrolling in software WebGL + CPU4× at390 previously measured **3.69 average FPS**, 16 sampled intervals/4seconds, median233ms. **55–60 FPS is not met/verified.** This environment is not a physical midrange phone GPU. No Lighthouse, Safari, physical-device, heap-growth or real-GPU certification is claimed.

### Reproduce

Run `npm run build && npm start`. Browser scripts use isolated Playwright and bundled Chromium outside the application dependency tree:

```sh
NODE_PATH=/home/user/browser-tools/node_modules \
LD_LIBRARY_PATH=/tmp/chromium-libs/lib USE_BUNDLED_CHROMIUM=1 \
node scripts/check-mobile-view.cjs
# Then check-services-browser.cjs, check-responsive-extras.cjs, check-hero-restore.cjs
```

`check-mobile-view.cjs` and desktop suite accept `BASE_URL`; extras/restore currently target the local production preview. Raw final mobile/desktop output: `/home/user/browser-tools/mobile-qa-final.txt` and `desktop-qa-final.txt` (outside Git).

## Assumptions and remaining acceptance work

1. Entire CaseStudies exclusion was explicitly approved; `/work` and detail routes stay available.
2. Desktop preservation means existing appearance/interaction branches, not identical SSR markup or zero lifecycle scaffolding. Lazy desktop CaseStudies adds a client mount delay; layout-neutral slots avoid GSAP/React DOM ownership collisions.
3. Capability detection takes priority for touch Hero, including hybrid/large coarse screens. Mouse-driven Services remains unchanged at>=1024; a narrow fine-pointer browser gets controls/vertical progression but no added mouse dragging.
4. At360, a34vw stage plus gutters/gap cannot also leave a230–250px card. Prioritize complete compact content; under340 stack. The first3 compact bullets/tools are deliberate summaries; full service detail remains linked. Intro is omitted to preserve fit.
5. Reduced-motion and unavailable-WebGL Services use the existing static fallback, not the animated pinned carousel. Shared shape scale/glow remains inherited rather than an exact80% rewrite.
6. One continuous ticker (not a second parallel ticker) is intentional; its second internal copy is hidden from accessibility for seamless looping.
7. Every launch price/trust value awaits owner confirmation. Web Designing maps to Web Design; AI Agents maps to AI Automation. Existing USD/en-US convention retained. No external CMS, payment widget or live delivery backend data was modified; no real inquiry was submitted during testing.
8. Use feature-native browser scrolling/cancellation. Chrome emulation is not Safari coverage; edge-outward gestures and real-device diagonal intent still need hands-on review.
9. Cleanup and repeated resize/context tests are useful smoke checks, not proof of absence of memory leaks. Heap profiling and longer rotation/route soaks remain.
10. **Outstanding before full sign-off:** strict release timing under contention; real-device/GPU55–60FPS; physical Safari/phone input; heap/leak and desktop visual pixel comparison. No deploy approval is implied by implementation or test results.
