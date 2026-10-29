# [NAME] Landing — test checklist

Map each item to the spec section in `src/lib/landingConfig.ts` and the components under `src/components/landing/`.

## A. Page-load intro
- [ ] Intro starts only after `document.fonts.ready` AND the first WebGL frame (`useAppReady`).
- [ ] Single master `gsap.timeline` (`IntroController`), exposed as `window.__INTRO_TL__` in dev.
- [ ] Headline: two lines; line 2 right-indented under middle of line 1; `clamp(40px, 5.2vw, 96px)`; line-height 1.05; emphasized words bold italic 700.
- [ ] SplitText: `type:"lines,chars"`; mask overflow hidden with padding-bottom; per-char yPercent 110 + rotation 8–14°; `transformOrigin: "0% 100%"`; opacity 0 → 1; dur ~0.9s; stagger ~0.025s from start; power4.out; both lines parallel ~0.12s offset.
- [ ] SplitText reverted after completion; `aria-label` on `<h1>`, `aria-hidden` on all split spans.
- [ ] Stats: count up 1.5–2s power2.out with integer snapping; "100%" odometer digit roll; "24/7" fade/slide; runs once.
- [ ] Particle sphere: ~7,600 desktop / ~3,500 mobile points; Fibonacci hollow shell denser at edge; DPR capped 1.75.
- [ ] Sphere pauses when tab is hidden / out of viewport (`IntersectionObserver` + `visibilitychange`).
- [ ] WebGL disposed on unmount; static PNG/CSS fallback renders when WebGL is unavailable.
- [ ] `prefers-reduced-motion`: reduced intro (0.25s fade), no char animation, no sphere rotation.

## B. Hero scroll exit
- [ ] Text / stats / CTA fade up/out to `y: -40`, opacity 0, scrubbed.
- [ ] Canvas translates left (`x: -140`) and scales 1 → 1.4, `scrub: true`.

## C. Services section
- [ ] ≥ 4 real `<a>` cards, dark glassy, shared `.halftone-dots` texture.
- [ ] Pinned ScrollTrigger scrub on desktop (`scrub: 0.5`, `82vh` per step).
- [ ] Active card: solid violet, expands; title → desc → sub-services → tools stagger 0.5s power3.out.
- [ ] Inactive cards: shrink + dim.
- [ ] Touch: scroll-snap row, centred card active, no hover states.
- [ ] Active card drives particle morph sphere → square → `</>` glyph (`uMorph` 0.8s power2.inOut).
- [ ] `ScrollTrigger`s killed and stages disposed on route change.

## D. Card → service page transition
- [ ] Click: card slides left + fades; violet band sweeps up; ~0.5s black; `router.push` at 0.60s.
- [ ] New page enters with pixelated violet glow from the left; nav fades; new H1 gets focus.
- [ ] Skip Cmd/Ctrl/Shift / middle-click; double-click lock; min duration enforced; max timeout 3200ms.
- [ ] `prefers-reduced-motion`: 200ms simple fade instead of the full transition.
- [ ] Hover prefetches the target service page.
- [ ] Back/forward handled (router `events` listeners cleaned up).

## E. Service page
- [ ] One `<h1>` per page; eyebrow small-caps; one italic gradient word in H1; paragraph; primary + outline buttons.
- [ ] Violet diagonal glow from left edge + pixelated/dithered CSS texture; no particle canvas.
- [ ] Right form card: First name, Last name, Email, Phone + country-code selector, Service Interested In (prefilled slug), Budget select, Message.
- [ ] Per-page `<title>`, meta description, Open Graph tags.
- [ ] Zod validation client + server; honeypot; rate limit; success/error states.

## F. Contact API (`POST /api/contact`)
- [ ] Zod schema validates all fields (phone, countryCode optional).
- [ ] Honeypot field: non-empty value silently aborts with 200.
- [ ] Velocity gate: submits faster than 1s after load rejected.
- [ ] Rate limit per IP; appends to Google Sheets (backend) / records submission.
- [ ] Returns success/error JSON shapes consumed by `apiClient`.

## G. Accessibility (WCAG AA)
- [ ] Focus-visible rings on all interactive elements.
- [ ] Keyboard-navigable dropdowns and cards (cards are real `<a>`).
- [ ] Color contrast ≥ 4.5:1 on white text over `#05060A`.
- [ ] Reduced-motion media query honoured end-to-end (intro, hero exit, morph, transition).
- [ ] 360 → 2560 px responsive checkpoints: 360, 375, 414, 768, 1024, 1440, 2560.

## H. Performance & memory
- [ ] Lighthouse mobile ≥ 85; CLS ≈ 0.
- [ ] Fonts: `next/font` with `display: swap`, preloaded; Plus Jakarta Sans 300/400/600 + 700-italic.
- [ ] Three.js lazy-loaded via dynamic import, `ssr: false`.
- [ ] `gsap.context` / `useGSAP` used; all `ScrollTrigger`s killed; Lenis destroyed; rAF cancelled; Three.js disposed on unmount / route change.
- [ ] No console errors or warnings on load and after card → service page → back navigation.

## I. Code quality
- [ ] `tsc --noEmit` passes with 0 errors (TS strict, no `any`).
- [ ] `next build` passes with 0 errors.
- [ ] Config constants live in a single file (`src/lib/landingConfig.ts`).
- [ ] Brand placeholders `[NAME]`, `[SVG wordmark]` only — no third-party brand names, logos, copy, or code.
- [ ] Comments only where non-obvious.
