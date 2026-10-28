"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  buildAllServiceShapes,
  ServiceShapeId,
} from "@/lib/serviceParticleShapes";

// ============================================================================
// TUNABLE PARTICLE CONSTANTS
// ============================================================================
export const PARTICLE_TUNING = {
  DESKTOP_COUNT: 9200,
  MOBILE_COUNT: 3600,
  PROGRESS_LERP: 0.09, // Smooths raw scroll progress in the render loop
  SWAY_AMPLITUDE_Y: 0.26, // ~15 deg gentle Y-axis depth sway for readable icons
  SWAY_SPEED: 0.55, // rad/s idle sway frequency
  HELIX_ROTATION_SPEED: 0.36, // rad/s continuous Y-axis spin for blob & DNA helix
  MIDPOINT_NOISE_AMOUNT: 0.42, // Curl/turbulence expansion at transition midpoint (uMorph = 0.5)
  INTRO_BURST_AMOUNT: 0.58, // Step 0 sphere outward burst (frames 18-20 anticipation)
  IDLE_WOBBLE_AMOUNT: 0.018, // Per-particle organic breathing wobble
  STAGE_CENTER_X_DESKTOP: 0.235, // Left-half particle center (~23.5% of viewport width)
  STAGE_CENTER_Y_DESKTOP: 0.51, // Vertically centered in pinned viewport
  SHAPE_RADIUS_CLAMP_MIN: 145, // px radius (300px diameter min on desktop)
  SHAPE_RADIUS_CLAMP_MAX: 195, // px radius (390px diameter max on 1900px screen)
} as const;

/**
 * Shared scroll-progress -> (fromShape, toShape, morphT, burstAmount, activeStepIndex, stepTransitionT)
 * Pure deterministic function used by BOTH the particle stage and the cards row
 * so particles and cards can NEVER drift out of sync.
 */
export interface MasterTimelineState {
  activeCardIndex: number; // 0..3 primary active service index
  fromCardIndex: number; // 0..3 outgoing card during transition
  toCardIndex: number; // 0..3 incoming card during transition
  cardTransitionT: number; // 0..1 progress between fromCardIndex -> toCardIndex (0 during hold)
  fromShape: ServiceShapeId;
  toShape: ServiceShapeId;
  shapeMorphT: number; // 0..1 morph between fromShape and toShape
  introBurst: number; // 0..1 outward stardust burst during Step 0 intro
}

const ORDERED_SHAPES: ServiceShapeId[] = [
  "wireframe",
  "brackets",
  "growthChart",
  "dnaHelix",
];

export function evaluateServicesMasterTimeline(
  rawP: number
): MasterTimelineState {
  const p = Math.max(0, Math.min(1, rawP));

  // Segment 0: p in [0.00, 0.11] -> Step 0 Intro: Spherical Blob bursts & forms Service 1 (Wireframe)
  // Card 0 (UI/UX Design) is already expanded from p = 0!
  const INTRO_END = 0.11;
  if (p <= INTRO_END) {
    const introT = p / INTRO_END; // 0..1
    // Burst peaks around introT = 0.42 (matching frames 18-20) then condenses into wireframe by introT = 1
    const burst = Math.sin(Math.PI * Math.pow(introT, 0.85));
    return {
      activeCardIndex: 0,
      fromCardIndex: 0,
      toCardIndex: 0,
      cardTransitionT: 0,
      fromShape: "blob",
      toShape: ORDERED_SHAPES[0],
      shapeMorphT: introT,
      introBurst: burst,
    };
  }

  // Remaining scroll [0.11, 1.00] maps across 4 holds and 3 transitions:
  // Step 0 Hold -> Trans 0->1 -> Step 1 Hold -> Trans 1->2 -> Step 2 Hold -> Trans 2->3 -> Step 3 Hold
  // Layout of normalized u in [0, 1]:
  //   Hold 0:  0.00 .. 0.14
  //   Trans 1: 0.14 .. 0.30  (width = 0.16)
  //   Hold 1:  0.30 .. 0.44
  //   Trans 2: 0.44 .. 0.60  (width = 0.16)
  //   Hold 2:  0.60 .. 0.74
  //   Trans 3: 0.74 .. 0.90  (width = 0.16)
  //   Hold 3:  0.90 .. 1.00  (final hold before unpin)
  const u = (p - INTRO_END) / (1 - INTRO_END);

  const windows = [
    { type: "hold" as const, start: 0.0, end: 0.14, idx: 0 },
    { type: "trans" as const, start: 0.14, end: 0.3, from: 0, to: 1 },
    { type: "hold" as const, start: 0.3, end: 0.44, idx: 1 },
    { type: "trans" as const, start: 0.44, end: 0.6, from: 1, to: 2 },
    { type: "hold" as const, start: 0.6, end: 0.74, idx: 2 },
    { type: "trans" as const, start: 0.74, end: 0.9, from: 2, to: 3 },
    { type: "hold" as const, start: 0.9, end: 1.0001, idx: 3 },
  ];

  for (const w of windows) {
    if (u >= w.start && u <= w.end) {
      if (w.type === "hold") {
        return {
          activeCardIndex: w.idx,
          fromCardIndex: w.idx,
          toCardIndex: w.idx,
          cardTransitionT: 0,
          fromShape: ORDERED_SHAPES[w.idx],
          toShape: ORDERED_SHAPES[w.idx],
          shapeMorphT: 0,
          introBurst: 0,
        };
      }
      const localT = Math.max(0, Math.min(1, (u - w.start) / (w.end - w.start)));
      return {
        activeCardIndex: localT < 0.5 ? w.from : w.to,
        fromCardIndex: w.from,
        toCardIndex: w.to,
        cardTransitionT: localT,
        fromShape: ORDERED_SHAPES[w.from],
        toShape: ORDERED_SHAPES[w.to],
        shapeMorphT: localT,
        introBurst: 0,
      };
    }
  }

  return {
    activeCardIndex: 3,
    fromCardIndex: 3,
    toCardIndex: 3,
    cardTransitionT: 0,
    fromShape: ORDERED_SHAPES[3],
    toShape: ORDERED_SHAPES[3],
    shapeMorphT: 0,
    introBurst: 0,
  };
}

interface ServicesParticleCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  layoutMode: "desktop" | "mobile";
  staticShape?: ServiceShapeId; // Used when prefers-reduced-motion is enabled
  className?: string;
}

export default function ServicesParticleCanvas({
  scrollProgressRef,
  layoutMode,
  staticShape,
  className = "",
}: ServicesParticleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const count =
      layoutMode === "desktop"
        ? PARTICLE_TUNING.DESKTOP_COUNT
        : PARTICLE_TUNING.MOBILE_COUNT;

    const shapes = buildAllServiceShapes(count);

    // Check WebGL availability; fall back to 2D canvas if unavailable
    let testGl: RenderingContext | null = null;
    try {
      const testCanvas = document.createElement("canvas");
      testGl =
        testCanvas.getContext("webgl2") ||
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
    } catch {
      testGl = null;
    }

    // ------------------------------------------------------------------------
    // 2D CANVAS FALLBACK (Only used if WebGL is disabled/unavailable)
    // ------------------------------------------------------------------------
    if (!testGl) {
      const canvas2d = document.createElement("canvas");
      canvas2d.style.width = "100%";
      canvas2d.style.height = "100%";
      container.appendChild(canvas2d);
      const ctx = canvas2d.getContext("2d");

      let raf2d = 0;
      let smoothP = scrollProgressRef.current;

      const drawFallback = () => {
        if (!ctx) return;
        const w = container.clientWidth || 400;
        const h = container.clientHeight || 400;
        if (canvas2d.width !== w || canvas2d.height !== h) {
          canvas2d.width = w;
          canvas2d.height = h;
        }
        ctx.clearRect(0, 0, w, h);

        smoothP += (scrollProgressRef.current - smoothP) * PARTICLE_TUNING.PROGRESS_LERP;
        const state = staticShape
          ? {
              fromShape: staticShape,
              toShape: staticShape,
              shapeMorphT: 0,
            }
          : evaluateServicesMasterTimeline(smoothP);

        const src = shapes[state.fromShape];
        const dst = shapes[state.toShape];
        const cx = layoutMode === "desktop" ? w * PARTICLE_TUNING.STAGE_CENTER_X_DESKTOP : w * 0.5;
        const cy = h * 0.5;
        const scale = Math.min(w, h) * 0.3;

        ctx.fillStyle = "rgba(226, 232, 255, 0.72)";
        const stride = 3 * 3; // subsample in 2D fallback
        for (let i = 0; i < src.length; i += stride) {
          const x = src[i] + (dst[i] - src[i]) * state.shapeMorphT;
          const y = src[i + 1] + (dst[i + 1] - src[i + 1]) * state.shapeMorphT;
          ctx.fillRect(cx + x * scale, cy - y * scale, 1.6, 1.6);
        }

        if (!staticShape) {
          raf2d = requestAnimationFrame(drawFallback);
        }
      };

      drawFallback();
      return () => {
        cancelAnimationFrame(raf2d);
        if (canvas2d.parentElement) canvas2d.parentElement.removeChild(canvas2d);
      };
    }

    // ------------------------------------------------------------------------
    // GPU THREE.JS POINTS + CUSTOM GLSL SHADER MORPH
    // ------------------------------------------------------------------------
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 2500);
    camera.position.set(0, 0, 820);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const geometry = new THREE.BufferGeometry();

    // Clone initial buffers so attribute swapping never mutates cached shape templates
    const startArray = new Float32Array(shapes.blob);
    const targetArray = new Float32Array(shapes.wireframe);
    const blobArray = new Float32Array(shapes.blob);

    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random per-particle attributes
      const s1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const rand1 = s1 - Math.floor(s1);
      const s2 = Math.sin(i * 93.9898 + 19.19) * 24634.6345;
      const rand2 = s2 - Math.floor(s2);
      const s3 = Math.sin(i * 41.331 + 11.73) * 19531.117;
      const rand3 = s3 - Math.floor(s3);

      seeds[i] = rand1;
      // Stardust dot size distribution: mostly fine 1.1-2.1px dust, ~12% brighter 2.3-3.0px stars
      sizes[i] = rand2 > 0.88 ? 2.3 + rand3 * 0.85 : 1.05 + rand2 * 1.15;
      // Varied luminosity so cloud reads as organic volumetric stardust, never a flat grid
      alphas[i] = 0.22 + Math.pow(rand3, 1.35) * 0.78;
    }

    const startAttr = new THREE.BufferAttribute(startArray, 3);
    const targetAttr = new THREE.BufferAttribute(targetArray, 3);
    geometry.setAttribute("position", startAttr);
    geometry.setAttribute("aTarget", targetAttr);
    geometry.setAttribute("aBlob", new THREE.BufferAttribute(blobArray, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uBurst: { value: 0 },
      uMidpointDust: { value: 0 },
      uPixelRatio: { value: dpr },
      uShapeScale: { value: 170 },
      uIdleWobble: { value: staticShape ? 0.0 : PARTICLE_TUNING.IDLE_WOBBLE_AMOUNT },
      uNoiseAmount: { value: PARTICLE_TUNING.MIDPOINT_NOISE_AMOUNT },
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        attribute vec3 aTarget;
        attribute vec3 aBlob;
        attribute float aSeed;
        attribute float aSize;
        attribute float aAlpha;

        uniform float uTime;
        uniform float uMorph;
        uniform float uBurst;
        uniform float uMidpointDust;
        uniform float uPixelRatio;
        uniform float uShapeScale;
        uniform float uIdleWobble;
        uniform float uNoiseAmount;

        varying float vAlpha;
        varying float vDepthTint;

        // Lightweight 3D trigonometric curl-like turbulence on GPU
        vec3 pseudoCurl(vec3 p, float t, float seed) {
          float phase = seed * 6.2831853;
          float nx = sin(p.y * 3.1 + t * 0.85 + phase) + cos(p.z * 2.7 - t * 0.65);
          float ny = sin(p.z * 3.3 + t * 0.78 + phase * 1.3) + cos(p.x * 2.9 + t * 0.62);
          float nz = sin(p.x * 2.8 - t * 0.82 + phase * 0.7) + cos(p.y * 3.2 + t * 0.71);
          return vec3(nx, ny, nz) * 0.5;
        }

        void main() {
          // Staggered per-particle ripple based on aSeed so shapes assemble organically
          float staggered = clamp((uMorph * 1.30) - aSeed * 0.30, 0.0, 1.0);
          // Smooth quintic ease-in-out
          float eased = staggered * staggered * staggered * (staggered * (staggered * 6.0 - 15.0) + 10.0);

          vec3 basePos = mix(position, aTarget, eased);

          // Signature "return-to-dust-sphere" midpoint during transitions 1->2, 2->3, 3->4
          float midBell = sin(3.14159265 * staggered) * uMidpointDust;
          // Blend halfway toward spherical dust ball + outward curl turbulence at midpoint
          basePos = mix(basePos, aBlob * 1.08, midBell * 0.68);
          vec3 midNoise = pseudoCurl(basePos * 1.4, uTime, aSeed) * midBell * uNoiseAmount * (0.45 + aSeed * 0.75);
          basePos += midNoise;

          // Step 0 Intro outward stardust burst (frames 18-20 anticipation before Wireframe condenses)
          if (uBurst > 0.001) {
            vec3 radialDir = normalize(position + vec3(0.0001));
            vec3 burstScatter = radialDir * (0.35 + aSeed * 0.95) * uBurst * ${PARTICLE_TUNING.INTRO_BURST_AMOUNT.toFixed(2)};
            burstScatter += pseudoCurl(position * 1.8, uTime * 0.9, aSeed) * uBurst * 0.24;
            basePos += burstScatter;
          }

          // Continuous idle breathing wobble so cloud never looks frozen
          vec3 wobble = pseudoCurl(basePos * 2.2, uTime * 0.75, aSeed) * uIdleWobble;
          float breathe = 1.0 + sin(uTime * 1.1) * (uIdleWobble * 0.8);
          vec3 scaledPos = (basePos * breathe + wobble) * uShapeScale;

          vec4 mvPosition = modelViewMatrix * vec4(scaledPos, 1.0);
          float dist = max(120.0, -mvPosition.z);

          // Depth cue: nearer particles are brighter & slightly larger; farther ones dimmer & smaller
          // scaledPos.z in view space relative to center (~ -820)
          float relDepth = clamp((mvPosition.z + 820.0) / (uShapeScale * 2.2) + 0.5, 0.0, 1.0);
          float depthAlpha = mix(0.42, 1.15, relDepth);
          float depthSize = mix(0.76, 1.24, relDepth);

          // Slight dimming during wide burst/midpoint scatter, matching reference frames
          float scatterDim = 1.0 - 0.18 * max(uBurst, midBell);

          vAlpha = clamp(aAlpha * depthAlpha * scatterDim, 0.05, 1.0);
          vDepthTint = relDepth;

          gl_PointSize = aSize * depthSize * uPixelRatio * (680.0 / dist);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vDepthTint;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          if (d > 0.5) discard;

          // Soft stardust radial falloff
          float core = smoothstep(0.5, 0.06, d);
          float alpha = core * core * vAlpha;

          // Silver-white with subtle cool-ice-blue cast (#dce3ff -> #ffffff)
          vec3 farTint = vec3(0.78, 0.82, 0.98);
          vec3 nearTint = vec3(0.97, 0.98, 1.0);
          vec3 col = mix(farTint, nearTint, vDepthTint);

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, shaderMaterial);
    cloudGroup.add(points);

    let currentFromShape: ServiceShapeId = staticShape || "blob";
    let currentToShape: ServiceShapeId = staticShape || "wireframe";

    if (staticShape) {
      startAttr.array.set(shapes[staticShape]);
      targetAttr.array.set(shapes[staticShape]);
      startAttr.needsUpdate = true;
      targetAttr.needsUpdate = true;
    }

    const updateStageMetrics = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      const visibleH =
        2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.position.z;
      const visibleW = visibleH * camera.aspect;
      const pxToWorld = visibleW / width;

      if (layoutMode === "desktop") {
        // Left ~42-45% stage center, clamp(145px, 10vw, 195px) radius (~300-390px diameter at 1900px)
        const targetScreenX = width * PARTICLE_TUNING.STAGE_CENTER_X_DESKTOP;
        const targetScreenY = height * PARTICLE_TUNING.STAGE_CENTER_Y_DESKTOP;
        const radiusPx = Math.max(
          PARTICLE_TUNING.SHAPE_RADIUS_CLAMP_MIN,
          Math.min(width * 0.1, PARTICLE_TUNING.SHAPE_RADIUS_CLAMP_MAX, height * 0.26)
        );

        uniforms.uShapeScale.value = radiusPx * pxToWorld;
        cloudGroup.position.set(
          (targetScreenX - width * 0.5) * pxToWorld,
          -(targetScreenY - height * 0.5) * pxToWorld,
          0
        );
      } else {
        // Mobile / Tablet top stage centered
        const radiusPx = Math.max(95, Math.min(width * 0.28, height * 0.34, 150));
        uniforms.uShapeScale.value = radiusPx * pxToWorld;
        cloudGroup.position.set(0, 0, 0);
      }
    };

    updateStageMetrics();
    window.addEventListener("resize", updateStageMetrics);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateStageMetrics);
      resizeObserver.observe(container);
    }

    // Off-screen & background-tab pause
    let isIntersecting = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
        });
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    let isTabVisible = !document.hidden;
    const onVisChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisChange);

    let rafId = 0;
    let lastNow = performance.now();
    let elapsed = 0;
    let smoothProgress = scrollProgressRef.current;
    let helixSpinAngle = 0;

    const renderLoop = (now: number) => {
      if (staticShape) {
        renderer.render(scene, camera);
        return;
      }

      rafId = requestAnimationFrame(renderLoop);

      if (!isIntersecting || !isTabVisible) {
        lastNow = now;
        return;
      }

      const dt = Math.min((now - lastNow) / 1000, 0.06);
      lastNow = now;
      elapsed += dt;

      // Smooth master scroll progress so fast wheel ticks feel fluid
      smoothProgress +=
        (scrollProgressRef.current - smoothProgress) *
        PARTICLE_TUNING.PROGRESS_LERP;

      const state = evaluateServicesMasterTimeline(smoothProgress);

      // Swap GPU source/target buffers only when active segment changes
      if (state.fromShape !== currentFromShape) {
        startAttr.array.set(shapes[state.fromShape]);
        startAttr.needsUpdate = true;
        currentFromShape = state.fromShape;
      }
      if (state.toShape !== currentToShape) {
        targetAttr.array.set(shapes[state.toShape]);
        targetAttr.needsUpdate = true;
        currentToShape = state.toShape;
      }

      uniforms.uTime.value = elapsed;
      uniforms.uMorph.value = state.shapeMorphT;
      uniforms.uBurst.value = state.introBurst;
      // Enable return-to-dust-sphere midpoint on all service-to-service transitions (not Step 0 intro which already starts from blob)
      uniforms.uMidpointDust.value = state.fromShape === "blob" ? 0.0 : 1.0;

      // Continuous rotation for Blob & DNA Helix; gentle +/-15 deg sway for Wireframe, </> & Growth Chart
      helixSpinAngle += dt * PARTICLE_TUNING.HELIX_ROTATION_SPEED;
      const swayY =
        Math.sin(elapsed * PARTICLE_TUNING.SWAY_SPEED) *
        PARTICLE_TUNING.SWAY_AMPLITUDE_Y;

      const fromSpins =
        state.fromShape === "blob" || state.fromShape === "dnaHelix" ? 1 : 0;
      const toSpins =
        state.toShape === "blob" || state.toShape === "dnaHelix" ? 1 : 0;
      const spinWeight =
        fromSpins + (toSpins - fromSpins) * state.shapeMorphT;

      // Wrap helixSpinAngle cleanly around swayY so blending never unwinds multiple turns
      const normalizedSpin = ((helixSpinAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      points.rotation.y = swayY * (1 - spinWeight) + normalizedSpin * spinWeight;
      points.rotation.x = Math.sin(elapsed * 0.42) * 0.065;
      cloudGroup.position.y += Math.sin(elapsed * 0.9) * 0.04;
      // Keep vertical center stable (reset drift via deterministic offset)
      const baseScreenY =
        layoutMode === "desktop"
          ? height * PARTICLE_TUNING.STAGE_CENTER_Y_DESKTOP
          : height * 0.5;
      const visibleH =
        2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.position.z;
      const pxToWorld = (visibleH * camera.aspect) / width;
      cloudGroup.position.y =
        -(baseScreenY - height * 0.5) * pxToWorld +
        Math.sin(elapsed * 0.85) * (4.5 * pxToWorld);

      renderer.render(scene, camera);
    };

    if (staticShape) {
      points.rotation.y = 0.18;
      renderer.render(scene, camera);
    } else {
      rafId = requestAnimationFrame(renderLoop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateStageMetrics);
      if (resizeObserver) resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisChange);

      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [layoutMode, scrollProgressRef, staticShape]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-hidden ${className}`}
    />
  );
}
