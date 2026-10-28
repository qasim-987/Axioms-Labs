# Axiom Studio — Design Architecture

- **Document ID**: `AXS-DES-002`
- **Platform**: **Axiom Studio** (`https://axiomstudio.agency`)
- **Color Benchmark**: `https://antigravity.google/` (Crisp `#FFFFFF` / `#F8F9FC` Daylight Surfaces + `#121317` Obsidian Primary Ink/Pills + Multicolor Antigravity Spectrum)
- **Motion Benchmark**: `https://antimatterai.agency` (Kinetic Split Text, 3D Particle Sphere, Odometer Counters & Difference-Blend Project Cursor)
- **Motion Companion Spec**: `/Animations.md`

---

## 1. Design Philosophy & Aesthetic Direction

**Axiom Studio** pairs the crisp, airy editorial color architecture of **`https://antigravity.google/`** with the signature choreographed motion mechanics of **`https://antimatterai.agency`**. Every visual decision adheres to four foundational design axioms:

1. **Crisp Daylight Surfaces (`#FFFFFF` & `#F8F9FC`)**: Pure `#FFFFFF` (`--palette-grey-0`) anchors the page canvas, alternating with cool off-white containers (`#F8F9FC`, `#EFF2F7`, `#E6EAF0`) and subtle `1px` structural outlines (`rgba(33, 34, 38, 0.08)`). Strategic `#121317` inverse dark callout cards (`.card.dark`) create dramatic visual punctuation before the clean white footer.
2. **Multicolor Antigravity Particle & Atmospheric Spectrum**: Centered 3D Fibonacci sphere particles (`THREE.NormalBlending`) and pastel atmospheric halos blend Electric Blue (`#3186FF`), Periwinkle (`#749BFF`), Coral Red (`#FC413D`), Signal Yellow (`#FBBC04`), and Vivid Green (`#00B95C`).
3. **Obsidian Ink & Pill Actions (`#121317`)**: High-impact geometric sans-serif headlines (`#121317`, `tracking-tight`, `leading-[1.08]`) and solid `#121317` primary pill buttons (`hover: #2F3034`) pair with cool slate body text (`#45474D`) and tonal secondary pills (`rgba(183, 191, 217, 0.16)`).
4. **Choreographed Physicality**: Nothing teleports. Scroll wheel input carries subtle velvet inertia (`Lenis lerp: 0.05`), numbers roll on physical `0–9` vertical strips, `100%`-width concept cards clip a `mix-blend-mode: difference` `"View Work"` cursor strictly inside each card visual, and every motion curve shares `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 2. Design Token System

### 2.1 Color Architecture (`tailwind.config.ts` & `src/app/globals.css`)

| Token Name | CSS / Tailwind Token | Hex / RGBA Value | Architectural Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Primary** | `bg-background` / `--palette-grey-0` | `#FFFFFF` | Global `<body>` background and primary page surface |
| **Surface Container** | `bg-surface-10` / `--palette-grey-10` | `#F8F9FC` | Alternating section bands & elevated tonal cards |
| **Secondary Hover** | `bg-surface-15` / `--palette-grey-15` | `#F0F1F5` | Secondary pill button hover surface |
| **Surface High** | `bg-surface-20` / `--palette-grey-20` | `#EFF2F7` | Active hover tiles & light studio showcase canvas |
| **Surface Higher** | `bg-surface-50` / `--palette-grey-50` | `#E6EAF0` | Dividers, progress tracks, screen borders |
| **Inverse Dark Card** | `bg-surface-dark` / `--palette-grey-1200` | `#121317` | Solid primary pill buttons, headlines & `.card.dark` callouts |
| **Primary Pill Hover** | `bg-ink-hover` / `--palette-grey-900` | `#2F3034` | Solid `#121317` pill hover fill |
| **Wordmark Charcoal** | `text-ink-charcoal` | `#202124` | Brand wordmark & oversized footer anchor |
| **Body Slate Ink** | `text-ink-secondary` / `--palette-grey-800` | `#45474D` | Body copy, subtitles, navigation links |
| **Muted Caption Ink** | `text-ink-muted` | `#6A6A71` | Monospace indices, timestamps, helper captions |
| **Inverse Muted Ink** | `text-surface-300` / `--palette-grey-300` | `#B2BBC5` | Muted copy inside `#121317` dark cards |
| **Secondary Pill Tint** | `--theme-secondary-button` | `rgba(183, 191, 217, 0.16)` | Secondary pill fill & nav hover tint (`0.20`) |
| **Structural Hairline** | `--theme-outline-variant` | `rgba(33, 34, 38, 0.08)` | Default section dividers and card borders |
| **Antigravity Blue** | `text-brand-primary` / `--ag-blue` | `#3186FF` | Primary brand accent, active states, sphere particles |
| **Periwinkle Blue** | `text-brand-light` / `--ag-periwinkle` | `#749BFF` | Soft highlights & dark-card accent text |
| **Coral Red** | `text-ag-red` / `--ag-red` | `#FC413D` | Spectrum accent, UI/UX icon chip & error states |
| **Signal Yellow** | `text-ag-yellow` / `--ag-yellow` | `#FBBC04` | Spectrum accent & AI Agents icon chip |
| **Vivid Green** | `text-ag-green` / `--ag-green` | `#00B95C` | Spectrum accent, verified status & live telemetry |

### 2.2 Surface, Glassmorphism & Volumetric Shader Recipes

```css
/* 1. Core Smoked Glass Card */
.glass-panel {
  background: rgba(14, 14, 18, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 2. Interactive Elevation + Specular Rim Transition */
.glass-panel-hover {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-panel-hover:hover {
  background: rgba(20, 20, 26, 0.85);
  border-color: rgba(133, 135, 227, 0.35);
  box-shadow: 0 12px 36px -10px rgba(133, 135, 227, 0.15);
  transform: translateY(-2px);
}

/* 3. Top-Down Volumetric God-Ray Cone */
.ray-conic {
  background: conic-gradient(
    from 180deg at 50% 0%,
    transparent 40deg,
    rgba(133, 135, 227, 0.18) 60deg,
    rgba(105, 106, 172, 0.28) 85deg,
    rgba(255, 255, 255, 0.35) 90deg,
    rgba(105, 106, 172, 0.28) 95deg,
    rgba(133, 135, 227, 0.18) 120deg,
    transparent 140deg
  );
  filter: blur(55px);
}
```

---

## 3. Typography & Editorial Hierarchy

Axiom Studio uses a dual-axis typographic system with OpenType stylistic sets enabled (`font-feature-settings: "cv02", "cv03", "cv04", "cv11"`):

| Role | Font Stack | Size Scale (Mobile → Desktop) | Weight & Tracking | Motion / Numeric Treatment |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero (`H1`)** | `font-sans` (`Inter` / Geist / SF Pro) | `text-4xl` (`2.25rem`) → `sm:text-6xl` (`3.75rem`) → `md:text-7xl` (`4.5rem`) | `font-extrabold` (`800`), `tracking-tight` (`-0.025em`), `leading-[1.08]` | `SplitTextReveal` (`22ms` char stagger) + gradient accent span (`from-white via-zinc-200 to-brand-primary`) |
| **Section Headline (`H2`)** | `font-sans` | `text-3xl` (`1.875rem`) → `sm:text-5xl` (`3rem`) | `font-extrabold` (`800`), `tracking-tight`, `leading-tight` | Viewport-triggered `SplitTextReveal` (`amount: 0.35`) |
| **Card / Pillar Title (`H3`)** | `font-sans` | `text-xl` (`1.25rem`) → `sm:text-2xl` (`1.5rem`) | `font-bold` (`700`), `tracking-tight` | Color shift `text-white` → `text-brand-primary` on group hover |
| **Lead / Subtitle Copy** | `font-sans` | `text-base` (`1rem`) → `md:text-xl` (`1.25rem`) | `font-normal` (`400`), `leading-relaxed` (`1.625`) | `text-zinc-400`, constrained to `max-w-2xl` (`65ch`) for optimal reading rhythm |
| **Eyebrow / Section Pill** | `font-mono` | `text-xs` (`0.75rem`, `12px`) | `font-medium`, `uppercase`, `tracking-wider` (`0.05em`) | Framed inside rounded pill `px-3 py-1 rounded-full bg-white/[0.05] border border-white/10` |
| **Odometer / KPI Metric** | `font-mono` | `text-4xl` (`2.25rem`) → `md:text-6xl` (`3.75rem`) | `font-bold` (`700`), `tracking-tight`, `tabular-nums` | Physical `0–9` vertical ribbon strip (`RollingNumber`) |
| **Telemetry / Micro-Meta** | `font-mono` | `text-[10px]`–`text-[11px]` | `font-semibold`, `uppercase`, `tracking-widest` (`0.1em`), `tabular-nums` | Used for `01–06` pillar indices, live clock, tech tags, and latency badges |

---

## 4. Layout Grid, Spatial Rhythm & Responsive Breakpoints

```mermaid
flowchart TB
    subgraph Viewport["Viewport Container (overflow-x: hidden, bg: #030303)"]
        Nav["Fixed Header Shell (z-50, max-w-7xl, px-4 sm:px-6 lg:px-8)"]
        HeroStage["Hero Stage (pt-36 md:pt-48, pb-20 md:pb-32, centered max-w-4xl + 950px LightRays)"]
        Ribbon["Partner Marquee + Horizon Light Curve (py-12, full-bleed track + 15% edge alpha masks)"]
        Stats["4-Column Odometer Bar (py-16, grid-cols-2 lg:grid-cols-4, border-y white/8)"]
        Services["6-Pillar Bento / Expandable Grid (py-24 sm:py-32, grid-cols-1 md:grid-cols-2 lg:grid-cols-3)"]
        Method["3-Pillar Deterministic Methodology (py-24, grid-cols-1 md:grid-cols-3)"]
        Cases["Split-Stage / 2-Col Case Studies (py-24 sm:py-32, 5/7 asymmetric lg:grid-cols-12)"]
        Contact["5/7 Split Contact Architecture (py-24, Info Rail + Validated Glass Form)"]
        Footer["5-Column Studio Footer + 1Hz Live Clock (pt-16 pb-12)"]
    end
    Nav --> HeroStage --> Ribbon --> Stats --> Services --> Method --> Cases --> Contact --> Footer
```

### Breakpoint System
- **Mobile (`375px – 639px`)**: Single-column card stacks (`grid-cols-1`), 2-column compact stats/trust chips (`grid-cols-2`), collapsible hamburger drawer, full-width pill CTAs (`w-full`), `px-4` (`16px`) horizontal gutters.
- **Tablet (`640px – 1023px`, `sm:` / `md:`)**: 2-column service & dossier grids (`md:grid-cols-2`), inline CTA buttons (`sm:w-auto`), `px-6` (`24px`) gutters.
- **Desktop (`1024px – 1279px`, `lg:`)**: Full desktop mega-menu bar, 3-column service matrix (`lg:grid-cols-3`), `5/7` split-stage Case Studies & Contact layouts (`lg:grid-cols-12`), sticky preview stages (`lg:sticky lg:top-28`), `px-8` (`32px`) gutters.
- **Studio Wide (`1280px – 1440px+`, `xl:`)**: Content locked cleanly to `max-w-7xl` (`1280px`) while atmospheric `LightRays` (`1400px`), `.horizon-light-curve` (`150%` width), and marquee ribbons bleed edge-to-edge.

---

## 5. Component Design Specifications & Interactive States

### 5.1 Navigation Header & Mega-Menu (`src/components/Navbar.tsx`)
- **Brand Lockup**: `32x32px` rounded-lg gradient border (`from-brand-muted via-brand-primary to-white p-[1px]`) framing `#08080a` inner square with `AX` bold monospace mark + `AXIOM STUDIO` + `6px` emerald pulsing dot.
- **Mega-Menu Panel**: `max-w-5xl` glassmorphic dropdown (`bg-[#09090d]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl`) containing a 2-column grid of the 6 service pillars + bottom bar CTA to `/work` / featured case study preview.
- **Interactive States**:
  - `Default`: `text-zinc-300 bg-transparent`
  - `Hover`: `text-white bg-white/[0.04]`
  - `Open / Active`: `text-white bg-white/[0.08]`, chevron rotated `180deg` in `text-brand-primary`
  - `Focus-Visible`: `ring-2 ring-brand-primary/50 outline-none`

### 5.2 Service Pillar Cards (`src/components/ServicesGrid.tsx`)
- **Anatomy**: Monospace index (`01`–`06`) + Discipline badge + Icon container (`p-3 rounded-xl bg-white/[0.05]`) + Title + Summary + Expandable Deliverables list (`Check` icon in `text-brand-primary`) + Bottom benchmark metric footer + `ArrowUpRight` trigger.
- **Interactive States**:
  - `Hover / Active`: Cursor-tracked `520px` radial violet spotlight (`rgba(133,135,227,0.14)`), border brightens to `border-brand-primary/50`, corner arrow translates `(+2px, -2px)`.

### 5.3 Case Study Dossier Cards & Split-Stage (`src/components/CaseStudies.tsx` & `/work`)
- **Anatomy**: Client badge + Year + Category pill (`AI Apps` / `Websites` / `Enterprise`) + Highlighted Impact Metric Banner (`bg-gradient-to-r from-brand-primary/15 via-white/[0.02] to-transparent border border-brand-primary/20`) + Title + Summary + Monospace tech stack chips + `Read Case Study` link.
- **Split-Stage Upgrade (`Animations.md` §8)**: Left `01–06` selector rail with sliding `2px` `layoutId` active indicator bar paired with right sticky preview card cross-fading with subtle `scale(1.04 -> 1.0)` and `blur(8px -> 0px)`.

### 5.4 Interactive Capability Lab Consoles (`/demos/*` & `/resources/vendor-matrix`)
- **Console Aesthetic**: Framed as live enterprise operations HUDs using high-density dark cards (`bg-[#07070a]`), uppercase monospace telemetry headers (`INFERENCE LATENCY: 18MS`, `MODEL: AXIOM SENTIMENT-V4`), interactive range sliders (`accent-brand-primary`), filter pill toggles, and color-coded status badges.

### 5.5 Validated Scoping Form (`src/components/ContactSection.tsx`)
- **Input Anatomy**: `bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600`.
- **States**:
  - `Focus`: `border-brand-primary ring-1 ring-brand-primary/50 bg-white/[0.05]`
  - `Submitting`: Disabled button with spinning loader indicator (`Submitting Parameters...`)
  - `Validation Error`: Rose alert banner (`bg-rose-500/10 border-rose-500/30 text-rose-300`)
  - `Success`: Full confirmation card state with check badge, architect 24h SLA message, and `Submit Another Inquiry` reset trigger.

---

## 6. Motion & Accessibility Integration Architecture

All visual components adhere strictly to `/Animations.md`:

| Interaction Class | Curve / Physics | Duration | Reduced-Motion Fallback (`prefers-reduced-motion: reduce`) |
| :--- | :--- | :--- | :--- |
| **Inertial Viewport Scroll** | `Lenis` (`lerp: 0.06`) | Continuous RAF | Disabled; reverts to native instant browser scroll |
| **Split-Character Headlines** | `cubic-bezier(0.16, 1, 0.3, 1)` | `720ms` + `22ms`/char | Renders plain unsplit `<Tag>{text}</Tag>` immediately at `opacity: 1` |
| **Odometer Digit Strips** | `cubic-bezier(0.16, 1, 0.3, 1)` | `1800ms` + `120ms`/col | Snaps directly to final target digit without vertical roll |
| **Mega-Menu / Stage Swap** | `cubic-bezier(0.16, 1, 0.3, 1)` / Spring (`380/32`) | `220ms – 500ms` | Instant state swap (`duration: 0.01ms`) |
| **LightRays & Marquee Loops** | `ease-in-out` / `linear infinite` | `6s – 28s` | Static ambient glow & static centered partner row |


### Responsive motion implementation (2026-10-28)
See [responsive audit](responsive-audit.md) for changed files, actual constants, validation boundaries and outstanding device QA. Frontend-only changes; backend remains independently built/deployed.
