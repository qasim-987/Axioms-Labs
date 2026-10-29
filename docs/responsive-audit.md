# Responsive implementation audit — 2026-10-28

## Verification boundary
The initial pass was a **source audit and implementation report**, not device certification; the requested browser-first audit was not completed before those edits. During the screenshot follow-up, Chromium was successfully launched using the isolated package's bundled NSS/NSPR libraries and removing its single-process flag. The follow-up checks below supersede the earlier launch-blocked status, but do not certify the entire site. No real iOS/Android, FPS, long-task, Lighthouse, CLS, or accessibility-scan results exist. Lighthouse score: **not measured**.

## Screenshot follow-up — measured Chromium checks

### Corrections
- `src/components/LogoStrip.tsx`: intrinsic-width, nonshrinking track, groups and pills prevent nowrap labels from spilling outside compressed pill backgrounds. Two identical groups include matching trailing gaps so the existing -50% animation loops without a seam. The duplicate group is hidden from accessibility APIs; reduced motion stops the animation.
- `src/components/ServicesGrid.tsx`: mobile card height gets priority over decorative canvas height (328px compact / 344px normal reserve; canvas floor 96px rather than 136px). Full portrait descriptions are no longer line-clamped. Desktop Services layout and choreography are unchanged.

### Actual checks after the correction
- Production build served on port 3001; headless Chromium, 4× CDP CPU throttling, mobile/touch emulation below 1024px.
- Home checked at 320×640, 360×640, 375×667, 390×844, 412×915, 430×932, 600×960, 768×1024, 820×1180, 667×375, 844×390, 1024×768 and 1920×960: document horizontal overflow **0px**, uncaught page errors **0** at all 13 viewports.
- Additional four-card forward-scroll checks at 320×640, 360×640, 390×844, 820×700, 667×375 and 844×390: all four services reached, active card scroll overflow **0px**, description/service-list overlap **none**, active card and service-list bottoms inside the viewport.
- Technology pills checked at those six widths: all 10 primary pills had **0px internal horizontal overflow**; both marquee groups had identical widths.
- Screenshots manually inspected at 360×640 and 820×700 for card fit and at 820×700 for technology strip spacing. These are emulation results, not real-device certification or an all-route audit.
- Typecheck (frontend/backend), lint, production build (26 routes), and diff whitespace checks pass. No app dependencies added.

Earlier source-audit notes and pending acceptance items below are retained for context; only the explicitly measured checks above are now verified.

## Root causes found in the baseline source
| Area | Root cause | Widths requiring testing (not observed browser failures) |
|---|---|---|
| Navigation | Desktop links started at 768px; drawer lacked scroll lock, focus trap, and accordion; targets around 40px or smaller | 360/390/412/430/600/768/820 |
| Services stage | 340vh sticky wrapper with 150px minimum canvas plus intrinsic card, no landscape budget, overflow-hidden stage; instant card replacement rather than reversible transition | All widths below 1024, especially 360x640, 667x375, 844x390 |
| Services toolbar jumps | Mobile stage used dynamic dvh; visualViewport resize recomputed layout during toolbar/keyboard changes | All mobile widths |
| GPU load | Fixed 3600 mobile / 7200 desktop counts, DPR2 and antialias regardless of hardware; no frame-time governor | Phones/tablets and narrow desktop |
| Static fallback | Reduced-motion cards each initialized a WebGL stage | All reduced-motion widths |
| Scroll initialization | Lenis created on touch; one 250ms refresh instead of fonts/decode/route settling | All mobile widths; late fonts at any width |
| Inner-page canvas | Architecture canvas read getBoundingClientRect every animation frame; continued drawing hidden/offscreen | All widths |
| Forms | 14px inputs cause iOS focus zoom; missing autofill/input modes; generous fixed gutters reduce usable width | Phones/tablets |
| Hover | Fine-pointer state was read only once in work cursor; synthetic touch mouse events could invoke magnetic transforms | Touch and breakpoint changes |

## Implemented changes / before-after status
- Navbar: hamburger below 1024; real top-bar measurement excluding drawer; safe-area padding; scrollable viewport-height drawer; Escape, focus cycling and return, link-close, services accordion. Interaction testing pending.
- Services: separate portrait and short-landscape layouts; measured navbar subtraction; svh fallback; compact bullets/tools, fit-scale safety; four cards remain mounted and animate using transforms/opacity; only active/outgoing/incoming are visible as appropriate. Touch canvas pulse and soft scroll-stop snap. Flick skipping, card fit, safe-area geometry and orientation stability still require browser tests.
- Fallback: unpinned four-card list for reduced motion and services WebGL failure/loss, static 900-point 2D shape canvases. No four-context allocation. Hero static fallback for reduced motion or failed initialization.
- GPU tiers: high 7200/DPR2/AA, medium 3600/DPR1.5/AA, low 2160/DPR1/no AA. Tier unit tests cover mobile widths, constrained cores/RAM, Save-Data, downgrade, cooldown, and low floor. 1700ms/45-sample windows, <45fps downgrade, 12s cooldown, no upgrades. Count/DPR downgrade is immediate; shader noise amplitude/wobble are cheaper on low tier, not a separate shader implementation.
- Scrolling: native touch, desktop Lenis lerp .075/wheel .95; refresh after fonts, image decode, route and orientation; ignoreMobileResize enabled.
- Layout: viewport-fit cover, body overflow-x masking removed, narrow-screen form/gutter/typography and contact email fixes, hover gating, reduced mobile blur cost.
- Architecture canvas: cached dimensions, ResizeObserver, offscreen/tab pausing and touch/keyboard layer selection.

## Validation executed
- `npm run typecheck`: frontend and backend pass.
- `npm run lint`: final run recorded in task response.
- `npm run build`: production build produces 26 routes.
- `node scripts/check-performance-tier.cjs`: passes tier/governor assertions.

## Requested matrix — pending browser/device execution
320x640; 360x640; 375x667; 390x844; 412x915; 430x932; 600x960; 768x1024; 820x1180; 667x375; 844x390; 1024x768; 1920x960. For **every row**, overflow, clipped/overlapping elements, text readability, targets >=44px, pinning, canvas fit, FPS and console errors are **not measured**. Additional tablet landscape and 20-rotation memory runs remain pending.

## Known gaps / assumptions
- No runtime detection of unreliable pinning or very-low-power unpinned fallback; low tier retains animations. WebGL failure and reduced motion select the stack.
- Hero and services retain two allocated contexts (only visible stages render); shared-context virtualization/disposal was not implemented.
- Some legacy animation loops still schedule rAF while skipping offscreen rendering. No claim of zero allocations or zero offscreen callbacks.
- Desktop source presentation was retained for Hero, case studies, footer, stats and methodology. No pixel-comparison proof; shared robustness changes and navbar restructuring require desktop regression review.
- No guarantee of 44px targets site-wide, no-overflow across all routes, 55–60fps, <50ms long tasks, or CLS<.1 without browser testing.
- No floating assistant/chat component or newsletter form exists in the current source; none was invented.
- Existing `Animations.md` is the motion-spec filename (not `animation.md`). Existing four-service catalog and palette remain unchanged.
- No app dependency added. Isolated browser test tools are outside the repository and do not affect package.json/lockfile.
- Production was not redeployed: review and browser/device QA should precede publishing this larger change.

## File inventory (one-line reasons)
- `Animations.md` — record actual responsive motion constants and limitations.
- `src/app/blog/[slug]/page.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/app/blog/page.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/app/contact/page.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/app/globals.css` — small-breakpoint sizing, input, overflow and safe-area rules.
- `src/app/layout.tsx` — viewport-fit cover and remove body overflow mask.
- `src/components/CaseStudyDetailClient.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/CaseStudyScrollShowcase.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/CompanyPageContent.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/ContactSection.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/Footer.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/Hero.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/LightRays.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/MethodologySection.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/Navbar.tsx` — responsive drawer, accordion, focus management and measured bar.
- `src/components/ParticleSphereHero.tsx` — adaptive budget and static initialization fallback.
- `src/components/ServiceDetailClient.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/ServicesGrid.tsx` — portrait/landscape pinned stage and fallback card list.
- `src/components/ServicesParticleCanvas.tsx` — adaptive count/DPR, touch pulse, static fallback.
- `src/components/SmoothScrollProvider.tsx` — native touch and settled refresh lifecycle.
- `src/components/SplitTextReveal.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/SpotlightCard.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/StatsSection.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/ViewWorkCursor.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/components/WorkPageContent.tsx` — narrow-screen layout, input/accessibility or pointer/animation robustness.
- `src/lib/particleEngine.ts` — DPR controls, context lifecycle, static point-cloud rendering.
- `src/lib/performanceTier.ts` — shared hardware hints and one-way FPS governor.
- `scripts/check-performance-tier.cjs` — repeatable tier and cooldown tests.

## Subsequent Services-specific update — 29 October 2026
The later deck/entry/ticker specification supersedes this report's hidden-upcoming-card, initial-blob and old seek-target notes. See [Services polish and measured regression results](services-polish.md) and Animations.md §15 for current constants and scope. Earlier whole-site limitations remain applicable.
