/**
 * [NAME] Landing — single-shot first WebGL frame signal.
 *
 * The page-load intro must not start until `document.fonts.ready` AND the
 * WebGL scene has produced its first frame, otherwise the intro stutters.
 * `ParticleSphere` resolves this on its first render; the static fallback
 * resolves it immediately.
 */

let resolveFirstFrame: (() => void) | null = null;

export const firstFrameReady: Promise<void> = new Promise((res) => {
  resolveFirstFrame = res;
});

export function signalFirstFrame(): void {
  if (resolveFirstFrame) {
    resolveFirstFrame();
    resolveFirstFrame = null;
  }
}
