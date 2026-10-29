"use client";

import React from "react";
import Link from "next/link";
import { useTransitionContext } from "./TransitionProvider";

interface TransitionLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for `<a>` / `next/link` that plays the click transition
 * before navigating. Middle-click, Cmd/Ctrl/Shift clicks and `_blank` targets
 * fall back to native browser behaviour (new tab/window). Locked while a
 * transition is running, so double-clicks are ignored.
 */
export default function TransitionLink({
  href,
  children,
  className,
  ...props
}: TransitionLinkProps) {
  const { status, start } = useTransitionContext();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser handle modifier / middle clicks natively.
    if (
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    if ((e.currentTarget as HTMLAnchorElement).target === "_blank") {
      return;
    }
    // Lock while a transition is running (ignores double-clicks).
    if (status !== "idle") {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    void start(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}
