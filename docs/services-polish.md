# Services polish — 29 October 2026

## Scope and root causes
Targeted changes to the existing Services GSAP progress/pinning, shared particle stage, card DOM and technology ribbon. No Hero edits, no new application dependencies, no backend edits. The deck explicitly supersedes the earlier hidden-upcoming-card rule.

| Issue | Reproduction / cause | Correction |
|---|---|---|
| Sphere entry | Reproduced; timeline held `blob` at progress 0–.025, then morphed through .115 while card 01 was active. | Start/target buffers are wireframe; visibility-triggered 900ms irregular-cloud ripple assembly. Services-only sphere generator removed. |
| Muddy transition / collision | Reproduced whole-shell opacity changes (e.g. outgoing .002, incoming .962). This makes the background translucent, exposing lower text. | Shells remain opacity 1 with an opaque base. Only dark overlay and content opacity change. Outgoing content fades over 0–45%, incoming reveals over 45–100%; z-order hands off at 50%. |
| Clipping / short-stage proportions | Bottom clipping was not reproduced on the current starting branch at 1120×685 (prior fixes already present). However, fixed card/canvas floors and a minimum scale floor were unsafe; small shape radius was capped at 184px. | Header/card measured from real navbar-adjusted height; desktop bottom budget >=26px; compact mode <720px. Two measured tightening levels precede unrestricted last-resort proportional fit. Shape fills the smaller canvas dimension rather than remaining at the old cap. |
| Desktop imbalance | Reproduced 336px card at 1120px; old desktop width capped at 416px. Description used flex centering; heading gap could be 12px; intro occupied the far edge. | Card width up to 680px after reserving deck offsets; right/left split 57/43. Header max width 856px with intro alongside, baseline counter/dots, 24/28px heading gap. Description follows header by 16/20px; footer uses margin-top:auto. |
| Ticker | Overlapping circles were not reproduced on this branch: previous nonshrinking intrinsic-width pills already fixed that. Missing offscreen pause, wrapped reduced motion and arc spacing were confirmed in source. | Retain one duplicated track; 16px inter-pill/trailing gaps, existing inline SVG tool icons, 48/56px pills, CSS edge mask, desktop hover and visibility pause. Reduced motion wraps one copy and hides the duplicate. Arc lowered by 48px. |
| Colors | Intentional Antigravity palette shared with Hero: obsidian/charcoal, navy, blue, periwinkle, coral, amber, green. | Unchanged. No palette replacement. |

## Constants and geometry
- `SHOW_UPCOMING_PREVIEW = true` (desktop deck). Phones/tablets retain the single-card vertical choreography, not a horizontally squeezed deck.
- `MORPH_DISPERSAL = .35`; bounded seeded, axis-stretched volumetric points and axis-stretched curl noise replace the old sphere midpoint. Radius cap is 1.3× the maximum service-shape radius, applied during morph scatter.
- `ENTRY_ASSEMBLE_MS = 900`, once per canvas mount at its first actual intersection, measured in wall-clock time. Start/target arrays are already wireframe; the vertex shader assembles from the irregular volume with spatial/seeded ripple delay. Reversing scroll does not replay entry or return to a sphere. Breakpoint remount assembles the currently implied shape.
- Deck first offset `clamp(56px, 5vw, 96px)`; second `clamp(108px, 9.5vw, 176px)`; scales `.96`, `.92`; outgoing X `-40px`; radius `28px`.
- Title/header ghost opacity `.35` / `.18`; descriptions/footer multiply by `.5` (= `.175` / `.09`). The dark overlay fades over an opaque white-backed frost gradient: `rgba(230,232,239,.92)` → `rgba(236,238,244,.90)`. This avoids making the actual card background translucent.
- Desktop active width `min(680px, availableRightColumn - secondDeckOffset)` with right margin reserved. Existing navbar measurement retained.
- Compact: viewport height `<720px`; intro hidden, three service rows, six tools in a row. Resize-only fit ladder uses 16px padding, then 12px padding/18px title/12px two-line description/11px list, then proportional scaling if still needed. Mobile/short-landscape layout continues to use its existing budgets and native touch scrolling.
- Particle scale: desktop min(width×.37,height×.37,320px), minimum60px; mobile min(width×.37,height×.39,220px), minimum52px. Existing hover pulse `.36`, 820ms, rotation multiplier1.5, leave500ms are unchanged.
- Updated seek/snap hold points `.075 / .385 / .695 / .96` land inside shape/card holds after removing the sphere timeline segment.

## Files changed
- `src/components/ServicesGrid.tsx`: opaque full-size deck replaces collapsed-tab rendering; measured widths/heights, content ordering, two-level fit ladder, preview accessibility, mobile content-only fades. Existing pin, progress, hover/focus and route behavior retained.
- `src/components/ServicesParticleCanvas.tsx`: sphere-free entry, once-visible 900ms assembly, irregular bounded morph scatter, larger responsive shape sizing, corrected hold targets. Reuses the existing particle engine and tier governor.
- `src/lib/serviceParticleShapes.ts`: remove unused Services blob generator/type/target; retain all four actual service generators. Shared Hero Fibonacci generator is untouched.
- `src/components/LogoStrip.tsx`: existing inline tool icons, sized nonshrinking pills, desktop-only hover/offscreen/tab pause and lower arc.
- `src/app/globals.css`: deck ghost styles, measured compact-fit levels, ticker hover and static-wrapped reduced-motion styles.
- `scripts/check-services-timeline.cjs`: sphere-free forward/reverse timeline and shape-buffer checks.
- `scripts/check-services-browser.cjs`: optional isolated Playwright regression test; no application package changes.
- `Animations.md`, this report and responsive-audit cross-link: actual constants, verification and assumptions.

## Verification
Production build; headless Chromium with software WebGL, 4× CPU throttling and touch/mobile emulation below 1024px.

| Viewport | Four services forward/reverse | Active content fits; no desc/list overlap | Opaque shells / one accessible active card | Horizontal overflow / console errors |
|---|---|---|---|---|
| 1920×960 | Pass | Pass | Pass | 0px / 0 |
| 1536×730 | Pass | Pass | Pass | 0px / 0 |
| 1366×650 | Pass | Pass | Pass | 0px / 0 |
| 1120×685 | Pass | Pass | Pass | 0px / 0 |
| 1024×700 | Pass | Pass | Pass | 0px / 0 |
| 360×640 | Pass | Pass | Pass | 0px / 0 |
| 390×844 | Pass | Pass | Pass | 0px / 0 |
| 768×1024 | Pass | Pass | Pass | 0px / 0 |
| 820×1180 | Pass | Pass | Pass | 0px / 0 |
| 667×375 | Pass | Pass | Pass | 0px / 0 |

Desktop holds show at most two upcoming cards; their right edges stay at least16px inside the viewport. Inactive shells/links are removed from tab order, aria-hidden and pointer-disabled. Mobile stays one-card. Automated assertions cover these properties and every card's unscaled content/viewport fit; intermediate transition screenshots were also inspected for overlap.

Ticker checks at 360/820/1120/1920: all20 rendered pills have zero internal horizontal overflow; group widths match within .01px. Primary group widths are ~1449px on phones and ~2478px on larger screens (long enough to avoid an empty trailing viewport within the 320–1920 target). Heights48/56px; offscreen pause, desktop hover pause and reduced-motion wrapped single-copy layout pass. Keyboard focus on active arrow at1120/1920 reaches blue focus/hover feedback.

`npm run typecheck` (frontend + backend), `npm run lint`, production build (26 routes), tier-governor tests, timeline tests and whitespace checks pass. Browser tools are installed outside the repo. For bundled Chromium in this sandbox, its packaged NSS/NSPR libraries were extracted outside the repo and supplied via `LD_LIBRARY_PATH`; its single-process flag is removed.

### Limits / assumptions
- Desktop deck only is intentional: it avoids sacrificing phone card width and preserves the requested earlier mobile/touch behavior.
- No real iOS Safari/Android testing, sustained60fps claim, Lighthouse/CLS measurement, exhaustive orientation/long-session test, or device-wide performance certification. Software WebGL under CPU throttling is functional QA, not a GPU benchmark.
- Midpoint cloud and entry are verified by source/timeline tests and screenshots, not particle-by-particle GPU telemetry. Hover/touch pulse parameters are preserved; exact frame rate on hardware remains unmeasured.
- The pale frost is composited over opaque white, without backdrop/filter animation. This is intentional to prevent the original translucent-background bug.
- Changes are local on `arena/201244a6-axioms-labs`; no push, merge or production deployment performed for this task.
