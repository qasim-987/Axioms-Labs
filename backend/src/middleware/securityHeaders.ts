import { Request, Response, NextFunction } from "express";

/**
 * Enforced policy, deliberately narrow: this API serves JSON and renders no HTML, so the
 * only frame-related directive worth enforcing is the anti-clickjacking one. The full
 * script/style policy lives in the frontend's `next.config.mjs`, where the markup that has
 * to satisfy it actually exists.
 */
const ENFORCED_CSP = "frame-ancestors 'self'";

/** One year, no preload. Preload list membership is effectively irreversible. */
const HSTS = "max-age=31536000";

export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.setHeader("X-DNS-Prefetch-Control", "off");
  /**
   * X-Powered-By is intentionally not set. `app.disable("x-powered-by")` already removes
   * Express's own value; re-adding a banner here handed back the engine name and version
   * it was meant to suppress.
   */
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Strict-Transport-Security", HSTS);
  res.setHeader("Content-Security-Policy", ENFORCED_CSP);
  next();
}
