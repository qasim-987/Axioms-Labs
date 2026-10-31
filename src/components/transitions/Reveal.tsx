import type { ReactNode } from "react";
export default function Reveal({ children, mode = "fade-up", className }: {
  children: ReactNode;
  mode?: "lines" | "fade-up" | "stagger-children";
  className?: string;
}) {
  return <div data-reveal={mode} className={className}>{children}</div>;
}
