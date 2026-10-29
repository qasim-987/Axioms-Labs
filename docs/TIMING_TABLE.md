# [NAME] Landing — animation timing table

All times are seconds, measured from intro start (`document.fonts.ready` + first WebGL frame). Source of truth: `src/lib/landingConfig.ts` (`INTRO`, `HERO_EXIT`, `MORPH`, `TRANSITION`, `PARTICLES`, `SERVICES`).

## 1. Page-load intro (single master `gsap.timeline`, played once)

| Stage | Start | Duration | End | Ease | What happens |
|---|---|---:|---:|---|---|
| Black hold + watermark | 0.00 | 0.60 | 0.60 | — | Document is near-black; only the giant watermark is visible (content hidden via CSS until fonts + first frame are ready). |
| Light beam | 0.60 | 0.60 | 1.20 | power2.out | Top-left volumetric beam fades/slides in (`LightBeam`, registered as `beam`). |
| Navigation | 1.00 | 0.70 | 1.70 | power3.out | Nav slides down `y: -12 → 0` and fades in (`BrandNavbar`). |
| Nav button | 1.55 | 0.40 | 1.95 | power2.out | CTA pill goes greyed → normal (`navButton` timeline getter). |
| Headline (line 1) | 1.10 | 0.90 | ~2.60* | power4.out | Per-char reveal: yPercent 110 → 0, rotation ±8–14° → 0, opacity 0 → 1, stagger 0.025 from start, transformOrigin 0% 100%. |
| Headline (line 2) | 1.10 | 0.90 | ~2.60* | power4.out | Same as line 1, in parallel, offset by `lineOffset 0.12` per line; line 2 right-indented under middle of line 1. |
| Subtext | 2.30 | 0.80 | 3.10 | power3.out | Fades up `y: 16 → 0`. |
| CTA button | 2.60 | 0.60 | 3.20 | power2.out | Fades in from scale 0.96. |
| Stats | 2.80 | 1.60 | 4.40 | power2.out | Count-up 1.5–2s snap integers; "100%" odometer roll; "24/7" fade/slide. Runs once. |
| Particle sphere | 3.00 | 1.00 | 4.00 | power3.out | Fades/scales in (0.85 → 1), rotation starts. |
| **Intro total** | | | **≈ 4.6** | | SplitText DOM reverted after master complete; master timeline exposed as `window.__INTRO_TL__` in dev. |

\* Both headline lines run in parallel from `start: 1.10`; the line offset staggers lines, not characters across lines.

## 2. Reduced-motion intro (`prefers-reduced-motion: reduce`)

Single simple fade, `dur: 0.25`, stagger 0.04, `power2.out`. No character animation, no rotation, no SplitText DOM mutation.

## 3. Hero scroll-exit (scrubbed to scroll progress, `scrub: 0.5`)

| Target | End state | Notes |
|---|---|---|
| Headline / subtext / stats / CTA | `y: -40`, `opacity: 0` | Fade up and out as the user scrolls past the hero. |
| Particle sphere canvas | `x: -140`, `scale: 1.4` | Translates left and scales 1 → 1.4, scrubbed. |

## 4. Services pin + morph (desktop pinned ScrollTrigger, `scrub: 0.5`)

| Step | Scroll distance | Morph |
|---|---|---|
| Per service step | `82vh` (`vhPerStep`) | `uMorph` tween `0 → 1` over `MORPH.dur = 0.8s`, `power2.inOut`, when the active card changes. Target sequence: sphere → square outline → `</>` glyph (offscreen-canvas sampled). |

Touch: scroll-snap row, centred card active; no hover.

## 5. Card → service page click transition (total ≈ 2s)

| Phase | Duration | What happens |
|---|---:|---|
| Card exit | 0.40 | Active card slides left + fades; heading and particles fade out. |
| Violet band | 0.20 | Full-width violet band sweeps upward. |
| Black hold | 0.50 | Near-black screen (min duration). |
| `router.push` | at 0.60 | Navigation happens here (page prefetched on card hover). |
| New page enter | 0.80 | Violet glow enters pixelated from the left; new content fades in; nav fades; focus moves to the new H1. |
| Locks | — | Skip Cmd/Ctrl/Shift/middle-click; double-click lock; min duration + max timeout 3200ms; `prefers-reduced-motion` → simple 200ms fade. |

Route change: all `ScrollTrigger`s killed, all WebGL stages disposed, Lenis destroyed before the push.

## 6. Particle budget

| Platform | Point count | DPR cap | Notes |
|---|---:|---:|---|
| Desktop | 7,600 | 1.75 | Fibonacci hollow shell, denser at edge. |
| Mobile | 3,500 | — | Pausing via `IntersectionObserver` + `visibilitychange`; full dispose on unmount; PNG/CSS static fallback when WebGL is unavailable. |
