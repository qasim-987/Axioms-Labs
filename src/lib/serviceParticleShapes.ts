/**
 * Data-driven 3D Point-Cloud Generators for the "Our Services" Particle-Morph Section.
 * Every generator outputs a `Float32Array` of length `count * 3` normalized roughly to `[-1, 1]`
 * so any shape morphs seamlessly into any other shape on the GPU.
 */

export type ServiceShapeId =
  | "blob"
  | "wireframe"
  | "brackets"
  | "growthChart"
  | "dnaHelix";

/**
 * Data-driven pairing of Axiom Studio's 4 existing services (`src/data/services.ts`)
 * to their 3D particle shapes and presentation order matching the reference frames:
 *   01 UI/UX Design    -> wireframe (3D hollow UI browser/layout frame with inner panels)
 *   02 Web Designing   -> brackets  (3D extruded </> code & creative markup symbol)
 *   03 Web Development -> growthChart (ascending 3D performance bars + rising arrow)
 *   04 AI Agents       -> dnaHelix  (rotating 3D double helix with rungs)
 */
export const SERVICE_STAGE_ORDER: {
  slug: string;
  shape: ServiceShapeId;
}[] = [
  { slug: "ui-ux-design", shape: "wireframe" },
  { slug: "web-designing", shape: "brackets" },
  { slug: "web-development", shape: "growthChart" },
  { slug: "ai-agents", shape: "dnaHelix" },
];

// Deterministic PRNG (Mulberry32) so SSR/CSR & repeated mounts generate identical point clouds
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianJitter(rng: () => number, scale: number): number {
  const u1 = Math.max(1e-6, rng());
  const u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * scale;
}

function sampleSegment3D(
  rng: () => number,
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
  thicknessXY: number,
  depthZ: number
): [number, number, number] {
  const t = rng();
  const x = ax + (bx - ax) * t + gaussianJitter(rng, thicknessXY);
  const y = ay + (by - ay) * t + gaussianJitter(rng, thicknessXY);
  const z = az + (bz - az) * t + (rng() - 0.5) * depthZ + gaussianJitter(rng, depthZ * 0.22);
  return [x, y, z];
}

/**
 * 0. Fuzzy Spherical Stardust Blob (Initial state + transition midpoint archetype)
 * Denser glowing core with soft fuzzy outer stardust shell.
 */
export function generateBlobPoints(count: number, seed = 101): Float32Array {
  const rng = createRng(seed);
  const out = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = rng();
    const cosPhi = 2 * rng() - 1;
    const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
    const theta = rng() * Math.PI * 2;

    // 84% core-weighted ball, 16% outer atmospheric stardust halo
    const isHalo = rng() < 0.16;
    const radius = isHalo
      ? 0.92 + rng() * 0.34
      : 0.95 * Math.pow(u, 0.56);

    const i3 = i * 3;
    out[i3] = radius * sinPhi * Math.cos(theta);
    out[i3 + 1] = radius * cosPhi;
    out[i3 + 2] = radius * sinPhi * Math.sin(theta);
  }

  return out;
}

/**
 * 1. UI/UX Design -> 3D Hollow Wireframe Window / Layout Frame with Two Inner Panels
 * Shown with real 3D Z-extrusion & front/back frame rails so slight Y-rotation reveals depth.
 */
export function generateWireframePoints(count: number, seed = 202): Float32Array {
  const rng = createRng(seed);
  const out = new Float32Array(count * 3);

  const W = 0.92; // half-width
  const H = 0.68; // half-height
  const D = 0.24; // full Z depth
  const headerY = 0.36; // browser top chrome bar
  const splitX = -0.18; // asymmetric sidebar / main panel divider

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x = 0;
    let y = 0;
    let z = 0;

    if (pick < 0.46) {
      // Outer hollow rectangular walls (top, bottom, left, right extruded in Z)
      const edge = Math.floor(rng() * 4);
      const wallJitter = 0.048;
      if (edge === 0) {
        [x, y, z] = sampleSegment3D(rng, -W, H, 0, W, H, 0, wallJitter, D);
      } else if (edge === 1) {
        [x, y, z] = sampleSegment3D(rng, -W, -H, 0, W, -H, 0, wallJitter, D);
      } else if (edge === 2) {
        [x, y, z] = sampleSegment3D(rng, -W, -H, 0, -W, H, 0, wallJitter, D);
      } else {
        [x, y, z] = sampleSegment3D(rng, W, -H, 0, W, H, 0, wallJitter, D);
      }
    } else if (pick < 0.64) {
      // Top UI header divider bar + 3 window dots on top-left
      if (rng() < 0.18) {
        const dotIdx = Math.floor(rng() * 3);
        const cx = -W + 0.18 + dotIdx * 0.12;
        const cy = (H + headerY) * 0.5;
        const angle = rng() * Math.PI * 2;
        const r = rng() * 0.032;
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
        z = D * 0.45 + gaussianJitter(rng, 0.02);
      } else {
        [x, y, z] = sampleSegment3D(rng, -W, headerY, 0, W, headerY, 0, 0.036, D * 0.85);
      }
    } else if (pick < 0.78) {
      // Vertical center/sidebar divider separating left & right UI panels
      [x, y, z] = sampleSegment3D(rng, splitX, -H, 0, splitX, headerY, 0, 0.036, D * 0.8);
    } else if (pick < 0.92) {
      // Two inner wireframe content cards inside right panel + horizontal split
      const sub = rng();
      if (sub < 0.5) {
        // Inner card box outline in right workspace
        const x0 = splitX + 0.14;
        const x1 = W - 0.14;
        const y0 = -0.02;
        const y1 = headerY - 0.13;
        const side = Math.floor(rng() * 4);
        if (side === 0) [x, y, z] = sampleSegment3D(rng, x0, y1, 0, x1, y1, 0, 0.025, D * 0.45);
        else if (side === 1) [x, y, z] = sampleSegment3D(rng, x0, y0, 0, x1, y0, 0, 0.025, D * 0.45);
        else if (side === 2) [x, y, z] = sampleSegment3D(rng, x0, y0, 0, x0, y1, 0, 0.025, D * 0.45);
        else [x, y, z] = sampleSegment3D(rng, x1, y0, 0, x1, y1, 0, 0.025, D * 0.45);
      } else {
        // Bottom two mini wireframe slots
        const x0 = splitX + 0.14;
        const x1 = W - 0.14;
        const ym = -0.16;
        const yb = -H + 0.15;
        if (rng() < 0.5) {
          [x, y, z] = sampleSegment3D(rng, x0, ym, 0, x1, ym, 0, 0.024, D * 0.45);
        } else {
          [x, y, z] = sampleSegment3D(rng, (x0 + x1) * 0.5, yb, 0, (x0 + x1) * 0.5, ym, 0, 0.024, D * 0.45);
        }
      }
    } else {
      // Subtle ambient dust halo around the 3D wireframe box
      x = (rng() * 2 - 1) * (W * 1.12);
      y = (rng() * 2 - 1) * (H * 1.12);
      z = (rng() * 2 - 1) * (D * 0.9);
    }

    // Slight 3D perspective yaw so depth reads immediately
    const yaw = -0.22;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const rx = x * cosY + z * sinY;
    const rz = -x * sinY + z * cosY;

    const i3 = i * 3;
    out[i3] = rx;
    out[i3 + 1] = y;
    out[i3 + 2] = rz;
  }

  return out;
}

/**
 * 2. Web Designing -> Crisp 3D Extruded Code / Creative Markup Symbol `< / >`
 */
export function generateBracketsPoints(count: number, seed = 303): Float32Array {
  const rng = createRng(seed);
  const out = new Float32Array(count * 3);

  const strokeXY = 0.052;
  const depthZ = 0.22;

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x = 0;
    let y = 0;
    let z = 0;

    if (pick < 0.31) {
      // Left `<` bracket (2 strokes meeting at apex (-0.98, 0))
      if (rng() < 0.5) {
        [x, y, z] = sampleSegment3D(rng, -0.42, 0.52, 0, -0.98, 0.0, 0, strokeXY, depthZ);
      } else {
        [x, y, z] = sampleSegment3D(rng, -0.98, 0.0, 0, -0.42, -0.52, 0, strokeXY, depthZ);
      }
    } else if (pick < 0.62) {
      // Right `>` bracket (2 strokes meeting at apex (+0.98, 0))
      if (rng() < 0.5) {
        [x, y, z] = sampleSegment3D(rng, 0.42, 0.52, 0, 0.98, 0.0, 0, strokeXY, depthZ);
      } else {
        [x, y, z] = sampleSegment3D(rng, 0.98, 0.0, 0, 0.42, -0.52, 0, strokeXY, depthZ);
      }
    } else if (pick < 0.91) {
      // Center slanted slash `/`
      [x, y, z] = sampleSegment3D(rng, -0.22, -0.68, 0, 0.22, 0.68, 0, strokeXY * 1.05, depthZ);
    } else {
      // Soft atmospheric stardust around symbol
      const angle = rng() * Math.PI * 2;
      const r = 0.35 + rng() * 0.78;
      x = Math.cos(angle) * r;
      y = (rng() * 2 - 1) * 0.75;
      z = (rng() - 0.5) * 0.42;
    }

    const i3 = i * 3;
    out[i3] = x;
    out[i3 + 1] = y;
    out[i3 + 2] = z;
  }

  return out;
}

/**
 * 3. Web Development -> Ascending 3D Bar Chart + Rising Diagonal Growth Arrow
 */
export function generateGrowthChartPoints(count: number, seed = 404): Float32Array {
  const rng = createRng(seed);
  const out = new Float32Array(count * 3);

  const baseY = -0.72;
  const barHalfW = 0.115;
  const barDepthZ = 0.22;
  const bars = [
    { cx: -0.66, topY: -0.24 },
    { cx: -0.22, topY: 0.04 },
    { cx: 0.22, topY: 0.32 },
    { cx: 0.66, topY: 0.62 },
  ];

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x = 0;
    let y = 0;
    let z = 0;

    if (pick < 0.62) {
      // Sample across the 4 ascending 3D bars (weighted slightly toward taller bars so density stays uniform)
      const weights = [0.16, 0.22, 0.28, 0.34];
      const rBar = rng();
      let acc = 0;
      let bIdx = 3;
      for (let k = 0; k < 4; k++) {
        acc += weights[k];
        if (rBar <= acc) {
          bIdx = k;
          break;
        }
      }
      const bar = bars[bIdx];
      // Surface-weighted 3D prism so bar edges read crisply
      const onShell = rng() < 0.68;
      if (onShell) {
        const face = Math.floor(rng() * 4);
        y = baseY + rng() * (bar.topY - baseY);
        if (face === 0) {
          x = bar.cx - barHalfW + gaussianJitter(rng, 0.014);
          z = (rng() - 0.5) * barDepthZ;
        } else if (face === 1) {
          x = bar.cx + barHalfW + gaussianJitter(rng, 0.014);
          z = (rng() - 0.5) * barDepthZ;
        } else if (face === 2) {
          x = bar.cx + (rng() * 2 - 1) * barHalfW;
          z = barDepthZ * 0.5 + gaussianJitter(rng, 0.014);
        } else {
          // Top cap concentration
          x = bar.cx + (rng() * 2 - 1) * barHalfW;
          y = bar.topY + gaussianJitter(rng, 0.018);
          z = (rng() - 0.5) * barDepthZ;
        }
      } else {
        x = bar.cx + (rng() * 2 - 1) * barHalfW;
        y = baseY + rng() * (bar.topY - baseY);
        z = (rng() - 0.5) * barDepthZ;
      }
    } else if (pick < 0.68) {
      // Subtle baseline axis
      [x, y, z] = sampleSegment3D(rng, -0.88, baseY, 0, 0.88, baseY, 0, 0.02, 0.14);
    } else if (pick < 0.85) {
      // Rising diagonal growth arrow shaft above the bars
      [x, y, z] = sampleSegment3D(rng, -0.78, -0.02, 0.04, 0.78, 0.88, 0.04, 0.036, 0.16);
    } else if (pick < 0.94) {
      // Crisp arrowhead wings at top-right (0.78, 0.88)
      if (rng() < 0.5) {
        [x, y, z] = sampleSegment3D(rng, 0.78, 0.88, 0.04, 0.48, 0.86, 0.04, 0.034, 0.16);
      } else {
        [x, y, z] = sampleSegment3D(rng, 0.78, 0.88, 0.04, 0.74, 0.58, 0.04, 0.034, 0.16);
      }
    } else {
      // Ambient stardust
      x = (rng() * 2 - 1) * 0.95;
      y = (rng() * 2 - 1) * 0.88;
      z = (rng() - 0.5) * 0.45;
    }

    const i3 = i * 3;
    out[i3] = x;
    out[i3 + 1] = y;
    out[i3 + 2] = z;
  }

  return out;
}

/**
 * 4. AI Agents -> Vertical 3D DNA Double Helix with Intertwined Strands & Rungs
 */
export function generateDnaHelixPoints(count: number, seed = 505): Float32Array {
  const rng = createRng(seed);
  const out = new Float32Array(count * 3);

  const radius = 0.46;
  const heightHalf = 0.94;
  const turns = 1.85; // ~1.85 full helical twists across vertical height
  const rungCount = 11;
  const tiltZ = 0.18; // Slight graceful diagonal tilt matching reference frames
  const cosT = Math.cos(tiltZ);
  const sinT = Math.sin(tiltZ);

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x = 0;
    let y = 0;
    let z = 0;

    if (pick < 0.64) {
      // Two intertwined helical backbone strands (A & B phase-shifted by PI)
      const isStrandB = rng() < 0.5;
      const u = rng(); // 0..1 bottom to top
      y = -heightHalf + u * (heightHalf * 2);
      const theta = u * Math.PI * 2 * turns + (isStrandB ? Math.PI : 0);

      x = radius * Math.cos(theta) + gaussianJitter(rng, 0.042);
      z = radius * Math.sin(theta) + gaussianJitter(rng, 0.042);
      y += gaussianJitter(rng, 0.025);
    } else if (pick < 0.91) {
      // Horizontal base-pair rungs connecting Strand A and Strand B
      const rungIdx = Math.floor(rng() * rungCount);
      const u = (rungIdx + 0.5) / rungCount;
      const rungY = -heightHalf + u * (heightHalf * 2);
      const theta = u * Math.PI * 2 * turns;

      const ax = radius * Math.cos(theta);
      const az = radius * Math.sin(theta);
      const bx = radius * Math.cos(theta + Math.PI);
      const bz = radius * Math.sin(theta + Math.PI);

      const s = rng();
      x = ax + (bx - ax) * s + gaussianJitter(rng, 0.026);
      y = rungY + gaussianJitter(rng, 0.022);
      z = az + (bz - az) * s + gaussianJitter(rng, 0.026);
    } else {
      // Soft ambient dust enveloping the helix cylinder
      const u = rng();
      const angle = rng() * Math.PI * 2;
      const r = rng() * (radius * 1.45);
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
      y = -heightHalf + u * (heightHalf * 2);
    }

    // Apply slight Z-axis tilt so helix leans subtly like the reference recording
    const tx = x * cosT - y * sinT;
    const ty = x * sinT + y * cosT;

    const i3 = i * 3;
    out[i3] = tx;
    out[i3 + 1] = ty;
    out[i3 + 2] = z;
  }

  return out;
}

export function buildAllServiceShapes(
  count: number
): Record<ServiceShapeId, Float32Array> {
  return {
    blob: generateBlobPoints(count, 101),
    wireframe: generateWireframePoints(count, 202),
    brackets: generateBracketsPoints(count, 303),
    growthChart: generateGrowthChartPoints(count, 404),
    dnaHelix: generateDnaHelixPoints(count, 505),
  };
}
