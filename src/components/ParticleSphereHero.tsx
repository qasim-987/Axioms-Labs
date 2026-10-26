"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ParticleSphereProps {
  className?: string;
}

export default function ParticleSphereHero({ className = "" }: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect user preferences and device capabilities
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isMobileViewport = window.innerWidth < 768;

    // --- TUNABLE CONSTANTS ---
    const PARTICLE_COUNT = isMobileViewport ? 3800 : 7600;
    const BASE_COLOR = new THREE.Color(223 / 255, 227 / 255, 255 / 255); // #dfe3ff cool white
    const TINT_COLOR = new THREE.Color(143 / 255, 127 / 255, 255 / 255); // #8f7fff bright violet-blue
    const CORE_GLOW_COLOR = "#5a4fd0"; // #5a4fd0 faint violet inner core
    const INFLUENCE_RADIUS = 118; // px cursor influence radius (90-130px)
    const SPRING_STIFFNESS = 0.078; // damped spring stiffness (0.06 - 0.10)
    const SPRING_DAMPING = 0.88; // damped spring damping (0.85 - 0.90)
    const ROTATION_SPEED_Y = prefersReducedMotion ? 0.02 : 0.095; // rad/s
    const ROTATION_TILT_X = 0.15; // rad
    const MOUSE_LERP_FACTOR = 0.12; // smooth cursor tracking

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2500);
    camera.position.set(0, 0, 800);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Group for the entire sphere assembly
    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // Inner Glow Sprite / Billboard
    const canvasGlow = document.createElement("canvas");
    canvasGlow.width = 256;
    canvasGlow.height = 256;
    const glowCtx = canvasGlow.getContext("2d");
    if (glowCtx) {
      const grad = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(90, 79, 208, 0.26)");
      grad.addColorStop(0.35, "rgba(90, 79, 208, 0.14)");
      grad.addColorStop(0.7, "rgba(90, 79, 208, 0.03)");
      grad.addColorStop(1, "rgba(90, 79, 208, 0.0)");
      glowCtx.fillStyle = grad;
      glowCtx.fillRect(0, 0, 256, 256);
    }
    const glowTexture = new THREE.CanvasTexture(canvasGlow);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    sphereGroup.add(glowSprite);

    // --- FIBONACCI SPHERE GEOMETRY & TYPED ARRAYS ---
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const baseUnitPositions = new Float32Array(PARTICLE_COUNT * 3);
    const displacements = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const shimmerRates = new Float32Array(PARTICLE_COUNT);
    const tints = new Float32Array(PARTICLE_COUNT);

    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2; // from 1 to -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Subtle organic radial jitter (+/- 2.5%)
      const jitter = 1 + (Math.random() - 0.5) * 0.05;
      baseUnitPositions[i * 3] = x * jitter;
      baseUnitPositions[i * 3 + 1] = y * jitter;
      baseUnitPositions[i * 3 + 2] = z * jitter;

      // Initial positions
      positions[i * 3] = x * jitter;
      positions[i * 3 + 1] = y * jitter;
      positions[i * 3 + 2] = z * jitter;

      // Base colors (cool white #dfe3ff)
      colors[i * 3] = BASE_COLOR.r;
      colors[i * 3 + 1] = BASE_COLOR.g;
      colors[i * 3 + 2] = BASE_COLOR.b;

      sizes[i] = 2.0;
      alphas[i] = 0.8;
      phases[i] = Math.random() * Math.PI * 2;
      shimmerRates[i] = 1.8 + Math.random() * 2.2;
      tints[i] = 0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("customColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("customAlpha", new THREE.BufferAttribute(alphas, 1));

    // Custom Shader Material for soft glowing circular points with additive blending
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
          // Soft circular falloff
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Smooth luminous bloom towards center
          float softEdge = smoothstep(0.5, 0.08, dist);
          float alpha = softEdge * vAlpha;

          gl_FragColor = vec4(vColor * alpha, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, shaderMaterial);
    sphereGroup.add(points);

    // Initial position, rotation and scaling parameters
    let sphereRadius = 180;
    let visibleHeightAtZ0 = 0;
    let visibleWidthAtZ0 = 0;
    let pxToWorld = 1;

    const updateProjectionMetrics = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      visibleHeightAtZ0 = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
      visibleWidthAtZ0 = visibleHeightAtZ0 * camera.aspect;
      pxToWorld = visibleWidthAtZ0 / width;

      // Position: dead-center horizontally (50% width) and vertically (50% height) -> world origin (0, 0, 0)
      const isMobile = width < 768;
      const targetScreenX = width * 0.5;
      const targetScreenY = height * 0.5;

      // Radius: ~17% width on desktop (~320px at 1884px wide), ~34% on mobile, clamped to height too
      const maxRadiusByHeight = height * 0.34;
      const screenRadius = isMobile
        ? Math.min(maxRadiusByHeight, Math.max(125, Math.min(width * 0.34, 220)))
        : Math.min(maxRadiusByHeight, Math.max(150, Math.min(width * 0.17, 330)));

      sphereRadius = screenRadius * pxToWorld;

      // Exact center (0, 0, 0) in world coordinates
      const worldX = (targetScreenX - width / 2) * pxToWorld;
      const worldY = -(targetScreenY - height / 2) * pxToWorld;
      sphereGroup.position.set(worldX, worldY, 0);

      // Scale inner glow sprite symmetrically around sphere center
      const glowScale = sphereRadius * 2.45;
      glowSprite.scale.set(glowScale, glowScale, 1);
    };

    updateProjectionMetrics();
    window.addEventListener("resize", updateProjectionMetrics);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateProjectionMetrics();
      });
      resizeObserver.observe(container);
    }

    // --- CURSOR TRACKING STATE ---
    let targetMouseX = -9999;
    let targetMouseY = -9999;
    let lerpedMouseX = -9999;
    let lerpedMouseY = -9999;
    let isMouseInHero = false;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
      isMouseInHero = true;
    };

    const onMouseLeave = () => {
      isMouseInHero = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    // --- LIFECYCLE & VISIBILITY OPTIMIZATIONS ---
    let isTabVisible = !document.hidden;
    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let isIntersecting = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // --- ANIMATION LOOP ---
    let animationFrameId = 0;
    let lastTime = performance.now();
    let currentRotationY = 0;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible || !isIntersecting) {
        lastTime = now;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const time = now * 0.001;

      // Idle Rotation
      currentRotationY += dt * ROTATION_SPEED_Y;
      points.rotation.y = currentRotationY;
      points.rotation.x = ROTATION_TILT_X;

      // Smooth cursor lerp
      if (isMouseInHero) {
        if (lerpedMouseX === -9999) {
          lerpedMouseX = targetMouseX;
          lerpedMouseY = targetMouseY;
        } else {
          lerpedMouseX += (targetMouseX - lerpedMouseX) * MOUSE_LERP_FACTOR;
          lerpedMouseY += (targetMouseY - lerpedMouseY) * MOUSE_LERP_FACTOR;
        }
      } else {
        // Relax virtual cursor outside
        lerpedMouseX += (-9999 - lerpedMouseX) * 0.05;
        lerpedMouseY += (-9999 - lerpedMouseY) * 0.05;
      }

      // Touch / Coarse Pointer Auto-Drift Virtual Cursor
      let activeCursorX = lerpedMouseX;
      let activeCursorY = lerpedMouseY;
      let cursorActive = isMouseInHero;

      if (isCoarsePointer && !isMouseInHero && !prefersReducedMotion) {
        const centerScreenX = width * 0.5;
        const centerScreenY = height * 0.5;
        const orbitRadius = (sphereRadius / pxToWorld) * 0.65;
        activeCursorX = centerScreenX + Math.cos(time * 0.8) * orbitRadius;
        activeCursorY = centerScreenY + Math.sin(time * 1.1) * (orbitRadius * 0.7);
        cursorActive = true;
      }

      // Precompute rotation matrices for point projection
      const cosY = Math.cos(currentRotationY);
      const sinY = Math.sin(currentRotationY);
      const cosX = Math.cos(ROTATION_TILT_X);
      const sinX = Math.sin(ROTATION_TILT_X);

      const groupPosX = sphereGroup.position.x;
      const groupPosY = sphereGroup.position.y;
      const groupPosZ = sphereGroup.position.z;
      const cameraZ = camera.position.z;

      const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colorAttr = geometry.attributes.customColor as THREE.BufferAttribute;
      const sizeAttr = geometry.attributes.size as THREE.BufferAttribute;
      const alphaAttr = geometry.attributes.customAlpha as THREE.BufferAttribute;

      // Update particle physics, bunching, trails, and depth lighting
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Base Fibonacci sphere unit coordinate
        const bx = baseUnitPositions[i3];
        const by = baseUnitPositions[i3 + 1];
        const bz = baseUnitPositions[i3 + 2];

        // Current displacement in sphere local units
        let dx = displacements[i3];
        let dy = displacements[i3 + 1];
        let dz = displacements[i3 + 2];
        let vx = velocities[i3];
        let vy = velocities[i3 + 1];
        let vz = velocities[i3 + 2];

        // Particle local coordinates on sphere
        const px = (bx + dx) * sphereRadius;
        const py = (by + dy) * sphereRadius;
        const pz = (bz + dz) * sphereRadius;

        // Apply local rotation (Y then X) to get oriented position
        const x1 = px * cosY + pz * sinY;
        const y1 = py;
        const z1 = -px * sinY + pz * cosY;

        const rx = x1;
        const ry = y1 * cosX - z1 * sinX;
        const rz = y1 * sinX + z1 * cosX;

        // World coordinates
        const wx = rx + groupPosX;
        const wy = ry + groupPosY;
        const wz = rz + groupPosZ;

        // Perspective camera screen projection
        const distZ = cameraZ - wz;
        const projScale = cameraZ / Math.max(10.0, distZ);
        const screenX = width * 0.5 + (wx * projScale) / pxToWorld;
        const screenY = height * 0.5 - (wy * projScale) / pxToWorld;

        // Distance to cursor in screen pixels
        const distToCursorX = screenX - activeCursorX;
        const distToCursorY = screenY - activeCursorY;
        const screenDist = Math.sqrt(distToCursorX * distToCursorX + distToCursorY * distToCursorY);

        let targetTint = 0;

        // Cursor attraction, organic bunching & clumping
        if (cursorActive && screenDist < INFLUENCE_RADIUS && !prefersReducedMotion) {
          const normDist = screenDist / INFLUENCE_RADIUS;
          // Soft exponential ease falloff
          const falloff = Math.exp(-screenDist / 42.0) * (1.0 - normDist);
          targetTint = Math.min(1.0, falloff * 1.35);

          // Attractive direction toward cursor in screen plane
          const dirX = -distToCursorX / (screenDist + 1e-4);
          const dirY = -distToCursorY / (screenDist + 1e-4);

          // Organic swirl & clumping deflection (tangential + curl noise)
          const tanX = -dirY;
          const tanY = dirX;
          const swirlFactor = 0.42 * Math.sin(i * 0.05 + time * 1.8);
          const clumpJitter = 0.28 * Math.cos(i * 0.12);

          const pullPxX = (dirX * (0.85 + clumpJitter) + tanX * swirlFactor) * falloff * 70.0;
          const pullPxY = (dirY * (0.85 + clumpJitter) + tanY * swirlFactor) * falloff * 70.0;

          // Convert screen pixel pull back to local sphere coordinate space
          const pullWorldX = (pullPxX * pxToWorld) / projScale;
          const pullWorldY = -(pullPxY * pxToWorld) / projScale;

          // Inverse rotation from world to local
          const invRy = pullWorldY * cosX;
          const invRz = pullWorldY * sinX;
          const localPullX = pullWorldX * cosY - invRz * sinY;
          const localPullY = invRy;
          const localPullZ = pullWorldX * sinY + invRz * cosY;

          // Apply attractive pull force
          const pullLocalScale = 1.0 / sphereRadius;
          vx += localPullX * pullLocalScale * 0.15;
          vy += localPullY * pullLocalScale * 0.15;
          vz += localPullZ * pullLocalScale * 0.15;
        }

        // Damped Spring Return to home position
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

        // Update Position Buffer
        positions[i3] = px;
        positions[i3 + 1] = py;
        positions[i3 + 2] = pz;

        // Smooth tint transition
        let currentTint = tints[i];
        currentTint += (targetTint - currentTint) * 0.14;
        tints[i] = currentTint;

        // Particle Color Lerp (Cool white -> Bright violet-blue #8f7fff / #a99bff)
        colors[i3] = BASE_COLOR.r + (TINT_COLOR.r - BASE_COLOR.r) * currentTint;
        colors[i3 + 1] = BASE_COLOR.g + (TINT_COLOR.g - BASE_COLOR.g) * currentTint;
        colors[i3 + 2] = BASE_COLOR.b + (TINT_COLOR.b - BASE_COLOR.b) * currentTint;

        // Depth Attenuation: front dots larger & brighter, back dots smaller & dimmer (semi-transparent)
        // rz ranges from -sphereRadius (back) to +sphereRadius (front)
        const depthFactor = Math.max(0.0, Math.min(1.0, (rz / sphereRadius + 1.0) * 0.5));
        const depthAlpha = 0.35 + 0.62 * depthFactor; // back ~0.35 alpha, front ~0.97 alpha

        // Shimmer twinkle
        const twinkle = 0.82 + 0.18 * Math.sin(time * shimmerRates[i] + phases[i]);
        alphas[i] = Math.min(1.0, depthAlpha * twinkle * (1.0 + currentTint * 0.5));

        // Depth & cursor proximity sizing (1.5x - 2x near cursor)
        const baseSize = 4.0 + 3.8 * depthFactor;
        sizes[i] = baseSize * (1.0 + currentTint * 0.85);
      }

      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateProjectionMetrics);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();

      geometry.dispose();
      shaderMaterial.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
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
