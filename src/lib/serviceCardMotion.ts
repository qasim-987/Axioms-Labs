/** Shared desktop/touch card phases; do not alter particle morph timing. */
export const CARD_TRANSITION = {
  EXIT_START: .15, EXIT_END: .60, EXIT_WIDTH_RATIO: .35,
  INK_START: .45, INK_END: .80, CONTENT_START: .80,
  OUT_END: .25, CONTENT_STAGGER: .025, UI_SWAP: .50,
  INK_RADIUS: 150, DOT_MS: 250,
} as const;
export const SERVICE_CARD_COLOR = "#403E7C";
export const cardPhase = (t:number, a:number, b:number) => Math.max(0, Math.min(1, (t-a)/(b-a)));
