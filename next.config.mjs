/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
        ],
      },
    ];
  },
};

export default nextConfig;
