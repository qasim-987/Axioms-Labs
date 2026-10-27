"use client";

import React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

export default function ScrollProgressBar() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 32,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        background:
          "linear-gradient(90deg, #3186FF 0%, #749BFF 35%, #FC413D 65%, #FBBC04 84%, #00B95C 100%)",
      }}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none will-change-transform"
    />
  );
}
