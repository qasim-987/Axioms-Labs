# [NAME] Landing — file tree (dark-landing scope)

Files created or changed for this scope. Existing light-theme files
(`Hero.tsx`, `ParticleSphereHero`, `SplitTextReveal`, `Navbar`, `data/services.ts`,
`backend/`, `AGENTS.md`, `MASTER_PROMPT.md`, `Animations.md`, `PROGRESS.md`,
`docs/01–05`, `responsive-audit.md`) are retained as reference and are NOT part
of this scope.

```
src/
├── app/
│   ├── layout.tsx               (+) TransitionProvider wrapper; 700-italic font import
│   ├── globals.css              (+) .brand-dark, .halftone-dots, odometer, .split-mask
│   ├── page.tsx                 (rewrite) BrandShell > IntroController > BrandNavbar + Landing
│   ├── services/
│   │   └── [slug]/
│   │       └── page.tsx         (new) service detail route: SSG params, metadata/OG, client shell
│   └── api/
│       └── contact/
│           └── route.ts         (new) POST route: Zod + honeypot + rate limit + submission record
├── components/
│   ├── landing/
│   │   ├── BrandShell.tsx            doc-level near-black bg / white text; reverts on unmount
│   │   ├── BrandNavbar.tsx           registerElement("nav") + registerTimeline("navButton")
│   │   ├── Landing.tsx               hero assembly; scroll-exit scrub; registers subtext/cta/sphere
│   │   ├── SplitHeadline.tsx         two-line per-char reveal; reverts SplitText on master complete
│   │   ├── IntroController.tsx       single master gsap.timeline; window.__INTRO_TL__ in dev
│   │   ├── LightBeam.tsx             registerElement("beam"); dark top-left beam
│   │   ├── ParticleSphere.tsx        Three.js shader sphere; morph targets; static fallback; disposed
│   │   ├── StatsRow.tsx              odometer / count-up / fade stats
│   │   ├── CountStat.tsx             per-stat animation formats
│   │   ├── ServiceCard.tsx           dark glassy <a> card; active expand; .halftone-dots
│   │   ├── ServicesSection.tsx       pinned ScrollTrigger scrub; scroll-snap; drives particle morph
│   │   ├── TransitionProvider.tsx    ~2s click transition incl ~0.5s black; router.push
│   │   ├── ContactForm.tsx           Zod + honeypot + velocity gate; success/error states
│   │   ├── ServicePageClient.tsx     service page shell: glow background, copy, form card
│   │   ├── ServicePageGlare.tsx      CSS violet diagonal glow + dithered noise texture
│   │   └── Watermark.tsx             giant uppercase brand watermark
│   └── SmoothScrollProvider.tsx      (+) Lenis + ScrollTrigger.scrollerProxy sync
├── lib/
│   ├── landingConfig.ts           (new) single config: BRAND/INTRO/HERO_EXIT/PARTICLES/MORPH/TRANSITION/SERVICES/BREAKPOINT
│   ├── brand.ts                   (new) brand placeholders [NAME]; 4 services; stats; nav links
│   ├── splitText.ts               (new) dependency-free lines/chars split engine with revert
│   ├── morphTargets.ts            (new) sphere/square/glyph targets via offscreen canvas sampling
│   ├── registry.ts                (new) stage disposal + ScrollTrigger kill on route change
│   ├── firstFrame.ts              (new) single-shot WebGL first-frame signal
│   ├── introContext.tsx           (new) IntroController master timeline registry
│   ├── particleContext.tsx        (new) shared module-level ParticleAPI (SSR-safe)
│   └── apiClient.ts               (+) phone/countryCode fields on ContactSubmissionInput
├── hooks/
│   ├── useAppReady.ts             (new) intro gate: fonts.ready + first WebGL frame
│   └── useReducedMotion.ts        (new) live prefers-reduced-motion tracker
└── data/
    └── brand.ts                   (new) NAV_LINKS, NAV_CTA, COUNTRY_CODES, BUDGET_OPTIONS
backend/
└── src/schemas/contact.schema.ts  (+) phone / countryCode optional fields
```

Key: `(new)` = created for this scope; `(+)` = modified; `(rewrite)` = replaced.
