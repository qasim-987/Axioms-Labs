import type { Metadata } from "next";
import BrandShell from "@/components/landing/BrandShell";
import IntroController from "@/components/landing/IntroController";
import BrandNavbar from "@/components/landing/BrandNavbar";
import Landing from "@/components/landing/Landing";

export const metadata: Metadata = {
  title: "[NAME] — Digital Products & Brand Experiences",
  description:
    "We craft digital products and brand experiences that perform across every screen.",
  openGraph: {
    title: "[NAME] — Digital Products & Brand Experiences",
    description:
      "We craft digital products and brand experiences that perform across every screen.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="relative min-h-svh flex flex-col">
      <BrandShell>
        <IntroController>
          <BrandNavbar />
          <Landing />
        </IntroController>
      </BrandShell>
    </div>
  );
}
