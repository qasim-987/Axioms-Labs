import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

// Periodic GC so memory remains bounded under sustained load
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [key, bucket] of buckets.entries()) {
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    if (bucket.timestamps.length === 0) {
      buckets.delete(key);
    }
  }
}, 60_000).unref();

export function extractClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const clientIp = extractClientIp(req);
    const key = `${keyPrefix}:${clientIp}`;

    const bucket = buckets.get(key) || { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

    const remaining = Math.max(0, maxRequests - bucket.timestamps.length);
    const resetSeconds = Math.ceil(windowMs / 1000);

    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, remaining - 1)));
    res.setHeader("X-RateLimit-Reset", String(resetSeconds));

    if (bucket.timestamps.length >= maxRequests) {
      res.setHeader("Retry-After", String(resetSeconds));
      res.status(429).json({
        error: "Rate limit exceeded. Please wait a few minutes before retrying.",
        retryAfterSeconds: resetSeconds,
      });
      return;
    }

    bucket.timestamps.push(now);
    buckets.set(key, bucket);
    next();
  };
}
