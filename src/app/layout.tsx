import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/latin-300.css";
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-600.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import "@fontsource/plus-jakarta-sans/latin-800-italic.css";
import "./globals.css";
import TransitionErrorBoundary from "@/components/transitions/TransitionErrorBoundary";
import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/config/site";
import jakarta400 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff2";
import jakarta700 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2";
import jakarta800 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2";
import jakarta800i from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-italic.woff2";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Axioms Lab — UI/UX Web Design, Web Development & AI Agents",
  description:
    "Axioms Lab offers UI/UX Web Design, Web Development, and AI Agents to help businesses create clear customer experiences, reliable digital products, and practical automation. Operating from Kuopio, Finland and Lahore, Pakistan for clients worldwide.",
  keywords: [
    "Axioms Lab",
    "Web Development",
    "UI/UX Web Design",
    "AI Agents",
    "Next.js Agency",
    "Figma Design Systems",
    "Kuopio Web Agency",
    "Lahore Software Lab",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    title: "Axioms Lab — UI/UX Web Design, Web Development & AI Agents",
    description:
      "UI/UX Web Design, Web Development, and Practical AI Agents — Kuopio, Finland & Lahore, Pakistan.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og/axioms-lab-og.png`,
        width: 1200,
        height: 630,
        alt: "Axioms Lab — AXL monogram with wordmark and service line",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axioms Lab — UI/UX Web Design, Web Development & AI Agents",
    description:
      "UI/UX Web Design, Web Development, and Practical AI Agents.",
    images: [`${SITE_URL}/og/axioms-lab-og.png`],
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
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/axl-monogram-512.png`,
  email: SITE_EMAIL,
  description:
    "Digital design, web engineering, and AI lab operating in Kuopio, Finland and Lahore, Pakistan.",
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
    "UI/UX Web Design",
    "AI Agents",
    "Next.js & TypeScript",
    "Figma Design Systems",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Above-the-fold brand weights: preload so first paint is already final typography. */}
      <head>
        {[jakarta400, jakarta700, jakarta800, jakarta800i].map((href) => (
          <link key={href} rel="preload" as="font" type="font/woff2" href={href} crossOrigin="anonymous" />
        ))}
      </head>
      <body className="font-sans min-h-screen bg-[#FFFFFF] text-[#121317] antialiased selection:bg-[#3186FF] selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#121317] focus:text-white focus:rounded-full focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ScrollProgressBar />
        <SmoothScrollProvider><TransitionErrorBoundary fallback={children}><PageTransitionProvider>{children}</PageTransitionProvider></TransitionErrorBoundary></SmoothScrollProvider>
      </body>
    </html>
  );
}
