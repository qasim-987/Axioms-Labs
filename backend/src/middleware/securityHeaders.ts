import { Request, Response, NextFunction } from "express";

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
  res.setHeader("X-Powered-By", "Axiom-Studio-Engine/2.4");
  next();
}
