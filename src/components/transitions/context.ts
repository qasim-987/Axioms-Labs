"use client";
import { createContext, useContext } from "react";
export type TransitionPhase = "idle" | "covering" | "waiting" | "revealing";
export interface TransitionContextValue {
  phase: TransitionPhase;
  destination: string | null;
  navigate: (href: string, options?: { replace?: boolean }) => void;
}
export const PageTransitionContext = createContext<TransitionContextValue | null>(null);
export function usePageTransition() {
  const value = useContext(PageTransitionContext);
  if (!value) throw new Error("usePageTransition requires PageTransitionProvider");
  return value;
}
