import { Request, Response, NextFunction } from "express";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsedNs = Number(process.hrtime.bigint() - startedAt);
    const durationMs = (elapsedNs / 1_000_000).toFixed(2);

    if (req.path !== "/api/health") {
      console.log(
        JSON.stringify({
          service: "axiom-studio-backend",
          timestamp: new Date().toISOString(),
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs: Number(durationMs),
        })
      );
    }
  });

  next();
}
