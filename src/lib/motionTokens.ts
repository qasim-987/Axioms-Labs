export const MOTION_EASE = {
  // Signature antimatterai.agency cinematic deceleration
  cinematicOut: [0.16, 1, 0.3, 1] as const,
  // Slot-machine / odometer vertical digit roll
  odometer: [0.22, 1, 0.36, 1] as const,
  // Smooth symmetric ambient loop
  ambientInOut: [0.45, 0, 0.55, 1] as const,
};

export const MOTION_SPRING = {
  snappy: { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.8 },
  magnetic: { type: "spring" as const, stiffness: 180, damping: 18, mass: 0.4 },
};

export const STAGGER = {
  char: 0.022,
  word: 0.055,
  card: 0.08,
  digitCol: 0.12,
};
