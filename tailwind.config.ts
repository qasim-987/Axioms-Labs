import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Google Antigravity (antigravity.google) Palette Tokens
        background: "#FFFFFF",
        ink: {
          DEFAULT: "#121317", // --palette-grey-1200 (Primary Ink & Primary Pill)
          hover: "#2F3034", // --palette-grey-900 (Primary Pill Hover)
          charcoal: "#202124", // Google Wordmark Charcoal
          secondary: "#45474D", // --palette-grey-800 (Body / On-Surface Variant)
          muted: "#6A6A71", // Disabled / Caption Ink
        },
        surface: {
          0: "#FFFFFF", // --palette-grey-0
          10: "#F8F9FC", // --palette-grey-10 (Surface Container)
          15: "#F0F1F5", // --palette-grey-15 (Secondary Pill Hover)
          20: "#EFF2F7", // --palette-grey-20 (Surface Container High)
          50: "#E6EAF0", // --palette-grey-50 (Surface Container Higher)
          100: "#E1E6EC", // --palette-grey-100 (Surface Container Highest)
          200: "#CDD4DC", // --palette-grey-200
          300: "#B2BBC5", // --palette-grey-300 (Muted Text on Dark Cards)
          400: "#B7BFD9", // --palette-grey-400 (Periwinkle Tonal Tint)
          dark: "#121317", // Inverse Dark Card Surface
        },
        brand: {
          light: "#749BFF", // Antigravity Soft Periwinkle Blue
          primary: "#3186FF", // Antigravity Electric Blue
          hover: "#1B6EF3", // Electric Blue Hover
          muted: "#45474D",
          dark: "#121317", // Antigravity Primary Obsidian
          glow: "rgba(49, 134, 255, 0.18)",
        },
        ag: {
          blue: "#3186FF",
          periwinkle: "#749BFF",
          red: "#FC413D",
          yellow: "#FBBC04",
          lemon: "#FFE432",
          green: "#00B95C",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "marquee-reverse": "marquee-reverse 28s linear infinite",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        "beam-sweep": "beamSweep 8s ease-in-out infinite",
        "beam-pulse": "beamPulse 7s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.03)" },
        },
        beamPulse: {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1.0" },
        },
        beamSweep: {
          "0%, 100%": { transform: "rotate(-15deg)" },
          "50%": { transform: "rotate(15deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
