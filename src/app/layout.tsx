import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/latin-300.css";
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-600.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import "@fontsource/plus-jakarta-sans/latin-800-italic.css";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://axiomstudio.agency"),
  title: "Axiom Studio — Web Development, Web Designing, UI/UX & AI Agents",
  description:
    "Axiom Studio crafts custom web applications, high-converting web designs, intuitive UI/UX design systems, and practical AI agents. Operating from Kuopio, Finland and Lahore, Pakistan for clients worldwide.",
  keywords: [
    "Axiom Studio",
    "Web Development",
    "Web Designing",
    "UI/UX Design",
    "AI Agents",
    "Next.js Agency",
    "Figma Design Systems",
    "Kuopio Web Agency",
    "Lahore Software Studio",
  ],
  authors: [{ name: "Axiom Studio" }],
  openGraph: {
    title: "Axiom Studio — Web Development, Web Designing, UI/UX & AI Agents",
    description:
      "Custom Web Development, High-Converting Web Designing, Product UI/UX Design, and Practical AI Agents — Kuopio, Finland & Lahore, Pakistan.",
    url: "https://axiomstudio.agency",
    siteName: "Axiom Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom Studio — Web Development, Web Designing, UI/UX & AI Agents",
    description:
      "Custom Web Development, High-Converting Web Designing, Product UI/UX Design, and Practical AI Agents.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Axiom Studio",
  url: "https://axiomstudio.agency",
  email: "contact@axiomstudio.agency",
  description:
    "Digital design, web engineering, and AI agent studio operating in Kuopio, Finland and Lahore, Pakistan.",
  areaServed: "Worldwide",
  location: [
    {
      "@type": "Place",
      name: "Kuopio, Finland",
    },
    {
      "@type": "Place",
      name: "Lahore, Pakistan",
    },
  ],
  knowsAbout: [
    "Web Development",
    "Web Designing",
    "UI/UX Design",
    "AI Agents",
    "Next.js & TypeScript",
    "Figma Design Systems",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-[#FFFFFF] text-[#121317] antialiased selection:bg-[#3186FF] selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#121317] focus:text-white focus:rounded-full focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ScrollProgressBar />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
