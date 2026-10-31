/**
 * Tracks `prefers-reduced-motion: reduce` with live updates.
 *
 * SSR-safe by construction: the value is `false` during the server render AND
 * during the client's first (hydration) render, so the markup React hydrates
 * against is identical to the server HTML. The real preference is resolved in
 * an effect immediately after mount.
 *
 * This matters because `framer-motion`'s own `useReducedMotion()` resolves the
 * media query *synchronously during render*. On the server that yields
 * `false`; on the client's first render it yields the real value. Any
 * component that branches on it therefore renders different markup on the
 * server and the client, which React reports as a hydration mismatch
 * (error #418, followed by #423 when the root falls back to client rendering).
 *
 * Always import this hook — not the one from `framer-motion` — in any
 * component whose rendered output depends on the reduced-motion preference.
 */

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(mq.matches);
    const handler = () => setPrefers(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefers;
}
