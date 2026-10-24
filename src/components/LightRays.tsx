import React from "react";

export default function LightRays() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden h-[950px]"
    >
      {/* Central Top Ambient Glow */}
      <div className="absolute -top-32 h-[420px] w-[700px] rounded-full bg-gradient-to-b from-brand-primary/25 via-brand-muted/15 to-transparent blur-3xl opacity-80" />

      {/* Main Conic Light Cone */}
      <div
        className="ray-conic animate-pulse-glow"
        style={{
          transformOrigin: "center top",
        }}
      />

      {/* Secondary Soft Ambient Radial Cone */}
      <div className="ray-glow" />

      {/* Subtle Dust / Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Bottom Fade to solid background */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#030303] via-[#030303]/80 to-transparent" />
    </div>
  );
}
