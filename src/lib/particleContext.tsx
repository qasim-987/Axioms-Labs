/**
 * [NAME] Landing — shared particle sphere API so the services section can
 * drive the same persistent canvas that lives behind the hero.
 *
 * Module-level (no React context) so it is safe during SSR and needs no
 * provider in the component tree. `ParticleSphere` registers itself on mount;
 * `ServicesSection` consumes it to drive morph targets.
 */

import type { MorphTargetName } from "@/lib/morphTargets";

export interface ParticleAPI {
  setTarget: (name: MorphTargetName) => void;
  setMorph: (value: number) => void;
  getMorph: () => number;
  ready: boolean;
}

let currentApi: ParticleAPI | null = null;

export function registerParticleAPI(api: ParticleAPI) {
  currentApi = api;
  return () => {
    if (currentApi === api) {
      currentApi = null;
    }
  };
}

export function useParticleAPI() {
  return { api: currentApi, register: registerParticleAPI };
}
