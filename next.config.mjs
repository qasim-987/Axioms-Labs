/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Suppress Next.js's own `X-Powered-By: Next.js`. The acceptance criteria for this change
   * are "no X-Powered-By"; the backend banner was already removed in securityHeaders.ts, but
   * the frontend was still advertising its framework on every response.
   */
  poweredByHeader: false,
  async redirects() {
    return [
      // Redirect removed competitor-cloned demo/resource routes cleanly
      {
        source: "/demos/:path*",
        destination: "/services/ai-agents",
        permanent: false,
      },
      {
        source: "/resources/:path*",
        destination: "/#services",
        permanent: false,
      },
      {
        source: "/vendor-matrix",
        destination: "/#services",
        permanent: false,
      },
      {
        source: "/red-team-demo",
        destination: "/services/ai-agents",
        permanent: false,
      },
      {
        source: "/open-antimatter",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/open-axiom",
        destination: "/work",
        permanent: false,
      },
      {
        source: "/lie-detector-demo",
        destination: "/services/ai-agents",
        permanent: true,
      },
      {
        source: "/data-center-map",
        destination: "/company",
        permanent: true,
      },
      {
        source: "/emotion-ai",
        destination: "/services/ai-agents",
        permanent: true,
      },
      {
        source: "/atom-intentiq",
        destination: "/services/ai-agents",
        permanent: true,
      },
      {
        source: "/atom/:path*",
        destination: "/services/ai-agents",
        permanent: true,
      },
      // Redirect legacy service slugs to the 4 core Axiom Studio services
      {
        source: "/services/product-design",
        destination: "/services/ui-ux-design",
        permanent: true,
      },
      {
        source: "/services/development",
        destination: "/services/web-development",
        permanent: true,
      },
      {
        source: "/services/gtm-strategy",
        destination: "/services/web-designing",
        permanent: true,
      },
      {
        source: "/services/healthcare-apps",
        destination: "/services/web-development",
        permanent: true,
      },
      {
        source: "/services/ai-development",
        destination: "/services/ai-agents",
        permanent: true,
      },
      {
        source: "/services/iot-development",
        destination: "/services/web-development",
        permanent: true,
      },
      {
        source: "/services/cybersecurity",
        destination: "/services/web-development",
        permanent: true,
      },
      {
        source: "/services/agentic-systems",
        destination: "/services/ai-agents",
        permanent: true,
      },
      {
        source: "/services/enterprise-infrastructure",
        destination: "/services/web-development",
        permanent: true,
      },
      // Redirect legacy fake client slugs to honest Studio Concept Builds
      {
        source: "/work/strata-systems",
        destination: "/work/nexus-commerce-os",
        permanent: true,
      },
      {
        source: "/work/zenith-health",
        destination: "/work/aura-web-experience",
        permanent: true,
      },
      {
        source: "/work/talitrix-iot",
        destination: "/work/finflow-design-system",
        permanent: true,
      },
      {
        source: "/work/vanguard-capital",
        destination: "/work/atlas-ai-agent",
        permanent: true,
      },
      {
        source: "/work/aether-biotech",
        destination: "/work/aura-web-experience",
        permanent: true,
      },
      {
        source: "/work/meridian-logistics",
        destination: "/work/nexus-commerce-os",
        permanent: true,
      },
      {
        source: "/work/kinetix-robotics",
        destination: "/work/finflow-design-system",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    /**
     * Enforced policy, deliberately limited to frame-ancestors. The rest of the policy ships
     * as Report-Only below and must be reviewed against real violation reports before it is
     * enforced, because promoting it early is the kind of change that silently breaks the site.
     *
     * Note: X-Frame-Options SAMEORIGIN + frame-ancestors 'self' block this site from being
     * rendered in a cross-origin iframe — including the Vercel dashboard preview and embedded
     * IDE/platform previews (docs/03-TECHNICAL-ARCHITECTURE.md:238 flags this).
     */
    const enforcedCsp = "frame-ancestors 'self'";

    /**
     * Report-Only policy derived from the actual production build, not from assumptions:
     *   - every <script src> is a relative /_next/static/chunks/* file (0 external origins)
     *   - 6-8 inline <script> tags per page, including Next's self.__next_f RSC flight data
     *     and the JSON-LD blocks, so script-src needs 'unsafe-inline'
     *   - 0 inline <style> tags but 47-301 inline style="" attributes per page, plus GSAP and
     *     framer-motion writing styles via CSSOM, so style-src needs 'unsafe-inline'
     *   - 0 occurrences of eval( or new Function( across all 32 shipped chunks, so
     *     'unsafe-eval' is NOT required and is intentionally omitted
     *   - no next/font, no Google Fonts, no analytics, no next/script, and no absolute
     *     client-side fetch(), so font-src and connect-src need only 'self'
     */
    const reportOnlyCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // One year, no preload: preload-list membership is effectively irreversible.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Content-Security-Policy", value: enforcedCsp },
          { key: "Content-Security-Policy-Report-Only", value: reportOnlyCsp },
        ],
      },
    ];
  },
};

export default nextConfig;
