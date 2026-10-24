import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axiom Labs — Enterprise AI Architecture & Digital Engineering",
  description:
    "Axiom Labs designs and engineers enterprise autonomous agent systems, high-throughput AI infrastructure, precision design systems, and digital flagship platforms.",
  keywords: [
    "Axiom Labs",
    "AI Architecture",
    "Autonomous Agents",
    "Enterprise AI",
    "Next.js Engineering",
    "Digital Design Systems",
    "Cloud Infrastructure"
  ],
  authors: [{ name: "Axiom Labs Engineering" }],
  openGraph: {
    title: "Axiom Labs — Enterprise AI Architecture & Digital Engineering",
    description:
      "Enterprise autonomous agent systems, high-throughput AI infrastructure, precision design systems, and digital flagship platforms.",
    url: "https://axiomlabs.agency",
    siteName: "Axiom Labs",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom Labs — Enterprise AI Architecture & Digital Engineering",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#030303] text-zinc-100 antialiased selection:bg-brand-primary selection:text-white font-sans overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
