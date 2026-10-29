import { createSeededRandom } from "@/lib/particleEngine";

/**
 * Data-driven 3D Point-Cloud Generators for the "Our Services" Particle-Morph Section.
 * Every generator outputs a `Float32Array` of length `count * 3` normalized roughly to `[-1, 1]`
 * so any shape morphs seamlessly into any other shape on the GPU.
 */

export type ServiceShapeId =
  | "wireframe"
  | "brackets"
  | "growthChart"
  | "dnaHelix";

/**
 * Data-driven pairing of Axiom Studio's 4 existing services (`src/data/services.ts`)
 * to their 3D particle shapes:
 *   01 UI/UX Design    -> wireframe   (3D hollow UI wireframe / browser outline with two inner panels)
 *   02 Web Development -> brackets    (3D extruded </> code brackets)
 *   03 Web Designing   -> growthChart (ascending 3D conversion/performance bars + rising arrow)
 *   04 AI Agents       -> dnaHelix    (rotating vertical 3D DNA double helix with horizontal rungs)
 */
export const SERVICE_STAGE_ORDER: {
  slug: string;
  shape: ServiceShapeId;
}[] = [
  { slug: "ui-ux-design", shape: "wireframe" },
  { slug: "web-development", shape: "brackets" },
  { slug: "web-designing", shape: "growthChart" },
  { slug: "ai-agents", shape: "dnaHelix" },
];

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
  const z =
    az +
    (bz - az) * t +
    (rng() - 0.5) * depthZ +
    gaussianJitter(rng, depthZ * 0.22);
  return [x, y, z];
}

/**
 * 1. UI/UX Design -> Hollow 3D Rectangular UI Wireframe / Browser Frame
 * Dense outer walls (~13% thickness), browser top chrome bar, and a center vertical divider
 * forming two hollow inner panels with an empty interior, rotated in slight 3D perspective.
 */
export function generateWireframePoints(
  count: number,
  seed = 202
): Float32Array {
  const rng = createSeededRandom(seed);
  const out = new Float32Array(count * 3);

  const W = 0.92; // outer half-width (total width = 1.84)
  const H = 0.68; // outer half-height (total height = 1.36)
  const wallT = 0.23; // ~12.5-13.5% dense hollow-box wall thickness
  const D = 0.28; // 3D box depth so perspective reads as a hollow frame
  const headerY = 0.34; // top browser header bar
  const dividerX = -0.04; // center/two-panel vertical divider

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x = 0;
    let y = 0;
    let z = 0;

    if (pick < 0.58) {
      // Dense hollow outer box walls (~13% thick), leaving interior panels empty
      const side = Math.floor(rng() * 4);
      const u = (rng() - 0.5) * wallT + gaussianJitter(rng, 0.014);
      z = (rng() - 0.5) * D + gaussianJitter(rng, 0.018);

      if (side === 0) {
        // Top wall band
        x = (rng() * 2 - 1) * W;
        y = H - wallT * 0.5 + u;
      } else if (side === 1) {
        // Bottom wall band
        x = (rng() * 2 - 1) * W;
        y = -H + wallT * 0.5 + u;
      } else if (side === 2) {
        // Left wall band
        x = -W + wallT * 0.5 + u;
        y = (rng() * 2 - 1) * (H - wallT * 0.6);
      } else {
        // Right wall band
        x = W - wallT * 0.5 + u;
        y = (rng() * 2 - 1) * (H - wallT * 0.6);
      }
    } else if (pick < 0.75) {
      // Top browser window divider bar + 3 window chrome dots
      if (rng() < 0.16) {
        const dotIdx = Math.floor(rng() * 3);
        const cx = -W + wallT + 0.08 + dotIdx * 0.11;
        const cy = (H - wallT * 0.5 + headerY) * 0.5;
        const angle = rng() * Math.PI * 2;
        const r = rng() * 0.028;
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
        z = D * 0.44 + gaussianJitter(rng, 0.018);
      } else {
        [x, y, z] = sampleSegment3D(
          rng,
          -W + wallT * 0.5,
          headerY,
          0,
          W - wallT * 0.5,
          headerY,
          0,
          0.032,
          D * 0.85
        );
      }
    } else if (pick < 0.94) {
      // Center vertical divider splitting the hollow interior into two clean panels
      [x, y, z] = sampleSegment3D(
        rng,
        dividerX,
        -H + wallT * 0.5,
        0,
        dividerX,
        headerY,
        0,
        0.036,
        D * 0.85
      );
    } else {
      // Subtle stardust halo around the outer 3D frame edges
      const angle = rng() * Math.PI * 2;
      x = Math.cos(angle) * (W * (0.95 + rng() * 0.16));
      y = Math.sin(angle) * (H * (0.95 + rng() * 0.16));
      z = (rng() * 2 - 1) * (D * 0.85);
    }

    // Slight 3D perspective yaw & pitch so it immediately reads as a hollow 3D box
    const yaw = -0.24;
    const pitch = 0.08;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const rx = x * cosY + z * sinY;
    const rz1 = -x * sinY + z * cosY;

    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const ry = y * cosX - rz1 * sinX;
    const rz = y * sinX + rz1 * cosX;

    const i3 = i * 3;
    out[i3] = rx;
    out[i3 + 1] = ry;
    out[i3 + 2] = rz;
  }

  return out;
}

/**
 * 2. Web Development -> Crisp 3D Extruded Code Brackets `< / >`
 */
export function generateBracketsPoints(
  count: number,
  seed = 303
): Float32Array {
  const rng = createSeededRandom(seed);
  const out = new Float32Array(count * 3);

  const strokeXY = 0.052;
  const depthZ = 0.22;

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x = 0;
    let y = 0;
    let z = 0;

    if (pick < 0.31) {
      if (rng() < 0.5) {
        [x, y, z] = sampleSegment3D(
          rng,
          -0.42,
          0.52,
          0,
          -0.98,
          0.0,
          0,
          strokeXY,
          depthZ
        );
      } else {
        [x, y, z] = sampleSegment3D(
          rng,
          -0.98,
          0.0,
          0,
          -0.42,
          -0.52,
          0,
          strokeXY,
          depthZ
        );
      }
    } else if (pick < 0.62) {
      if (rng() < 0.5) {
        [x, y, z] = sampleSegment3D(
          rng,
          0.42,
          0.52,
          0,
          0.98,
          0.0,
          0,
          strokeXY,
          depthZ
        );
      } else {
        [x, y, z] = sampleSegment3D(
          rng,
          0.98,
          0.0,
          0,
          0.42,
          -0.52,
          0,
          strokeXY,
          depthZ
        );
      }
    } else if (pick < 0.91) {
      [x, y, z] = sampleSegment3D(
        rng,
        -0.22,
        -0.68,
        0,
        0.22,
        0.68,
        0,
        strokeXY * 1.05,
        depthZ
      );
    } else {
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
 * 3. Web Designing -> Ascending 3D Bar Chart + Rising Diagonal Growth Arrow
 */
export function generateGrowthChartPoints(
  count: number,
  seed = 404
): Float32Array {
  const rng = createSeededRandom(seed);
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
      [x, y, z] = sampleSegment3D(
        rng,
        -0.88,
        baseY,
        0,
        0.88,
        baseY,
        0,
        0.02,
        0.14
      );
    } else if (pick < 0.85) {
      [x, y, z] = sampleSegment3D(
        rng,
        -0.78,
        -0.02,
        0.04,
        0.78,
        0.88,
        0.04,
        0.036,
        0.16
      );
    } else if (pick < 0.94) {
      if (rng() < 0.5) {
        [x, y, z] = sampleSegment3D(
          rng,
          0.78,
          0.88,
          0.04,
          0.48,
          0.86,
          0.04,
          0.034,
          0.16
        );
      } else {
        [x, y, z] = sampleSegment3D(
          rng,
          0.78,
          0.88,
          0.04,
          0.74,
          0.58,
          0.04,
          0.034,
          0.16
        );
      }
    } else {
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
 * 4. AI Agents -> Vertical 3D DNA Double Helix with Intertwined Strands & Horizontal Rungs
 */
export function generateDnaHelixPoints(
  count: number,
  seed = 505
): Float32Array {
  const rng = createSeededRandom(seed);
  const out = new Float32Array(count * 3);

  const radius = 0.46;
  const heightHalf = 0.94;
  const turns = 1.85;
  const rungCount = 11;
  const tiltZ = 0.16;
  const cosT = Math.cos(tiltZ);
  const sinT = Math.sin(tiltZ);

  for (let i = 0; i < count; i++) {
    const pick = rng();
    let x = 0;
    let y = 0;
    let z = 0;

    if (pick < 0.64) {
      const isStrandB = rng() < 0.5;
      const u = rng();
      y = -heightHalf + u * (heightHalf * 2);
      const theta = u * Math.PI * 2 * turns + (isStrandB ? Math.PI : 0);

      x = radius * Math.cos(theta) + gaussianJitter(rng, 0.042);
      z = radius * Math.sin(theta) + gaussianJitter(rng, 0.042);
      y += gaussianJitter(rng, 0.025);
    } else if (pick < 0.91) {
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
      const u = rng();
      const angle = rng() * Math.PI * 2;
      const r = rng() * (radius * 1.45);
      x = Math.cos(angle) * r;
      z = Math.sin(angle) * r;
      y = -heightHalf + u * (heightHalf * 2);
    }

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
    wireframe: generateWireframePoints(count, 202),
    brackets: generateBracketsPoints(count, 303),
    growthChart: generateGrowthChartPoints(count, 404),
    dnaHelix: generateDnaHelixPoints(count, 505),
  };
}
