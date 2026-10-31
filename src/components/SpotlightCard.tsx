"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MOTION_EASE } from "@/lib/motionTokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  tilt?: boolean;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = "",
  delay = 0,
  tilt = false,
  spotlightColor = "rgba(49, 134, 255, 0.08)",
}: SpotlightCardProps) {
  const prefersReduced = useReducedMotion();
  const [coords, setCoords] = useState({ x: 180, y: 120 });
  const [transformStyle, setTransformStyle] = useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0px, 0px, 0px)"
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (tilt && !prefersReduced) {
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      setTransformStyle(
        `perspective(1000px) rotateX(${(-ny * 4.5).toFixed(
          2
        )}deg) rotateY(${(nx * 4.5).toFixed(2)}deg) translate3d(0px, -3px, 0px)`
      );
    }
  };

  const handleMouseLeave = () => {
    if (tilt) {
      setTransformStyle(
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0px, 0px, 0px)"
      );
    }
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        // `prefersReduced` resolves after mount (see useReducedMotion), so the
        // `initial={false}` shortcut above cannot apply on the first render.
        // Zero the transition instead so reduced-motion users still get the
        // instant, zero-motion reveal required by Animations.md §12.3.
        duration: prefersReduced ? 0 : 0.65,
        delay: prefersReduced ? 0 : delay,
        ease: MOTION_EASE.cinematicOut,
      }}
      style={
        {
          "--mouse-x": `${coords.x}px`,
          "--mouse-y": `${coords.y}px`,
          ...(tilt && !prefersReduced ? { transform: transformStyle } : {}),
        } as React.CSSProperties
      }
      className={`group relative overflow-hidden transition-[border-color,background-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${className}`}
    >
      {/* Pointer-Tracked Radial Glass Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: `radial-gradient(480px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 45%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}
