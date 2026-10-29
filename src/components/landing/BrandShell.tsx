"use client";

import React, { useEffect } from "react";
import { BRAND } from "@/lib/landingConfig";

/**
 * Applies the [NAME] brand canvas (near-black background, white text, dark
 * scrollbar) to the document for the landing route only. Other routes keep the
 * repository's default theme. Reverted on unmount so route changes stay clean.
 */
export default function BrandShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.documentElement.classList.add("brand-dark");
    document.documentElement.style.background = BRAND.bg;
    document.documentElement.style.color = BRAND.text;
    document.body.style.background = BRAND.bg;
    document.body.style.color = BRAND.text;

    return () => {
      document.documentElement.classList.remove("brand-dark");
      document.documentElement.style.background = "";
      document.documentElement.style.color = "";
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);

  return <>{children}</>;
}
