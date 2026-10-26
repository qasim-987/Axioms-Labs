# Axiom Studio — `antimatterai.agency` Exact Animation Blueprint (`Animations.md`)

> **Purpose**: This specification reverse-engineers every signature motion system, scroll choreography, shader backdrop, micro-interaction, and interactive canvas animation from **[antimatterai.agency](https://www.antimatterai.agency)** and provides exact, drop-in implementation blueprints tailored to the **Axiom Studio** codebase (`Next.js 14 App Router`, `React 18`, `TypeScript`, `Tailwind CSS 3.4`).

---

## Table of Contents

0. [Hero 3D Particle Sphere & Cursor Dynamics Specification (Video Ground Truth)](#0-hero-3d-particle-sphere--cursor-dynamics-specification-video-ground-truth)
   - [Case study cursor](#case-study-cursor)
1. [Motion Stack & Architecture Overview](#1-motion-stack--architecture-overview)
2. [Current Axiom Studio vs. `antimatterai.agency` Parity Matrix](#2-current-axiom-studio-vs-antimatteraiagency-parity-matrix)
3. [Global Smooth Scroll & Timing Tokens (`Lenis` + `GSAP` + `Framer Motion`)](#3-global-smooth-scroll--timing-tokens-lenis--gsap--framer-motion)
4. [Animation 01 — Volumetric Light Rays, Pointer Parallax & Dust Mote Shader](#4-animation-01--volumetric-light-rays-pointer-parallax--dust-mote-shader)
5. [Animation 02 — Character-Split Kinetic Typography (`SplitTextReveal`)](#5-animation-02--character-split-kinetic-typography-splittextreveal)
6. [Animation 03 — Physical Slot-Machine / Odometer Digit Strip (`0123456789`)](#6-animation-03--physical-slot-machine--odometer-digit-strip-0123456789)
7. [Animation 04 — 6-Pillar Interactive Services Accordion & Cursor Spotlight](#7-animation-04--6-pillar-interactive-services-accordion--cursor-spotlight)
8. [Animation 05 — Synchronized Split-Stage Case Studies Showcase & 3D Card Tilt](#8-animation-05--synchronized-split-stage-case-studies-showcase--3d-card-tilt)
9. [Animation 06 — Horizon Light-Curve Arc (`clientsLightCurve`) & Dual-Fade Marquee](#9-animation-06--horizon-light-curve-arc-clientslightcurve--dual-fade-marquee)
10. [Animation 07 — Glassmorphic Scroll-Morph Navbar & Spring Mega-Menu](#10-animation-07--glassmorphic-scroll-morph-navbar--spring-mega-menu)
11. [Animation 08 — Subpage, Canvas Scrub & Interactive Lab Choreographies](#11-animation-08--subpage-canvas-scrub--interactive-lab-choreographies)
12. [GPU Performance Budget & `prefers-reduced-motion` Compliance](#12-gpu-performance-budget--prefers-reduced-motion-compliance)
13. [Step-by-Step File Integration Checklist for Axiom Studio](#13-step-by-step-file-integration-checklist-for-axiom-studio)

---

## 0. Hero 3D Particle Sphere & Cursor Dynamics Specification (Video Ground Truth)

The hero section recreates the exact visual identity, atmospheric volumetric lighting, and interactive 3D particle sphere demonstrated in the reference footage.

### 0.1 Scene Architecture & Visual Hierarchy (Back to Front)

1. **Backdrop (`#020108` to `#000000`)**: Deep obsidian canvas, near-black space.
2. **Ghost Watermark (`AXIOM STUDIO`)**: Huge uppercase brand typography (~40vh height), spanning wider than the viewport and cropped at both screen edges, rendered in static white at 3.5% opacity (`text-white/[0.035]`).
3. **Top-Left Light Beam / Spotlight (`LightBeam.tsx`)**: Volumetric glow originating from the top-left corner, angled diagonally down-right (~32°), fading to black by ~45% viewport width. Built with a conic gradient (`core: #4b3fd6` at ~68% opacity, fading outward to `#6e5ff0` and transparent) filtered with `blur(140px)` and blended via `mix-blend-mode: screen`. Pulses with a slow breathing loop (opacity 0.85 to 1.0, 7s cycle).
4. **Hollow 3D Particle Sphere (`ParticleSphereHero.tsx`)**: Positioned at $x \approx 39\%$ of viewport width, $y \approx 45\%$ of hero height (diameter $\approx 320\text{px}$ on 1884px desktop). Semi-transparent shell with visible back particles and faint violet inner core glow.
5. **Foreground Typography & UI**:
   - **Headline**: Light geometric sans (Plus Jakarta Sans), 56–68px:
     - Line 1: `Building ` (*light*) + `Digital` (*bold italic*)
     - Line 2: `Solutions` (*bold italic*) + ` That Matter` (*light*), indented ~170px to the right.
   - **Subtext**: Bottom-left, 16px, white at ~85% opacity: *"We empower organizations with AI that turns complex challenges into real-world outcomes."*
   - **Primary CTA**: Rounded pill button with lavender-violet gradient (`#6b5fd6` to `#8a7ff0`), soft outer glow (`box-shadow: 0 0 28px rgba(107, 95, 214, 0.55)`), white text *"Start Your Project"*.
   - **Stats Row**: Bottom-right, horizontal row with `50+ Projects Delivered`, `100% Client Satisfaction`, `24/7 Support Available` (32px bold numbers with 2-line labels).
   - **Floating Chat Badge**: Bottom-right circular badge with glowing gradient avatar and sparkles.

---

### 0.2 Particle Sphere Tunable Constants

| Constant Name | Value | Purpose / Description |
| :--- | :--- | :--- |
| `PARTICLE_COUNT` | `7,600` (desktop) / `3,800` (mobile) | Total points distributed on hollow sphere surface |
| `SPHERE_POSITION_X` | `0.39` (desktop) / `0.50` (mobile) | Center X coordinate as ratio of viewport width |
| `SPHERE_POSITION_Y` | `0.45` (desktop) / `0.42` (mobile) | Center Y coordinate as ratio of viewport height |
| `SPHERE_RADIUS_RATIO`| `0.17` (desktop) / `0.35` (mobile) | Sphere radius relative to viewport width (~320px diameter on 1884px) |
| `BASE_COLOR` | `#dfe3ff` (`rgb(223, 227, 255)`) | Cool white resting particle tint |
| `TINT_COLOR` | `#8f7fff` to `#a99bff` (`rgb(143, 127, 255)`) | Bright violet-blue attraction & clump tint |
| `CORE_GLOW_COLOR` | `#5a4fd0` (`rgba(90, 79, 208, 0.26)`) | Faint violet radial core glow at center of sphere |
| `INFLUENCE_RADIUS` | `118px` (desktop) | Cursor influence radius in screen pixels (range: 90–130px) |
| `SPRING_STIFFNESS` | `0.078` | Damped spring return stiffness (0.06 – 0.10) |
| `SPRING_DAMPING` | `0.88` | Damped spring velocity damping (0.85 – 0.90) |
| `ROTATION_SPEED_Y` | `0.095 rad/s` | Continuous idle rotation around Y axis |
| `ROTATION_TILT_X` | `0.15 rad` | Fixed slight forward tilt on X axis |
| `MOUSE_LERP_FACTOR`| `0.12` | Fluid cursor velocity smoothing factor |
| `POINT_SIZE` | `1.3px - 2.5px` (depth) up to `4.5px` (near cursor) | Base dot size with depth attenuation and proximity bloom |

---

### 0.3 Mathematical & Physics Formulations

1. **Fibonacci Sphere Distribution**:
   Points are uniformly placed on a sphere surface using the golden angle $\phi = \pi (3 - \sqrt{5}) \approx 2.399963\text{ rad}$:
   $$y_i = 1 - \frac{2i}{N - 1}, \quad r_i = \sqrt{1 - y_i^2}, \quad \theta_i = i \cdot \phi$$
   $$x_i = r_i \cos(\theta_i) \cdot (1 + \delta_i), \quad z_i = r_i \sin(\theta_i) \cdot (1 + \delta_i)$$
   where $\delta_i \in [-0.025, +0.025]$ is organic radial jitter.

2. **Screen-Space Projection**:
   Local particle coordinates are rotated by $R_x(0.15) R_y(\omega t)$, translated into world coordinates $W_i$, and projected to screen pixel space $(S_{x, i}, S_{y, i})$ via the camera projection matrix.

3. **Cursor Attraction & Swirling Clump Dynamics**:
   For each particle with screen distance $d = \|S_i - M_\text{lerp}\| < R_\text{influence}$:
   $$\text{falloff} = \exp\left(-\frac{d}{42}\right) \left(1 - \frac{d}{R}\right)$$
   $$\vec{u}_\text{pull} = \left(\vec{u}_\text{dir} (0.85 + \text{jitter}) + \vec{u}_\text{tangent} \cdot \omega_\text{swirl}\right) \cdot \text{falloff} \cdot 70\text{px}$$
   This vector is unprojected into the sphere's local coordinate frame, imparting an attractive force on the particle's velocity vector $\vec{v}_i$.

4. **Damped Spring Relaxation**:
   Every frame, particles experience a Hookean restoring force proportional to displacement:
   $$\vec{F}_\text{spring} = -k \cdot \vec{d}_i, \quad \vec{v}_i \leftarrow (\vec{v}_i + \vec{F}_\text{spring}) \cdot c_\text{damping}, \quad \vec{d}_i \leftarrow \vec{d}_i + \vec{v}_i$$
   When the cursor leaves, displaced streaks and clusters relax back to their home positions over 0.8–1.2s, while color lerps from `#8f7fff` back to `#dfe3ff`.

---

## Case study cursor

The Case Study section (`src/components/CaseStudies.tsx` + `src/components/ViewWorkCursor.tsx`) reproduces the `"View Work"` magnetic difference-blend cursor follower and 50/50 device showcase from the 17-second reference footage (`1884×754`), branded for **Axiom Studio** using Axiom Studio's own project cards (*Strata Systems* `/work/strata-systems` and *Zenith Health* `/work/zenith-health`).

#### 1. Visual Hierarchy & 50/50 Layout
- **Backdrop**: Pure black (`#000000`) with a thin `1px` top divider line (`border-t border-white/15`) and top/bottom studio padding.
- **Two Project Columns (50/50 Grid)**: `24px` column gap (`grid grid-cols-1 md:grid-cols-2 gap-6`).
- **Index Labels**: Lightweight `20px` (`font-light`) white labels `"01"` and `"02"` positioned directly above each card.
- **Card 01 (Left — Dark Card `#000000` -> `/work/strata-systems`)**: Perspective-angled dark display frame with warm copper/amber volumetric studio lighting and sculpted obsidian telemetry hardware unit (`STRATA•OS` — *"Autonomous Mesh for Modern Cloud Supervision."* + `10:15` readout), cropped cleanly at the bottom edge of the card.
- **Card 02 (Right — Light Gray `#e8e8e8` Card -> `/work/zenith-health`)**: Brushed silver aluminum desktop iMac mockup on `#e8e8e8` light studio gray with a dark top web navbar (`ZENITH`) and clinical diagnostics robotics scene (*"Creating the New Standard for Autonomous Clinical AI & Diagnostics."*), cropped cleanly at the bottom of the stand.
- **Tool / Software Badge**: `26px × 26px` `"Ps"` badge (`#001e36` fill, `#31a8ff` text) at top-left of each card under `"01"` / `"02"`. Fades in over `200ms` (`duration-200 ease-out`) **only** while that card is hovered and fades out on leave.
- **Real Anchors, Native Cursor & Accessibility**: Real `<Link href="...">` (`<a>`) anchors retain the native pointing-hand cursor (`cursor-pointer`), browser bottom-left URL preview, visible keyboard `focus-visible:ring-2` focus ring, and visually-hidden `<span className="sr-only">View Work — ...</span>` labels; the cursor follower is `aria-hidden="true"`.

---

#### 2. Final Tuned Constants (`ViewWorkCursor.tsx`)

| Constant | Final Tuned Value | Description / Behavior |
| :--- | :--- | :--- |
| `DIAMETER` | `clamp(100px, 10.1vw, 190px)` | `190px` at `1884px` desktop width; scales down to `100px` on compact laptops |
| `CIRCLE_FILL` | `#ffffff` (`mix-blend-mode: difference`) | Pure white over `#000` dark areas; dark `#171717` over `#e8e8e8` light areas; sharp split inversion across mixed edges |
| `LABEL_STYLE` | `"View Work"`, `clamp(13px, 0.85vw, 16px)`, `400` regular, `#000000`, `nowrap` | Upright centered label inside the difference-blended circle (`|B - 0| = B`: black text on white circle, `#e8e8e8` text on dark circle) |
| `LERP_FACTOR_60FPS` | `0.15` (`1 - (1 - 0.15)^(dt * 60)`) | Frame-rate-independent smoothing (~`0.5s` `power3.out` feel); visibly lags fast pointer motion and catches up smoothly with zero jitter |
| `ENTER_INITIAL_SCALE` | `0.15` | Starts as a small grayish dot (`~50%` scale & `~60%` opacity mid-grow) at exact pointer entry coordinates (`clientX, clientY`) |
| `ENTER_DURATION_MS` | `450ms` | Exact `cubic-bezier(0.22, 1, 0.36, 1)` (`power3.out` equivalent) scale `0.15 -> 1.0` & opacity `0.08 -> 1.0` |
| `TEXT_FADE_DELAY_MS` | `150ms` (`+ 200ms` fade) | Delayed fade-in of `"View Work"` label after card entry |
| `LEAVE_DURATION_MS` | `300ms` | Exact `power3.in` (`t³`) shrink-out to `scale(0)` and `opacity: 0` on `pointerleave` |
| `GAP_DIP_MAX_SCALE` | `0.22` | Ensures crossing the `24px` gap between Card `01` and Card `02` visibly shrinks and re-grows even on a fast swipe |
| `MAX_SQUASH_STRETCH` | `0.08` (`max 8%`) | Velocity-proportional elongation (`scaleX = 1 + stretch`, `scaleY = 1 - 0.85 * stretch`) applied strictly to the circle so label text never shears |
| `CARD_HOVER_SCALE` | `1.015` over `600ms` (`ease-out`) | Subtle card artwork breathing without distracting from the cursor star effect |
| `TOOL_BADGE_FADE` | `200ms` (`ease-out`) | Hover-only `"Ps"` software icon opacity transition |
| `REDUCED_MOTION` | `0` lag, `0` squash, `160ms` opacity fade | Respects `(prefers-reduced-motion: reduce)` and hides completely on coarse/touch devices without `(hover: hover) and (pointer: fine)` |

---

#### 3. Optical Inversion Mathematics (`mix-blend-mode: difference`)
In RGB color space, difference blending computes $C_\text{result} = |C_\text{backdrop} - C_\text{source}|$:
- **Over Black Card ($C_\text{backdrop} = 0$)**:
  - Circle: $|0 - 255| = 255$ $\rightarrow$ Bright solid white circle.
  - Text ($C_\text{source} = 0$): $|0 - 0| = 0$ $\rightarrow$ Crisp black text on white circle.
- **Over Light Gray Card ($C_\text{backdrop} = 232$)**:
  - Circle: $|232 - 255| = 23$ $\rightarrow$ Dark obsidian circle.
  - Text ($C_\text{source} = 0$): $|232 - 0| = 232$ $\rightarrow$ Light gray text on dark circle.
- **Over Mixed Mockup Elements**:
  - Automatically splits the circle across the edge, inverting light and dark areas symmetrically with perfect legibility everywhere.

---

## 1. Motion Stack & Architecture Overview

Inspection of `antimatterai.agency` (including its official studio template architecture and case study engineering specifications) confirms a four-layer motion stack running on Next.js + Tailwind CSS:

| Layer | Library / API | Role on `antimatterai.agency` | Target Usage in **Axiom Studio** |
| :--- | :--- | :--- | :--- |
| **Inertial Scroll** | `lenis` (`@studio-freight/lenis` / `lenis`) | Smooths wheel & trackpad velocity (`lerp: 0.05–0.07`) for keynote-grade weight and zero scroll jitter. | Wrap `src/app/layout.tsx` children in `<SmoothScrollProvider>`. |
| **Scroll Scrubbing & Pinning** | `gsap` + `gsap/ScrollTrigger` | Scrubs pinned timelines, section progress bars, and `<canvas>` frame sequences tied to exact scroll progress. | Used in Case Study showcases, `/services/[slug]` roadmaps, and pinned reveals. |
| **Component & Layout Transitions** | `framer-motion` | Drives character-staggered headlines, layout FLIP expansion on Services cards, `AnimatePresence` mega-menus, and magnetic CTAs. | Used in `SplitTextReveal`, `Navbar`, `ServicesGrid`, `CaseStudies`, and `Footer`. |
| **Atmospheric Shaders & 3D** | HTML5 `<canvas>` / `three` (`@react-three/fiber`) + CSS Conic Shaders | Renders top-down volumetric light cones, ambient floating dust particles, horizon light curves, and the 3D orbital threat globe. | Used in `LightRays.tsx`, `LogoStrip.tsx`, and `/demos/threat-monitor`. |

### Required Dependencies Installation

```bash
npm install framer-motion gsap lenis
# Optional (only if upgrading /demos/threat-monitor to WebGL 3D orbital globe):
npm install three @types/three
```

---

## 2. Current Axiom Studio vs. `antimatterai.agency` Parity Matrix

| Section / Component | Current `Axiom Studio` Implementation | Exact `antimatterai.agency` Behavior | Upgrade Action |
| :--- | :--- | :--- | :--- |
| **Viewport Scroll** | Native CSS `scroll-behavior: smooth` | `Lenis` inertial scrolling (`lerp: 0.06`) synced to `GSAP ScrollTrigger` | Add `src/components/SmoothScrollProvider.tsx` |
| **Hero & Section Headings** (`Hero.tsx`, `/work`, `/contact`, `Footer`) | Static `<h1>` / `<h2>` with basic fade | Every character wrapped in individual `<span>` (`B u i l d i n g ...`) with staggered 3D `rotateX` + `translateY` + `blur` reveal | Create `src/components/SplitTextReveal.tsx` and apply to Hero, Section Titles, and Footer CTA |
| **Light Rays (`LightRays.tsx`)** | Static CSS `.ray-conic` with 6s opacity pulse | Layered volumetric light cone + slow angular sweep + mouse-parallax drift + rising canvas dust motes | Upgrade `src/components/LightRays.tsx` + `globals.css` |
| **Stats Counters (`RollingNumber.tsx`)** | JS numeric interpolation (`Math.floor`) | Physical vertical odometer strip (`0 1 2 3 4 5 6 7 8 9` stacked per digit column) translating `translateY(-d * 10%)` | Upgrade `src/components/RollingNumber.tsx` to true slot-machine column physics |
| **Services (`ServicesGrid.tsx`)** | Static 6-card grid with `hover:-translate-y-1` | Interactive `01–06` cards with collapsed/expanded detail reveal, staggered sub-service bullets, `Tools` row, and radial mouse spotlight | Upgrade `src/components/ServicesGrid.tsx` with Framer Motion `layout` + cursor spotlight |
| **Case Studies (`CaseStudies.tsx`)** | Static 2x2 dossier grid | Split-stage interactive selector (`01–06` numbered rail) cross-fading & scaling synchronized high-res visual previews | Upgrade `src/components/CaseStudies.tsx` with `AnimatePresence` stage + hover/scroll sync |
| **Trusted Partners (`LogoStrip.tsx`)** | Flat marquee with side solid gradients | Curved glowing planetary horizon arc (`clientsLightCurve`) + dual alpha-mask fade (`mask-image`) + hover timeScale deceleration | Upgrade `src/components/LogoStrip.tsx` with horizon glow arc & CSS mask |
| **Header Mega-Menu (`Navbar.tsx`)** | Instant conditional render (`{megaMenuOpen && ...}`) | Spring-animated `AnimatePresence` panel (`y: -8 -> 0, scale: 0.98 -> 1`) + `OUR LATEST WORK` live preview card | Upgrade `src/components/Navbar.tsx` |
| **Footer CTA & Clock (`Footer.tsx`)** | 24h clock + static heading | Split-character `powerful digital realities.` reveal + magnetic `Let's work together` pill + 12h/24h live `tabular-nums` studio clock | Upgrade `src/components/Footer.tsx` |

---

## 3. Global Smooth Scroll & Timing Tokens (`Lenis` + `GSAP` + `Framer Motion`)

### 3.1 Master Motion Design Tokens

All animations on `antimatterai.agency` share a cohesive set of mathematical curves so nothing feels disconnected or bouncy:

```ts
// src/lib/motionTokens.ts
export const MOTION_EASE = {
  // Signature Antimatter cinematic ease-out (fast impulse, long velvet settle)
  cinematicOut: [0.16, 1, 0.3, 1] as const,
  // Odometer / slot-machine digit strip deceleration
  odometer: [0.22, 1, 0.36, 1] as const,
  // Subtle symmetric transition for ambient loops
  ambientInOut: [0.45, 0, 0.55, 1] as const,
};

export const MOTION_SPRING = {
  // Mega-menu, pill hover, and interactive card layout morphs
  snappy: { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.8 },
  // Magnetic CTA button pull & release
  magnetic: { type: "spring" as const, stiffness: 180, damping: 18, mass: 0.4 },
};

export const STAGGER = {
  char: 0.022,      // 22ms per character on H1/H2 kinetic reveals
  word: 0.055,      // 55ms per word on subtitles
  card: 0.08,       // 80ms between grid cards entering viewport
  digitCol: 0.12,   // 120ms between adjacent odometer digit columns
};
```

### 3.2 Inertial Smooth Scroll Provider (`src/components/SmoothScrollProvider.tsx`)

On `antimatterai.agency`, scrolling uses `Lenis` with low linear interpolation (`lerp: 0.06`) synchronized frame-for-frame with `GSAP ScrollTrigger` so pinned elements never jitter:

```tsx
"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.06, // Signature heavy-velvet inertia from antimatterai.agency
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## 4. Animation 01 — Volumetric Light Rays, Pointer Parallax & Dust Mote Shader

### How It Works on `antimatterai.agency`
1. **Top-Origin Volumetric Cone**: A wide, soft-feathered volumetric light ray burst (`LightRays`) emanates from `(50%, -10%)` at the top edge of the viewport, bathing the Hero eyebrow badge and split-character headline in cold white core light (`rgba(255,255,255,0.38)`) transitioning outward into indigo/violet (`#8587e3` / `#696aac`).
2. **Slow Atmospheric Breathing & Sweep**: Dual counter-rotating conic layers oscillate gently (`-4deg ↔ +4deg` over `12s`) while pulsing opacity (`0.52 ↔ 0.82` over `7s`), creating the illusion of live volumetric god-rays rather than a dead static PNG.
3. **Lerped Pointer Parallax**: Moving the cursor horizontally shifts the ray origin subtly (`±24px`) with a `0.05` damping factor via `requestAnimationFrame`.
4. **Floating Atmospheric Dust Field**: Ultra-fine sub-2px particles drift upward inside the light beam and fade out at the edges (`mix-blend-mode: screen`).

### Drop-In Upgrade for `src/components/LightRays.tsx`

```tsx
"use client";

import React, { useEffect, useRef } from "react";

export default function LightRays() {
  const beamWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // 1. Lerped Mouse Parallax on Volumetric Cone
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * 32;
      targetY = ny * 16;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 2. Subtle Atmospheric Dust Motes inside Light Cone
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.4,
      vy: -(Math.random() * 0.00035 + 0.00012),
      vx: (Math.random() - 0.5) * 0.00018,
      alpha: Math.random() * 0.45 + 0.1,
    }));

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = 950;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      if (beamWrapRef.current) {
        beamWrapRef.current.style.transform = `translate3d(${currentX.toFixed(
          2
        )}px, ${currentY.toFixed(2)}px, 0)`;
      }

      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < 0) {
            p.y = 1;
            p.x = 0.25 + Math.random() * 0.5;
          }
          // Concentrate visibility inside central volumetric cone
          const distFromCenter = Math.abs(p.x - 0.5) * 2;
          const coneMask = Math.max(0, 1 - distFromCenter * 1.4) * (1 - p.y * 0.7);
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(195, 196, 247, ${(p.alpha * coneMask).toFixed(3)})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden h-[950px] select-none"
    >
      {/* Interactive Parallax Volumetric Layer */}
      <div
        ref={beamWrapRef}
        className="relative w-full h-full flex justify-center will-change-transform"
      >
        {/* Top Source Core Flare */}
        <div className="absolute -top-36 h-[420px] w-[760px] rounded-full bg-gradient-to-b from-white/25 via-brand-primary/25 to-transparent blur-3xl opacity-85" />

        {/* Primary God-Ray Conic Fan */}
        <div
          className="ray-conic animate-pulse-glow"
          style={{ transformOrigin: "50% 0%" }}
        />

        {/* Secondary Counter-Sweeping Ray Striations */}
        <div
          className="ray-striations animate-beam-sweep"
          style={{ transformOrigin: "50% 0%" }}
        />

        {/* Radial Soft Core */}
        <div className="ray-glow" />
      </div>

      {/* Atmospheric Dust Motes Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-screen opacity-75"
      />

      {/* Precision Micro-Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.45) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Seamless Vignette into #030303 */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#030303] via-[#030303]/85 to-transparent" />
    </div>
  );
}
```

Add `.ray-striations` to `src/app/globals.css`:

```css
.ray-striations {
  position: absolute;
  top: -180px;
  left: 50%;
  margin-left: -700px;
  width: 1400px;
  height: 920px;
  background: repeating-conic-gradient(
    from 150deg at 50% 0%,
    transparent 0deg,
    rgba(195, 196, 247, 0.09) 3.5deg,
    transparent 7deg,
    rgba(133, 135, 227, 0.12) 11deg,
    transparent 15deg
  );
  mask-image: radial-gradient(ellipse 55% 75% at 50% 0%, black 15%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 55% 75% at 50% 0%, black 15%, transparent 75%);
  filter: blur(18px);
  mix-blend-mode: screen;
}
```

---

## 5. Animation 02 — Character-Split Kinetic Typography (`SplitTextReveal`)

### How It Works on `antimatterai.agency`
DOM inspection of `antimatterai.agency` reveals that primary display headlines split every character into individual inline-block spans:
- **Hero H1**: `B u i l d i n g   D i g i t a l   S o l u t i o n s   T h a t   M a t t e r`
- **Work Page H1**: `W O R K`
- **Contact Page H1**: `L e t ' s   C o n n e c t`
- **Footer Closing CTA**: `We turn bold ideas into p o w e r f u l d i g i t a l r e a l i t i e s.`
- **Section Headers**: `OurServices`, `CaseStudies`, `TrustedbyIndustryLeaders`

Each character starts slightly below its baseline (`y: "65%"`), tilted backward in 3D space (`rotateX: -38deg`), soft-blurred (`blur(6px)`), and transparent (`opacity: 0`), then settles cleanly into place with a `22ms` (`0.022s`) per-character stagger along `[0.16, 1, 0.3, 1]`.

### Reusable Component (`src/components/SplitTextReveal.tsx`)

```tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTION_EASE, STAGGER } from "@/lib/motionTokens";

interface SplitTextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  triggerOnLoad?: boolean; // true for Hero H1, false (scroll-triggered) for section H2s
}

export default function SplitTextReveal({
  text,
  as: Tag = "h2",
  className = "",
  charClassName = "",
  delay = 0,
  stagger = STAGGER.char,
  triggerOnLoad = false,
}: SplitTextRevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <Tag
      aria-label={text}
      className={`${className} [perspective:800px]`}
    >
      <motion.span
        aria-hidden="true"
        initial="hidden"
        {...(triggerOnLoad
          ? { animate: "visible" }
          : { whileInView: "visible", viewport: { once: true, amount: 0.35 } })}
        className="inline"
      >
        {words.map((word, wIdx) => (
          <span
            key={wIdx}
            className="inline-block whitespace-nowrap mr-[0.26em] last:mr-0"
          >
            {Array.from(word).map((char, cIdx) => {
              const charDelay = delay + globalCharIndex * stagger;
              globalCharIndex += 1;

              return (
                <motion.span
                  key={cIdx}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: "62%",
                      rotateX: -38,
                      filter: "blur(6px)",
                    },
                    visible: {
                      opacity: 1,
                      y: "0%",
                      rotateX: 0,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.72,
                        delay: charDelay,
                        ease: MOTION_EASE.cinematicOut,
                      },
                    },
                  }}
                  className={`inline-block will-change-transform origin-bottom ${charClassName}`}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
```

### Hero Entry Choreography Timeline (`Hero.tsx`)
To match `antimatterai.agency`'s exact opening sequence on page load:
1. **`0ms` — `LightRays` backdrop fades up** (`opacity: 0 -> 1`, `1100ms`).
2. **`100ms` — Eyebrow Studio Badge** (`opacity: 0, y: 12 -> opacity: 1, y: 0`, `600ms`).
3. **`180ms` — H1 `SplitTextReveal`** (`triggerOnLoad={true}`, `22ms` char stagger across the full headline).
4. **`680ms` — Subtitle paragraph** (`opacity: 0, y: 16 -> opacity: 1, y: 0`, `750ms`, ease `[0.16, 1, 0.3, 1]`).
5. **`820ms` — Dual CTA Pills** (`opacity: 0, y: 14, scale: 0.97 -> 1`, staggered `80ms`).
6. **`960ms` — 4 Spec / Metrics Strip Cards** (`staggerChildren: 0.07s`).

---

## 6. Animation 03 — Physical Slot-Machine / Odometer Digit Strip (`0123456789`)

### How It Works on `antimatterai.agency`
In `antimatterai.agency`'s DOM, the stats bar renders literal vertical digit strips:
- `0123456789  0123456789  +` (`Projects Delivered`)
- `0123456789  0123456789  0123456789  %` (`Client Satisfaction`)
- `24/7` (`Support Available` — static precision badge)

Instead of swapping text numbers in state (which causes character-width micro-jitter and lacks vertical motion blur), **every digit column renders a 10-row vertical ribbon (`0` through `9`)** inside a `1em`-tall `overflow-hidden` viewport window, and smoothly translates `translateY(-${digit * 10}%)`!

### Drop-In Replacement for `src/components/RollingNumber.tsx`

```tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

interface RollingNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function RollingNumber({
  value,
  duration = 1800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: RollingNumberProps) {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const formattedString =
    decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toString();
  const characters = Array.from(formattedString);

  let digitColumnIndex = 0;

  return (
    <span
      ref={containerRef}
      aria-label={`${prefix}${formattedString}${suffix}`}
      className={`inline-flex items-baseline tabular-nums font-mono tracking-tight leading-none ${className}`}
    >
      {prefix && <span aria-hidden="true">{prefix}</span>}

      {characters.map((ch, idx) => {
        const numericDigit = Number.parseInt(ch, 10);
        if (Number.isNaN(numericDigit)) {
          // Decimal point or comma separator
          return (
            <span key={idx} aria-hidden="true" className="inline-block px-[0.02em]">
              {ch}
            </span>
          );
        }

        const colDelay = digitColumnIndex * 120; // 120ms stagger per digit column
        digitColumnIndex += 1;

        return (
          <span
            key={idx}
            aria-hidden="true"
            className="relative inline-block h-[1em] overflow-hidden align-baseline"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          >
            <span
              className="flex flex-col will-change-transform"
              style={{
                transform: inView
                  ? `translate3d(0, -${numericDigit * 10}%, 0)`
                  : "translate3d(0, 0%, 0)",
                transitionProperty: "transform",
                transitionDuration: `${duration}ms`,
                transitionDelay: `${colDelay}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {DIGITS.map((d) => (
                <span
                  key={d}
                  className="h-[1em] flex items-center justify-center select-none"
                >
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}

      {suffix && (
        <span
          aria-hidden="true"
          className="ml-0.5 transition-opacity duration-700"
          style={{ opacity: inView ? 1 : 0.35 }}
        >
          {suffix}
        </span>
      )}
    </span>
  );
}
```

---

## 7. Animation 04 — 6-Pillar Interactive Services Accordion & Cursor Spotlight

### How It Works on `antimatterai.agency`
On `antimatterai.agency`, the **Our Services** section (`01 UI/UX Design` through `06 Healthcare Apps`) combines three simultaneous micro-interactions:
1. **Indexed Header Morph (`01`–`06`)**: Each service card displays its zero-padded monospace index (`01`..`06`) and title. Hovering (on desktop) or tapping (on mobile/tablet) smoothly expands/activates that pillar using FLIP / CSS Grid `0fr -> 1fr` height interpolation (`420ms cubic-bezier(0.16, 1, 0.3, 1)`), revealing:
   - Expanded summary copy
   - **Services**: 4 sub-capabilities staggering upward (`y: 8px -> 0px`, `40ms` stagger)
   - **Tools**: Interactive tool stack pills (`Figma`, `Next.js`, `Three.js`, `PyTorch`, etc.)
2. **Cursor-Tracked Radial Spotlight**: Moving the pointer across any `.spotlight-card` updates `--mouse-x` and `--mouse-y` CSS variables, rendering a subtle `500px` violet radial glow (`rgba(133, 135, 227, 0.13)`) along the glass border and inner surface.
3. **Diagonal Arrow Launch**: The corner `ArrowUpRight` icon translates `(+3px, -3px)` while its circular glass badge brightens from `bg-white/[0.04]` to `bg-brand-primary text-white`.

### Drop-In Spotlight & Expandable Card Pattern (`src/components/ServicesGrid.tsx`)

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { servicesData } from "@/data/services";
import { ArrowUpRight, Check } from "lucide-react";
import { MOTION_EASE } from "@/lib/motionTokens";

export function ServiceInteractiveCard({
  service,
  index,
  isActive,
  onActivate,
}: {
  service: (typeof servicesData)[number];
  index: number;
  isActive: boolean;
  onActivate: () => void;
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.65,
        delay: index * 0.07,
        ease: MOTION_EASE.cinematicOut,
      }}
      style={
        {
          "--mouse-x": `${coords.x}px`,
          "--mouse-y": `${coords.y}px`,
        } as React.CSSProperties
      }
      className={`group relative overflow-hidden rounded-2xl glass-panel p-7 transition-colors duration-300 ${
        isActive
          ? "border-brand-primary/50 bg-[#0d0d14]/90 shadow-2xl shadow-brand-primary/10"
          : "border-white/[0.08] hover:border-brand-primary/35"
      }`}
    >
      {/* Pointer-Tracked Radial Glass Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(520px circle at var(--mouse-x) var(--mouse-y), rgba(133, 135, 227, 0.14), transparent 45%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Top Index Row: 01 ... Arrow */}
          <div className="flex items-center justify-between mb-5">
            <span className="font-mono text-sm font-bold tracking-widest text-brand-primary">
              {formattedIndex}
            </span>
            <Link
              href={`/services/${service.slug}`}
              aria-label={`Explore ${service.title}`}
              className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-white transition-all duration-300"
            >
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Service Pillar Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 group-hover:text-brand-light transition-colors">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed mb-5">
            {service.shortDesc}
          </p>

          {/* Smooth Zero-Jank CSS Grid Accordion for Sub-Services & Tools */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-65 lg:grid-rows-[1fr] lg:opacity-100"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pt-4 border-t border-white/[0.07] space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                  Services
                </div>
                {service.deliverables.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-zinc-300"
                  >
                    <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    <span className="line-clamp-1">
                      {typeof item === "string" ? item : item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Benchmark / Deep Link */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">{service.metrics}</span>
          <Link
            href={`/services/${service.slug}`}
            className="text-brand-primary group-hover:text-white transition-colors font-semibold"
          >
            Explore →
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
```

---

## 8. Animation 05 — Synchronized Split-Stage Case Studies Showcase & 3D Card Tilt

### How It Works on `antimatterai.agency`
In `antimatterai.agency`'s **Case Studies** section:
- **Left Column (Interactive Index Rail)**: Displays numbered items `01` through `06` (`01 Strata Systems`, `02 Zenith Health AI`, etc.) with discipline tags (`AI Development`, `Web Development`, `UI/UX Design`). Hovering or clicking an item illuminates a vertical indigo accent bar (`layoutId="activeCaseBar"`) and shifts the row `translateX(6px)`.
- **Right Column (Sticky Visual Stage)**: Cross-fades and scale-settles (`scale: 1.05 -> 1.0`, `opacity: 0 -> 1`, `filter: blur(8px) -> blur(0px)` over `550ms cubic-bezier(0.16, 1, 0.3, 1)`) the corresponding project architecture dossier preview card!
- **On `/work` Portfolio Cards**: Mouse movement applies a subtle 3D perspective tilt (`rotateX` and `rotateY` clamped to `±4deg` with `perspective(1000px)`), settling smoothly back to `(0deg, 0deg)` on `mouseleave`.

### Split-Stage Showcase Pattern (`src/components/CaseStudies.tsx`)

```tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { caseStudiesData } from "@/data/caseStudies";
import { ArrowUpRight, Layers, TrendingUp } from "lucide-react";
import { MOTION_EASE, MOTION_SPRING } from "@/lib/motionTokens";

export default function CaseStudiesSplitStage() {
  const featured = caseStudiesData.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStudy = featured[activeIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Interactive 01-06 Index Rail */}
      <div className="lg:col-span-5 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {featured.map((study, idx) => {
          const isSelected = idx === activeIndex;
          const num = String(idx + 1).padStart(2, "0");

          return (
            <button
              key={study.id}
              type="button"
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              onClick={() => setActiveIndex(idx)}
              className="relative w-full text-left py-5 px-4 transition-colors hover:bg-white/[0.02] group"
            >
              {isSelected && (
                <motion.span
                  layoutId="activeCaseIndicator"
                  transition={MOTION_SPRING.snappy}
                  className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-primary shadow-[0_0_12px_rgba(133,135,227,0.8)]"
                />
              )}
              <div
                className={`flex items-start justify-between gap-4 transition-transform duration-300 ${
                  isSelected ? "translate-x-2" : "group-hover:translate-x-1"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-brand-primary">
                      {num}
                    </span>
                    <span
                      className={`text-lg font-bold tracking-tight transition-colors ${
                        isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    >
                      {study.client}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-7">
                    <span className="text-[11px] font-mono text-zinc-500">
                      {study.category}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {study.techStack.slice(0, 2).join(" / ")}
                    </span>
                  </div>
                </div>
                <ArrowUpRight
                  className={`w-4 h-4 shrink-0 mt-1 transition-all duration-300 ${
                    isSelected
                      ? "text-brand-primary translate-x-0.5 -translate-y-0.5"
                      : "text-zinc-600"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Synchronized Visual Stage */}
      <div className="lg:col-span-7 lg:sticky lg:top-28">
        <div className="relative rounded-3xl glass-panel border border-white/10 p-8 sm:p-10 overflow-hidden min-h-[420px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStudy.id}
              initial={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: MOTION_EASE.cinematicOut }}
              className="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-light">
                    {activeStudy.client} • {activeStudy.year}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">
                    {activeStudy.duration}
                  </span>
                </div>

                {/* Verified Impact Callout */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-primary/20 via-brand-muted/10 to-transparent border border-brand-primary/25 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight">
                      {activeStudy.impactMetric}
                    </div>
                    <div className="text-xs text-zinc-300 mt-1">
                      {activeStudy.impactLabel}
                    </div>
                  </div>
                  <TrendingUp className="w-10 h-10 text-brand-primary/70" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                  {activeStudy.title}
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6">
                  {activeStudy.summary}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {activeStudy.techStack.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Production Systems Dossier
                </span>
                <Link
                  href={`/work/${activeStudy.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold transition-all"
                >
                  <span>Explore Case Study</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
```

---

## 9. Animation 06 — Horizon Light-Curve Arc (`clientsLightCurve`) & Dual-Fade Marquee

### How It Works on `antimatterai.agency`
In `antimatterai.agency`'s **"Trusted by Industry Leaders"** section, three visual layers work together:
1. **Dual Alpha Edge Masks (`Fadebg`)**: Left and right edges of the logo marquee dissolve smoothly to transparent via CSS `mask-image` (`linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%)`) so logos never clip against a solid rectangle when background glow passes behind them.
2. **Continuous Seamless Marquee**: Two identical flex tracks translate from `0%` to `-50%` over `30s linear infinite`, pausing/decelerating smoothly on `hover`.
3. **Planetary Horizon Light Curve (`clientsLightCurve`)**: Directly beneath the logo marquee sits a wide, sweeping elliptical rim-light arc (`border-radius: 50%`, glowing top edge in `#8587e3` and `#ffffff`, softly breathing over `6s ease-in-out infinite`) that frames the transition into the closing CTA.

### Drop-In Horizon Light-Curve CSS (`src/app/globals.css`)

```css
/* Planetary Horizon Light Curve (matches antimatterai.agency clientsLightCurve) */
.horizon-light-curve {
  position: relative;
  width: 150%;
  left: -25%;
  height: 220px;
  margin-top: 2.5rem;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  border-top: 1.5px solid rgba(195, 196, 247, 0.55);
  background: radial-gradient(
    ellipse 55% 65% at 50% 0%,
    rgba(133, 135, 227, 0.26) 0%,
    rgba(105, 106, 172, 0.08) 45%,
    transparent 75%
  );
  box-shadow: 0 -24px 80px -12px rgba(133, 135, 227, 0.35);
  pointer-events: none;
}

.marquee-alpha-mask {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
}
```

And on the marquee track in `src/components/LogoStrip.tsx`, add `hover:[animation-play-state:paused]` so hovering a partner mark pauses the ribbon cleanly.

---

## 10. Animation 07 — Glassmorphic Scroll-Morph Navbar & Spring Mega-Menu

### How It Works on `antimatterai.agency`
1. **Scroll-Threshold Header Morph**:
   - At `scrollY <= 20`: `bg-transparent py-5 border-transparent`
   - At `scrollY > 20`: `bg-[#030303]/80 backdrop-blur-xl border-b border-white/[0.08] py-3.5 shadow-[0_16px_48px_rgba(0,0,0,0.75)]` (`duration-300 ease-out`).
2. **Mega-Menu Spring Entrance + "OUR LATEST WORK" Spotlight Card**:
   - Wrapping the dropdown in Framer Motion `<AnimatePresence>` animates:
     - `initial={{ opacity: 0, y: -10, scale: 0.985 }}`
     - `animate={{ opacity: 1, y: 0, scale: 1 }}`
     - `exit={{ opacity: 0, y: -6, scale: 0.99 }}`
     - `transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}`
   - Inside the mega-menu, alongside the 6 service pillars, a featured **OUR LATEST WORK** preview card (`Strata Systems` dossier) highlights on hover with an animated image/metric scale (`group-hover:scale-[1.03]`).
3. **Mobile Drawer Stagger**:
   - Mobile menu overlay fades in (`backdrop-blur-xl bg-[#030303]/95`) while navigation items cascade downward with `staggerChildren: 0.045`.

---

## 11. Animation 08 — Subpage, Canvas Scrub & Interactive Lab Choreographies

### 11.1 `/company` — Dotted World Map Hub Beacons & Core Beliefs Stack
- **World Map Beacons**: SVG dotted world map displays Axiom Studio engineering hubs (San Francisco & London) with dual concentric pulsing rings (`animate-ping` at `2.4s` interval + solid `#8587e3` center node) and SVG curved dashed connection arcs (`stroke-dasharray: 4 4`, animated `stroke-dashoffset` flow).
- **`01–04` Core Beliefs Cards**: Scroll-linked opacity & border illumination (`whileInView={{ opacity: 1, x: 0 }}`, `amount: 0.4`) so each principle lights up sequentially as the reader scrolls down the narrative.

### 11.2 `/services/[slug]` — Scroll-Linked 4-Phase Delivery Timeline (`01 Discover` → `04 Deliver`)
- Uses Framer Motion `useScroll({ target: timelineRef, offset: ["start 75%", "end 60%"] })` bound to a vertical 2px gradient line (`style={{ scaleY: scrollYProgress, transformOrigin: "top" }}`) that fills with `#8587e3` light as the user scrolls through Phases `01`, `02`, `03`, and `04`.

### 11.3 `/work/[slug]` — Pinned `<canvas>` Scroll-Scrubbed Sequence (Talitrix-Style Product Reveal)
- Matches `antimatterai.agency/case-study/talitrix`:
  - A `<canvas>` container is `sticky top-0 h-screen` inside a `h-[300vh]` scroll runway.
  - `GSAP ScrollTrigger` (`scrub: 0.5`) maps scroll progress (`0.0 -> 1.0`) to frame index or procedural WebGL/2D architecture layer disassembly while foreground glass callout cards float past with differential parallax (`yPercent: -15`).

### 11.4 `/demos/threat-monitor` — Interactive 3D Orbital Threat Globe & Telemetry Stream
- Matches `antimatterai.agency/demos/atom-red-team`:
  - Interactive rotatable canvas/WebGL sphere (`pointerdown` + `pointermove` yaw/pitch drag, wheel zoom) plotting real-time curved quadratic bezier attack arcs between global nodes, paired with pulsing `MITRE ATLAS` 16-technique heatmap cells and an auto-scrolling terminal defense log (`scrollTop` smoothly eased on new telemetry events).

### 11.5 `Footer.tsx` — Closing Split-Character CTA, Magnetic Button & Live 1Hz Studio Clock
- **Split-Character Closing Headline**: Uses `<SplitTextReveal text="We turn bold ideas into powerful digital realities." />`.
- **Magnetic Primary CTA (`Let's work together`)**:
  ```tsx
  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
    e.currentTarget.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };
  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translate3d(0px, 0px, 0)";
  };
  ```
- **Live 1Hz Studio Clock**: Updates every `1000ms` on client mount (`--:--:--` SSR placeholder to avoid hydration mismatch -> `12:34:06 AM` / `00:34:06` live `tabular-nums` readout) paired with an emerald pulsing status LED.

---

## 12. GPU Performance Budget & `prefers-reduced-motion` Compliance

To maintain **60fps frame pacing** and **Lighthouse Performance >= 95** across desktop and mobile devices:

1. **Compositor-Only Properties**:
   - **ALLOWED** in active animations: `transform` (`translate3d`, `scale`, `rotate`, `rotateX`, `rotateY`), `opacity`, `filter` (short entrance blurs only, cleared to `blur(0px)` after settle), and `<canvas>` 2D/WebGL draws.
   - **FORBIDDEN** in keyframe/scroll loops: `top`, `left`, `width`, `height`, `margin`, `padding`, `box-shadow` (animate pseudo-element `opacity` instead).
2. **`will-change` Hygiene**:
   - Apply `will-change: transform` only on active scroll/marquee/odometer layers; avoid placing `will-change` on more than 12 concurrent DOM nodes.
3. **Mandatory Reduced Motion Override**:
   - Keep the global CSS override in `src/app/globals.css` (`@media (prefers-reduced-motion: reduce)`) AND check `useReducedMotion()` / `window.matchMedia("(prefers-reduced-motion: reduce)")` inside `SmoothScrollProvider`, `LightRays`, `SplitTextReveal`, and `RollingNumber` so users with vestibular sensitivity receive instant, zero-motion states with 100% content visibility.
4. **Zero Hydration Mismatch**:
   - Browser-only APIs (`window`, `IntersectionObserver`, `requestAnimationFrame`, `new Date()`) must execute strictly inside `useEffect` hooks in `"use client"` components.

---

## 13. Step-by-Step File Integration Checklist for Axiom Studio

Use this exact sequence when applying all `antimatterai.agency` animations to **Axiom Studio**:

- [x] **Step 1**: Install motion dependencies (`npm install framer-motion gsap lenis`).
- [x] **Step 2**: Create `src/lib/motionTokens.ts` with `MOTION_EASE`, `MOTION_SPRING`, and `STAGGER` constants.
- [x] **Step 3**: Create `src/components/SmoothScrollProvider.tsx` and wrap `{children}` inside `src/app/layout.tsx`.
- [x] **Step 4**: Add `.ray-striations`, `.horizon-light-curve`, `.marquee-alpha-mask`, and `.animate-dash-flow` utilities to `src/app/globals.css`.
- [x] **Step 5**: Upgrade `src/components/LightRays.tsx` with pointer-lerped parallax and rising canvas dust motes.
- [x] **Step 6**: Create `src/components/SplitTextReveal.tsx` and wire it across `Hero.tsx`, `ServicesGrid.tsx`, `MethodologySection.tsx`, `CaseStudies.tsx`, `Footer.tsx`, and all route pages (`/work`, `/work/[slug]`, `/services/[slug]`, `/company`, `/blog`, `/blog/[slug]`, `/open-axiom`, `/resources/vendor-matrix`, `/contact`, and all 6 `/demos/*`).
- [x] **Step 7**: Replace `src/components/RollingNumber.tsx` with the vertical `0123456789` slot-machine odometer strip component and staggered `StatsSection.tsx`.
- [x] **Step 8**: Upgrade `src/components/ServicesGrid.tsx` with `01–06` expandable capabilities, `Tools` pills, and `--mouse-x`/`--mouse-y` radial spotlight borders.
- [x] **Step 9**: Upgrade `src/components/CaseStudies.tsx` with the synchronized `01–06` split-stage selector rail + cross-fading visual preview stage.
- [x] **Step 10**: Upgrade `src/components/LogoStrip.tsx` with the glowing `.horizon-light-curve` arc and `.marquee-alpha-mask` infinite ribbon.
- [x] **Step 11**: Upgrade `src/components/Navbar.tsx` with `AnimatePresence` spring mega-menus (`OUR LATEST WORK` preview card) and `src/components/Footer.tsx` with the magnetic CTA pill + 1Hz studio clock.
- [x] **Step 12**: Add `ScrollProgressBar.tsx`, `SpotlightCard.tsx`, Talitrix-style `CaseStudyScrollShowcase.tsx` + radial SVG dial gauges on `/work/[slug]`, pulsing SFO ⇄ LDN map + Story Reel Cinema Modal on `/company`, 3D `OrbitalThreatGlobe.tsx` on `/demos/threat-monitor`, Subsea Optical Fiber GIS map on `/demos/infrastructure-atlas`, and 60fps Dual-Harmonic Oscilloscope on `/demos/voice-sentiment`.
- [x] **Step 13**: Run `npm run typecheck`, `npm run lint`, and `npm run build` with 0 errors, 0 warnings, and full `prefers-reduced-motion` compliance.
