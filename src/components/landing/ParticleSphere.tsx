"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  createSharedParticleStage,
  type ProjectionMetrics,
} from "@/lib/particleEngine";
import { signalFirstFrame } from "@/lib/firstFrame";
import { registerStage } from "@/lib/registry";
import { buildMorphTargets, type MorphTargetName } from "@/lib/morphTargets";
import { PARTICLES, BRAND, MORPH } from "@/lib/landingConfig";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useParticleAPI } from "@/lib/particleContext";

/* ------------------------------------------------------------------ */
/* Shaders                                                            */
/* ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute vec3 aTarget;
  attribute float aRandom;
  attribute vec3 aBaseColor;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vEdge;
  varying float vRandom;

  void main() {
    vec3 pos = mix(position, aTarget, uMorph);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * (300.0 / -mvPosition.z) * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
    vColor = aBaseColor;
    vAlpha = aAlpha;
    vEdge = abs(position.z);
    vRandom = aRandom;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vEdge;
  varying float vRandom;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float soft = smoothstep(0.5, 0.15, dist);
    float twinkle = 0.7 + 0.3 * sin(uTime * 4.0 + vRandom * 100.0);
    // Brighter toward the silhouette edge -> hollow shell look.
    float alpha = soft * vAlpha * (0.5 + 0.5 * vEdge) * twinkle;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

interface ParticleSphereProps {
  className?: string;
}

export default function ParticleSphere({ className = "" }: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { register } = useParticleAPI();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? PARTICLES.mobileCount : PARTICLES.desktopCount;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    // No WebGL constructor -> static 2D fallback.
    if (typeof window === "undefined" || !window.WebGLRenderingContext) {
      return mountStaticFallback(container);
    }

    let stage: ReturnType<typeof createSharedParticleStage> | null = null;
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let geometry: THREE.BufferGeometry;
    let material: THREE.ShaderMaterial;
    let points: THREE.Points;
    let sphereGroup: THREE.Group | null = null;
    let glowSprite: THREE.Sprite;
    let glowTexture: THREE.Texture;
    let glowMaterial: THREE.SpriteMaterial;

    // Morph targets: sphere <-> square outline <-> "</>" glyph.
    const targets = buildMorphTargets(PARTICLE_COUNT, "</>");
    let currentTarget = targets.sphere;
    let currentMorph = 0;
    let targetName: MorphTargetName = "sphere";

    const basePositions = targets.sphere; // start positions for every morph
    const positions = new Float32Array(basePositions);
    const randoms = new Float32Array(PARTICLE_COUNT);
    const baseColors = new Float32Array(PARTICLE_COUNT * 3);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const displacement = new Float32Array(PARTICLE_COUNT * 3);
    const velocity = new Float32Array(PARTICLE_COUNT * 3);
    const highlight = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = Math.random();
      randoms[i] = r;
      // White points with a faint violet bias.
      baseColors[i * 3] = 0.92 + 0.06 * r;
      baseColors[i * 3 + 1] = 0.90 + 0.08 * r;
      baseColors[i * 3 + 2] = 1.0;
      alphas[i] = 0.5 + 0.5 * Math.random();
    }

    let sphereRadiusWorld = 1;

    stage = createSharedParticleStage(container, {
      fov: 45,
      cameraZ: 900,
      maxDpr: PARTICLES.dprCap,
      antialias: true,
      onResize: (metrics: ProjectionMetrics) => {
        if (!sphereGroup || !glowSprite) return;
        const { width, height, pxToWorld } = metrics;
        const targetScreenX = width * 0.5;
        const targetScreenY = height * 0.45;
        sphereRadiusWorld = Math.min(height * 0.32, width * 0.22) * pxToWorld;
        sphereGroup.position.set(
          (targetScreenX - width / 2) * pxToWorld,
          -(targetScreenY - height / 2) * pxToWorld,
          0
        );
        glowSprite.scale.set(sphereRadiusWorld * 2.5, sphereRadiusWorld * 2.5, 1);
      },
    });

    if (!stage) {
      return mountStaticFallback(container);
    }

    renderer = stage.renderer;
    scene = stage.scene;
    camera = stage.camera;

    const { width: initW, height: initH, pxToWorld: initP2W } = stage.getMetrics();
    sphereRadiusWorld = Math.min(initH * 0.32, initW * 0.22) * initP2W;


    geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(currentTarget, 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    geometry.setAttribute("aBaseColor", new THREE.BufferAttribute(baseColors, 3));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

    material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uSize: { value: 2.2 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, PARTICLES.dprCap) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    points = new THREE.Points(geometry, material);
    sphereGroup = new THREE.Group();
    sphereGroup.add(points);
    scene.add(sphereGroup);

    sphereGroup.position.set(
      (initW * 0.5 - initW / 2) * initP2W,
      -(initH * 0.45 - initH / 2) * initP2W,
      0
    );


    // Subtle violet fog / core glow behind the sphere.
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const glowCtx = glowCanvas.getContext("2d");
    if (glowCtx) {
      const grad = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(108, 111, 216, 0.18)");
      grad.addColorStop(0.45, "rgba(108, 111, 216, 0.05)");
      grad.addColorStop(1, "rgba(108, 111, 216, 0)");
      glowCtx.fillStyle = grad;
      glowCtx.fillRect(0, 0, 64, 64);
    }
    glowTexture = new THREE.CanvasTexture(glowCanvas);
    glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(sphereRadiusWorld * 2.5, sphereRadiusWorld * 2.5, 1);
    sphereGroup.add(glowSprite);

    const morphProxy = { morph: 0 };
    let morphTween: gsap.core.Tween | null = null;

    const publicAPI = {
      setTarget: (name: MorphTargetName) => {
        if (name === targetName) return;
        targetName = name;
        currentTarget = targets[name];
        const attr = geometry.attributes.aTarget as THREE.BufferAttribute;
        attr.array = currentTarget as Float32Array;
        attr.needsUpdate = true;
        currentMorph = 0;
        material.uniforms.uMorph.value = 0;
        if (morphTween) morphTween.kill();
        morphTween = gsap.to(morphProxy, {
          morph: 1,
          duration: MORPH.dur,
          ease: MORPH.ease,
          onUpdate: () => {
            currentMorph = morphProxy.morph;
            material.uniforms.uMorph.value = currentMorph;
          },
        });
      },
      setMorph: (value: number) => {
        currentMorph = value;
        material.uniforms.uMorph.value = value;
      },
      getMorph: () => currentMorph,
      ready: true,
    };

    register(publicAPI);
    signalFirstFrame();

    let animationFrameId = 0;
    let lastTime = performance.now();
    let currentRotationY = 0;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (!stage.isActive()) {
        lastTime = now;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now * 0.001;
      material.uniforms.uTime.value = time;
      material.uniforms.uPixelRatio.value = stage.getMetrics().dpr;

      if (!prefersReduced) {
        currentRotationY += dt * PARTICLES.rotationSpeedY;
      }
      // Gentle mouse parallax (approx +/- 3 degrees).
      let rotX = 0.15;
      let rotY = currentRotationY;
      if (stage.pointer.inside && !prefersReduced) {
        const { width, height } = stage.getMetrics();
        const nx = (stage.pointer.lerpedX - width * 0.5) / width;
        const ny = (stage.pointer.lerpedY - height * 0.5) / height;
        rotX += ny * 0.06;
        rotY += nx * 0.06;
      }
      points.rotation.x = rotX;
      points.rotation.y = rotY;

      stage.pointer.stepLerp();
      const metrics = stage.getMetrics();
      const { width, height, pxToWorld } = metrics;
      const centerScreenX = width * 0.5;
      const centerScreenY = height * 0.5;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const groupX = sphereGroup!.position.x;
      const groupY = sphereGroup!.position.y;
      const groupZ = sphereGroup!.position.z;
      const cameraZ = camera.position.z;

      const cursorActive = stage.pointer.inside && !prefersReduced;
      const colorArray = geometry.attributes
        .aBaseColor as THREE.BufferAttribute;
      const alphaArray = geometry.attributes.aAlpha as THREE.BufferAttribute;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const bx = basePositions[i3];
        const by = basePositions[i3 + 1];
        const bz = basePositions[i3 + 2];

        let dx = displacement[i3];
        let dy = displacement[i3 + 1];
        let dz = displacement[i3 + 2];
        let vx = velocity[i3];
        let vy = velocity[i3 + 1];
        let vz = velocity[i3 + 2];
        let hl = highlight[i];

        if (cursorActive) {
          const px = bx + dx;
          const py = by + dy;
          const pz = bz + dz;
          const x1 = px * cosY + pz * sinY;
          const y1 = py;
          const z1 = -px * sinY + pz * cosY;
          const rx = x1;
          const ry = y1 * cosX - z1 * sinX;
          const rz = y1 * sinX + z1 * cosX;
          const wx = rx + groupX;
          const wy = ry + groupY;
          const wz = rz + groupZ;
          const distZ = cameraZ - wz;
          const projScale = cameraZ / Math.max(20, distZ);
          const screenX = centerScreenX + (wx * projScale) / pxToWorld;
          const screenY = centerScreenY - (wy * projScale) / pxToWorld;
          const distToCursorX = screenX - stage.pointer.lerpedX;
          const distToCursorY = screenY - stage.pointer.lerpedY;
          const screenDist = Math.sqrt(
            distToCursorX * distToCursorX + distToCursorY * distToCursorY
          );
          const influenceRadius = 140;
          if (screenDist < influenceRadius) {
            const normDist = screenDist / influenceRadius;
            const falloff =
              Math.exp(-screenDist / (influenceRadius * 0.42)) * (1 - normDist);
            hl += (Math.min(1, falloff * 1.5) - hl) * 0.24;
            const dirX = distToCursorX / (screenDist + 1e-4);
            const dirY = distToCursorY / (screenDist + 1e-4);
            const tanX = -dirY;
            const tanY = dirX;
            const swirl = 0.3 * Math.sin(i * 0.05 + time * 2);
            const pushPxX = (dirX + tanX * swirl) * falloff * 90;
            const pushPxY = (dirY + tanY * swirl) * falloff * 90;
            const pushWorldX = (pushPxX * pxToWorld) / projScale;
            const pushWorldY = -(pushPxY * pxToWorld) / projScale;
            const invRy = pushWorldY * cosX;
            const invRz = pushWorldY * sinX;
            const localPushX = pushWorldX * cosY - invRz * sinY;
            const localPushY = invRy;
            const localPushZ = pushWorldX * sinY + invRz * cosY;
            vx += localPushX * 0.15;
            vy += localPushY * 0.15;
            vz += localPushZ * 0.15;
          } else {
            hl *= 0.88;
          }
        }

        vx = (vx - dx * 0.078) * 0.88;
        vy = (vy - dy * 0.078) * 0.88;
        vz = (vz - dz * 0.078) * 0.88;
        dx += vx;
        dy += vy;
        dz += vz;

        positions[i3] = bx + dx;
        positions[i3 + 1] = by + dy;
        positions[i3 + 2] = bz + dz;
        displacement[i3] = dx;
        displacement[i3 + 1] = dy;
        displacement[i3 + 2] = dz;
        velocity[i3] = vx;
        velocity[i3 + 1] = vy;
        velocity[i3 + 2] = vz;
        highlight[i] = hl;

        // Violet tint + size grow toward the silhouette edge (hollow shell).
        const edge = Math.abs(bz);
        const colorMix = 0.55 + 0.45 * edge;
        colorArray.array[i3] = 0.92 + (0.42 - 0.92) * colorMix;
        colorArray.array[i3 + 1] = 0.90 + (0.44 - 0.90) * colorMix;
        colorArray.array[i3 + 2] = 1.0 + (0.78 - 1.0) * colorMix;

        const depthFactor = Math.max(0, Math.min(1, (bz + 1) * 0.5));
        const baseAlpha = 0.45 + 0.45 * depthFactor + 0.35 * edge;
        const twinkle =
          0.75 + 0.25 * Math.sin(time * (2 + randoms[i] * 3) + randoms[i] * 10);
        alphas[i] = Math.min(0.9, baseAlpha * twinkle * (0.6 + 0.4 * edge));
      }

      geometry.attributes.position.needsUpdate = true;
      colorArray.needsUpdate = true;
      (geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (morphTween) morphTween.kill();
      geometry.dispose();
      material.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      stage.dispose();
    };
  }, [prefersReduced, register]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-1 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ background: BRAND.bg }}
    />
  );
}

/**
 * Zero-WebGL fallback: a still violet-tinted particle cloud painted to a 2D
 * canvas. No motion, no shaders — for browsers without WebGL or when
 * `prefers-reduced-motion` requests a static experience.
 */
function mountStaticFallback(container: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block";
  container.appendChild(canvas);

  const draw = () => {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.4;
    const count = Math.min(1500, Math.floor((rect.width * rect.height) / 4000));
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 * 1.618;
      const r = Math.sqrt(i / count) * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const edge = Math.min(1, r / radius);
      ctx.fillStyle = `rgba(${Math.round(140 + 115 * edge)},${Math.round(
        140 + 116 * edge
      )},255,${0.35 + 0.5 * edge})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + edge * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(108, 111, 216, 0.12)");
    grad.addColorStop(1, "rgba(108, 111, 216, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  draw();
  const ro = new ResizeObserver(draw);
  ro.observe(container);
  signalFirstFrame();

  return () => {
    ro.disconnect();
    canvas.remove();
  };
}
