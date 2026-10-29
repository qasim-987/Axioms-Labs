/**
 * [NAME] Landing — gate the page-load intro on webfonts + first WebGL frame.
 */

import { useEffect, useState } from "react";
import { firstFrameReady } from "@/lib/firstFrame";

export function useAppReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready
        : Promise.resolve(),
      firstFrameReady,
    ]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
