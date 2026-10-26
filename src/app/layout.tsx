import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://axiomstudio.agency"),
  title: "Axiom Studio — Enterprise AI Architecture & Digital Engineering",
  description:
    "Axiom Studio designs and engineers enterprise autonomous agent systems, high-throughput AI infrastructure, precision design systems, and digital flagship platforms.",
  keywords: [
    "Axiom Studio",
    "AI Architecture",
    "Autonomous Agents",
    "Enterprise AI",
    "Next.js Engineering",
    "Digital Design Systems",
    "Cloud Infrastructure",
  ],
  authors: [{ name: "Axiom Studio Engineering" }],
  openGraph: {
    title: "Axiom Studio — Enterprise AI Architecture & Digital Engineering",
    description:
      "Enterprise autonomous agent systems, high-throughput AI infrastructure, precision design systems, and digital flagship platforms.",
    url: "https://axiomstudio.agency",
    siteName: "Axiom Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom Studio — Enterprise AI Architecture & Digital Engineering",
    description:
      "Enterprise autonomous agent systems, high-throughput AI infrastructure, precision design systems, and digital flagship platforms.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Axiom Studio",
  url: "https://axiomstudio.agency",
  email: "contact@axiomstudio.agency",
  description:
    "Enterprise AI architecture, autonomous agent systems, and precision digital engineering studio.",
  areaServed: "Worldwide",
  knowsAbout: [
    "Autonomous AI Agents",
    "Model Context Protocol (MCP)",
    "Enterprise LLM Infrastructure",
    "Next.js Web Engineering",
    "UI/UX Design Systems",
    "HIPAA Healthcare Software",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#030303] text-zinc-100 antialiased selection:bg-brand-primary selection:text-white font-sans overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ScrollProgressBar />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
