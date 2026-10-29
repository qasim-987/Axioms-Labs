import React from "react";

/**
 * Crisp white monoline / glyph SVG icons for the 3x2 "Tools" grid inside each active service card.
 * Maps every tool name in `src/data/services.ts` (`service.tools`) to an authentic vector icon.
 */
export function renderServiceToolIcon(toolName: string): React.ReactNode {
  const key = toolName.toLowerCase();

  // Figma
  if (key.includes("figma")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 3h3.5v7H8.5a3.5 3.5 0 0 1 0-7Z" />
        <path d="M12 3h3.5a3.5 3.5 0 1 1 0 7H12V3Z" />
        <path d="M12 10h3.5a3.5 3.5 0 1 1 0 7H12v-7Z" />
        <path d="M8.5 10H12v7H8.5a3.5 3.5 0 1 1 0-7Z" />
        <path d="M8.5 17H12v.5a3.5 3.5 0 1 1-3.5-3.5" />
      </svg>
    );
  }

  // Auto Layout & Variables / Design Tokens
  if (key.includes("auto layout") || key.includes("variable")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="7" height="17" rx="1.8" />
        <rect x="13.5" y="3.5" width="7" height="7.5" rx="1.8" />
        <rect x="13.5" y="13" width="7" height="7.5" rx="1.8" />
      </svg>
    );
  }

  // FigJam / Wireframing
  if (key.includes("figjam")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 3 21 9.5 17.5 20 6.5 20 3 9.5 12 3" />
        <path d="M12 3v17M3 9.5h18" />
      </svg>
    );
  }

  // Radix UI
  if (key.includes("radix")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h5a4 4 0 0 1 0 8H6V4Z" />
        <circle cx="8.5" cy="17.5" r="2.5" />
        <path d="M14 12l5 8" />
      </svg>
    );
  }

  // Tailwind CSS
  if (key.includes("tailwind")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10c1.3-2.7 3.3-4 6-4 4 0 4.7 3 6.7 3.5 1.3.3 2.5-.2 3.3-1.5-1.3 2.7-3.3 4-6 4-4 0-4.7-3-6.7-3.5C8 8.2 6.8 8.7 6 10Z" />
        <path d="M2 16c1.3-2.7 3.3-4 6-4 4 0 4.7 3 6.7 3.5 1.3.3 2.5-.2 3.3-1.5-1.3 2.7-3.3 4-6 4-4 0-4.7-3-6.7-3.5C4 14.2 2.8 14.7 2 16Z" />
      </svg>
    );
  }

  // Framer Motion
  if (key.includes("framer")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3h14v7H12L5 3Z" />
        <path d="M5 10h7l7 7H5v-7Z" />
        <path d="M5 17h7v4l-7-4Z" />
      </svg>
    );
  }

  // GSAP
  if (key.includes("gsap")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2Z" />
      </svg>
    );
  }

  // Lenis
  if (key.includes("lenis")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12c3.5-5 6.5-5 9 0s5.5 5 9 0" />
        <path d="M3 17c3.5-5 6.5-5 9 0s5.5 5 9 0" opacity="0.65" />
      </svg>
    );
  }

  // Three.js / WebGL 3D Mesh
  if (key.includes("three")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="4 4 20 8.5 9 20 4 4" />
        <polygon points="12 6.2 14.5 14.2 6.5 12 12 6.2" />
      </svg>
    );
  }

  // Next.js
  if (key.includes("next")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 16V8l8.5 10.5" />
        <path d="M15.5 8v5" />
      </svg>
    );
  }

  // React
  if (key.includes("react")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
      </svg>
    );
  }

  // TypeScript
  if (key.includes("typescript")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
        <path d="M7.5 10h5M10 10v6.5" />
        <path d="M17 11.2c-.6-.7-2.6-.6-2.6.6 0 1.8 2.8 1.1 2.8 3 0 1.3-2.1 1.4-2.9.5" />
      </svg>
    );
  }

  // Node.js
  if (key.includes("node")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2.8 20 7.4 20 16.6 12 21.2 4 16.6 4 7.4 12 2.8" />
        <path d="M9.5 14.8V9.2l5 5.6V9.2" />
      </svg>
    );
  }

  // Supabase
  if (key.includes("supabase")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 3L5 13.5h6.5L11 21l8-10.5h-6.5L13 3Z" />
      </svg>
    );
  }

  // PostgreSQL / Database
  if (key.includes("postgres")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
        <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </svg>
    );
  }

  // OpenAI
  if (key.includes("openai")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3a4.5 4.5 0 0 1 4.2 6.2A4.5 4.5 0 0 1 18.5 16a4.5 4.5 0 0 1-6.5 4.2A4.5 4.5 0 0 1 5.5 16a4.5 4.5 0 0 1 2.3-6.8A4.5 4.5 0 0 1 12 3Z" />
      </svg>
    );
  }

  // Anthropic Claude
  if (key.includes("claude") || key.includes("anthropic")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M7.5 4.2l9 15.6M16.5 4.2l-9 15.6" />
      </svg>
    );
  }

  // LangGraph / Agent Graph
  if (key.includes("langgraph")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="7" r="2.5" />
        <circle cx="12" cy="18" r="2.5" />
        <path d="M8.4 6.5l7.2.3M7.3 8.2l3.5 7.5M16.7 9.2l-3.5 6.6" />
      </svg>
    );
  }

  // Vercel / Vercel AI SDK
  if (key.includes("vercel")) {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 4 21 19.5 3 19.5 12 4" />
      </svg>
    );
  }

  // MCP / Tool Protocol
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <path d="M9 9.5L6.5 12 9 14.5M15 9.5l2.5 2.5-2.5 2.5M13 8.5l-2 7" />
    </svg>
  );
}

/** Allows responsive chips to fall back to text rather than a generic/broken logo. */
export function hasServiceToolIcon(name: string): boolean {
  const key=name.toLowerCase();
  return ["figma", "auto layout", "variable", "figjam", "radix", "tailwind", "framer", "gsap", "lenis", "three", "next", "react", "typescript", "node", "supabase", "postgres", "openai", "claude", "anthropic", "langgraph", "vercel"].some(term=>key.includes(term));
}
