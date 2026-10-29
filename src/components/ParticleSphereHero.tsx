"use client";

import React, { useEffect, useRef, useState } from "react";
import TouchHeroSphere from "./TouchHeroSphere";
import * as THREE from "three";
import {
  PARTICLE_ENGINE_DEFAULTS,
  createRadialGlowSprite,
  createSharedParticleStage,
  generateFibonacciSphereBuffer,
  ProjectionMetrics,
  renderStaticParticleCloud2D,
} from "@/lib/particleEngine";

import { getPerformanceTier, createAdaptiveFpsMonitor } from "@/lib/performanceTier";

export default function ParticleSphereHero(props: ParticleSphereProps) {
  const [touch, setTouch] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setTouch(mq.matches);
    update(); mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return touch === null ? null : touch ? <TouchHeroSphere {...props} /> : <DesktopParticleSphereHero {...props} />;
}

interface ParticleSphereProps {
  className?: string;
}

// Official Google Antigravity (antigravity.google) Multicolor Particle Spectrum
const ANTIGRAVITY_SPECTRUM = [
  new THREE.Color("#3186FF"), // Electric Blue (dominant)
  new THREE.Color("#1E3A8A"), // Deep Antigravity Navy
  new THREE.Color("#3186FF"), // Electric Blue
  new THREE.Color("#749BFF"), // Soft Periwinkle Blue
  new THREE.Color("#202124"), // Crisp Charcoal Speck
  new THREE.Color("#FC413D"), // Coral Red
  new THREE.Color("#FBBC04"), // Signal Amber / Yellow
  new THREE.Color("#00B95C"), // Vivid Green
];

function DesktopParticleSphereHero({
  className = "",
}: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const mountStatic = () => {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "width:100%;height:100%;display:block";
      container.appendChild(canvas);
      const positions = generateFibonacciSphereBuffer(900);
      const draw = () => renderStaticParticleCloud2D(canvas, positions);
      draw();
      const observer = new ResizeObserver(draw);
      observer.observe(container);
      return () => { observer.disconnect(); canvas.remove(); };
    };
    if (prefersReducedMotion) return mountStatic();
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isMobileViewport = window.innerWidth < 768;

    const tier = getPerformanceTier();
    const PARTICLE_COUNT = tier.particleCount;
    const HOVER_TINT_COLOR = new THREE.Color("#3186FF");
    const INFLUENCE_RADIUS = PARTICLE_ENGINE_DEFAULTS.MOUSE_INFLUENCE_RADIUS_PX;
    const SPRING_STIFFNESS = PARTICLE_ENGINE_DEFAULTS.SPRING_STIFFNESS;
    const SPRING_DAMPING = PARTICLE_ENGINE_DEFAULTS.SPRING_DAMPING;
    const ROTATION_SPEED_Y = prefersReducedMotion
      ? 0.02
      : PARTICLE_ENGINE_DEFAULTS.HERO_ROTATION_SPEED_Y;
    const ROTATION_TILT_X = PARTICLE_ENGINE_DEFAULTS.ROTATION_TILT_X;

    const sphereGroup = new THREE.Group();

    const glow = createRadialGlowSprite(
      [
        { offset: 0, color: "rgba(49, 134, 255, 0.14)" },
        { offset: 0.45, color: "rgba(116, 155, 255, 0.07)" },
        { offset: 0.75, color: "rgba(251, 188, 4, 0.03)" },
        { offset: 1, color: "rgba(255, 255, 255, 0.0)" },
      ],
      THREE.NormalBlending
    );
    sphereGroup.add(glow.sprite);

    let sphereRadius = 180;
    const applyStageMetrics = (metrics: ProjectionMetrics) => {
      const { width, height, pxToWorld } = metrics;
      const isMobile = width < 768;
      const targetScreenX = width * 0.5;
      const targetScreenY = height * 0.5;

      const maxRadiusByHeight = height * 0.34;
      const screenRadius = isMobile
        ? Math.min(maxRadiusByHeight, Math.max(125, Math.min(width * 0.34, 220)))
        : Math.min(maxRadiusByHeight, Math.max(150, Math.min(width * 0.17, 330)));

      sphereRadius = screenRadius * pxToWorld;

      const worldX = (targetScreenX - width / 2) * pxToWorld;
      const worldY = -(targetScreenY - height / 2) * pxToWorld;
      sphereGroup.position.set(worldX, worldY, 0);

      const glowScale = sphereRadius * 2.5;
      glow.sprite.scale.set(glowScale, glowScale, 1);
    };

    const stage = createSharedParticleStage(container, {
      fov: PARTICLE_ENGINE_DEFAULTS.CAMERA_FOV,
      cameraZ: PARTICLE_ENGINE_DEFAULTS.CAMERA_Z,
      onResize: applyStageMetrics,
      maxDpr: tier.dprCap,
      antialias: tier.antialias,
    });
    if (!stage) {
      glow.dispose();
      return mountStatic();
    }

    stage.scene.add(sphereGroup);

    // --- SHARED FIBONACCI SPHERE GEOMETRY & TYPED ARRAYS ---
    const geometry = new THREE.BufferGeometry();
    const baseUnitPositions = generateFibonacciSphereBuffer(PARTICLE_COUNT, {
      jitter: 0.05,
      surfaceBias: 1.0,
    });
    const positions = new Float32Array(baseUnitPositions);
    const baseColors = new Float32Array(PARTICLE_COUNT * 3);
    const displacements = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const shimmerRates = new Float32Array(PARTICLE_COUNT);
    const tints = new Float32Array(PARTICLE_COUNT);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const theta = goldenAngle * i;

      const bandSeed =
        Math.abs(Math.sin(theta * 0.5 + y * 2.4)) *
        ANTIGRAVITY_SPECTRUM.length;
      const paletteIdx =
        (Math.floor(bandSeed) +
          (i % 3 === 0 ? 0 : i % ANTIGRAVITY_SPECTRUM.length)) %
        ANTIGRAVITY_SPECTRUM.length;
      const chosen = ANTIGRAVITY_SPECTRUM[paletteIdx];

      baseColors[i * 3] = chosen.r;
      baseColors[i * 3 + 1] = chosen.g;
      baseColors[i * 3 + 2] = chosen.b;

      colors[i * 3] = chosen.r;
      colors[i * 3 + 1] = chosen.g;
      colors[i * 3 + 2] = chosen.b;

      sizes[i] = 2.0;
      alphas[i] = 0.72;
      phases[i] = Math.random() * Math.PI * 2;
      shimmerRates[i] = 1.8 + Math.random() * 2.2;
      tints[i] = 0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("customColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("customAlpha", new THREE.BufferAttribute(alphas, 1));

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute float customAlpha;
        attribute vec3 customColor;

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = customColor;
          vAlpha = customAlpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          float softEdge = smoothstep(0.5, 0.14, dist);
          float alpha = softEdge * vAlpha;

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const monitor = createAdaptiveFpsMonitor(tier.tier, (next) => {
      geometry.setDrawRange(0, Math.min(PARTICLE_COUNT, next.particleCount));
      stage.setMaxDpr(next.dprCap);
    });
    const points = new THREE.Points(geometry, shaderMaterial);
    sphereGroup.add(points);

    let animationFrameId = 0;
    let lastTime = performance.now();
    let currentRotationY = 0;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (!stage.isActive()) {
        lastTime = now;
        return;
      }

      monitor.recordFrame((now - lastTime) / 1000, now);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now * 0.001;

      currentRotationY += dt * ROTATION_SPEED_Y;
      points.rotation.y = currentRotationY;
      points.rotation.x = ROTATION_TILT_X;

      stage.pointer.stepLerp();
      const { width, height, pxToWorld } = stage.getMetrics();

      let activeCursorX = stage.pointer.lerpedX;
      let activeCursorY = stage.pointer.lerpedY;
      let cursorActive = stage.pointer.inside;

      if (isCoarsePointer && !stage.pointer.inside && !prefersReducedMotion) {
        const centerScreenX = width * 0.5;
        const centerScreenY = height * 0.5;
        const orbitRadius = (sphereRadius / pxToWorld) * 0.65;
        activeCursorX = centerScreenX + Math.cos(time * 0.8) * orbitRadius;
        activeCursorY =
          centerScreenY + Math.sin(time * 1.1) * (orbitRadius * 0.7);
        cursorActive = true;
      }

      const cosY = Math.cos(currentRotationY);
      const sinY = Math.sin(currentRotationY);
      const cosX = Math.cos(ROTATION_TILT_X);
      const sinX = Math.sin(ROTATION_TILT_X);

      const groupPosX = sphereGroup.position.x;
      const groupPosY = sphereGroup.position.y;
      const groupPosZ = sphereGroup.position.z;
      const cameraZ = stage.camera.position.z;

      const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colorAttr = geometry.attributes.customColor as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;
      const alphaAttr = geometry.attributes.customAlpha as THREE.BufferAttribute;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        const bx = baseUnitPositions[i3];
        const by = baseUnitPositions[i3 + 1];
        const bz = baseUnitPositions[i3 + 2];

        let dx = displacements[i3];
        let dy = displacements[i3 + 1];
        let dz = displacements[i3 + 2];
        let vx = velocities[i3];
        let vy = velocities[i3 + 1];
        let vz = velocities[i3 + 2];

        const px = (bx + dx) * sphereRadius;
        const py = (by + dy) * sphereRadius;
        const pz = (bz + dz) * sphereRadius;

        const x1 = px * cosY + pz * sinY;
        const y1 = py;
        const z1 = -px * sinY + pz * cosY;

        const rx = x1;
        const ry = y1 * cosX - z1 * sinX;
        const rz = y1 * sinX + z1 * cosX;

        const wx = rx + groupPosX;
        const wy = ry + groupPosY;
        const wz = rz + groupPosZ;

        const distZ = cameraZ - wz;
        const projScale = cameraZ / Math.max(10.0, distZ);
        const screenX = width * 0.5 + (wx * projScale) / pxToWorld;
        const screenY = height * 0.5 - (wy * projScale) / pxToWorld;

        const distToCursorX = screenX - activeCursorX;
        const distToCursorY = screenY - activeCursorY;
        const screenDist = Math.sqrt(
          distToCursorX * distToCursorX + distToCursorY * distToCursorY
        );

        let targetTint = 0;

        if (
          cursorActive &&
          screenDist < INFLUENCE_RADIUS &&
          !prefersReducedMotion
        ) {
          const normDist = screenDist / INFLUENCE_RADIUS;
          const falloff = Math.exp(-screenDist / 42.0) * (1.0 - normDist);
          targetTint = Math.min(1.0, falloff * 1.35);

          const dirX = -distToCursorX / (screenDist + 1e-4);
          const dirY = -distToCursorY / (screenDist + 1e-4);

          const tanX = -dirY;
          const tanY = dirX;
          const swirlFactor = 0.42 * Math.sin(i * 0.05 + time * 1.8);
          const clumpJitter = 0.28 * Math.cos(i * 0.12);

          const pullPxX =
            (dirX * (0.85 + clumpJitter) + tanX * swirlFactor) * falloff * 70.0;
          const pullPxY =
            (dirY * (0.85 + clumpJitter) + tanY * swirlFactor) * falloff * 70.0;

          const pullWorldX = (pullPxX * pxToWorld) / projScale;
          const pullWorldY = -(pullPxY * pxToWorld) / projScale;

          const invRy = pullWorldY * cosX;
          const invRz = pullWorldY * sinX;
          const localPullX = pullWorldX * cosY - invRz * sinY;
          const localPullY = invRy;
          const localPullZ = pullWorldX * sinY + invRz * cosY;

          const pullLocalScale = 1.0 / sphereRadius;
          vx += localPullX * pullLocalScale * 0.15;
          vy += localPullY * pullLocalScale * 0.15;
          vz += localPullZ * pullLocalScale * 0.15;
        }

        const springForceX = -dx * SPRING_STIFFNESS;
        const springForceY = -dy * SPRING_STIFFNESS;
        const springForceZ = -dz * SPRING_STIFFNESS;

        vx = (vx + springForceX) * SPRING_DAMPING;
        vy = (vy + springForceY) * SPRING_DAMPING;
        vz = (vz + springForceZ) * SPRING_DAMPING;

        dx += vx;
        dy += vy;
        dz += vz;

        displacements[i3] = dx;
        displacements[i3 + 1] = dy;
        displacements[i3 + 2] = dz;
        velocities[i3] = vx;
        velocities[i3 + 1] = vy;
        velocities[i3 + 2] = vz;

        positions[i3] = px;
        positions[i3 + 1] = py;
        positions[i3 + 2] = pz;

        let currentTint = tints[i];
        currentTint += (targetTint - currentTint) * 0.14;
        tints[i] = currentTint;

        const br = baseColors[i3];
        const bg = baseColors[i3 + 1];
        const bb = baseColors[i3 + 2];

        colors[i3] = br + (HOVER_TINT_COLOR.r - br) * currentTint;
        colors[i3 + 1] = bg + (HOVER_TINT_COLOR.g - bg) * currentTint;
        colors[i3 + 2] = bb + (HOVER_TINT_COLOR.b - bb) * currentTint;

        const depthFactor = Math.max(
          0.0,
          Math.min(1.0, (rz / sphereRadius + 1.0) * 0.5)
        );
        const depthAlpha = 0.14 + 0.56 * depthFactor;

        const twinkle =
          0.84 + 0.16 * Math.sin(time * shimmerRates[i] + phases[i]);
        alphas[i] = Math.min(
          0.92,
          depthAlpha * twinkle * (1.0 + currentTint * 0.45)
        );

        const baseSize = 3.6 + 3.4 * depthFactor;
        sizes[i] = baseSize * (1.0 + currentTint * 0.85);
      }

      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;

      stage.renderer.render(stage.scene, stage.camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      shaderMaterial.dispose();
      glow.dispose();
      stage.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
