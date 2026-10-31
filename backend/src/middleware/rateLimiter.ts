import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

interface Bucket {
  timestamps: number[];
}

/**
 * Hard ceiling on in-memory buckets. Without it, a single request per spoofed IP
 * grows this Map forever — 20k distinct IPs allocated ~20k buckets in 39ms.
 */
const MAX_BUCKETS = 5000;

const buckets = new Map<string, Bucket>();

const upstashEnabled = Boolean(env.upstashRedisRestUrl && env.upstashRedisRestToken);
let inMemoryWarningEmitted = false;

function pruneExpired(now: number, windowMs: number): void {
  for (const [key, bucket] of buckets.entries()) {
    bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

/** Prune first; if still at the ceiling, drop the oldest-inserted buckets (Map keeps insertion order). */
function enforceBucketCap(now: number, windowMs: number): void {
  if (buckets.size < MAX_BUCKETS) return;

  pruneExpired(now, windowMs);
  if (buckets.size < MAX_BUCKETS) return;

  let toRemove = buckets.size - MAX_BUCKETS + 1;
  for (const key of buckets.keys()) {
    if (toRemove <= 0) break;
    buckets.delete(key);
    toRemove -= 1;
  }
}

function localCount(key: string, now: number, windowMs: number): number {
  enforceBucketCap(now, windowMs);
  const bucket = buckets.get(key) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);
  buckets.set(key, bucket);
  return bucket.timestamps.length;
}

function localRecord(key: string, now: number): void {
  buckets.get(key)?.timestamps.push(now);
}

interface UpstashPipelineResponse {
  results?: Array<{ result?: number }>;
}

/**
 * Fixed-window count via the Upstash REST pipeline API, using the platform `fetch`
 * so no dependency is added. Returns null on any failure so the caller can fall
 * back to the in-memory limiter instead of taking the contact form down.
 */
async function upstashCount(key: string, windowSeconds: number): Promise<number | null> {
  try {
    const response = await fetch(env.upstashRedisRestUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.upstashRedisRestToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pipeline: [
          ["INCR", key],
          ["EXPIRE", key, windowSeconds],
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`[RATE LIMIT] Upstash responded ${response.status}; falling back to the in-memory limiter.`);
      return null;
    }

    const data = (await response.json()) as UpstashPipelineResponse;
    const result = data.results?.[0]?.result;
    return typeof result === "number" ? result : null;
  } catch (error) {
    console.warn("[RATE LIMIT] Upstash unreachable; falling back to the in-memory limiter.", error);
    return null;
  }
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix } = options;
  const windowSeconds = Math.ceil(windowMs / 1000);

  if (!upstashEnabled && !inMemoryWarningEmitted) {
    inMemoryWarningEmitted = true;
    console.warn(
      "[RATE LIMIT] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not both set, so rate limiting is " +
        "best-effort only: state lives in this process's memory, is not shared between instances, and resets on " +
        "every serverless cold start. Set both variables for a limit that actually holds in production.",
    );
  }

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const now = Date.now();

    /**
     * Use Express's `req.ip`, which applies the configured `trust proxy` hop count and
     * therefore ignores attacker-supplied leftmost X-Forwarded-For entries. Reading the
     * leftmost entry directly let a client rotate one header value per request and get an
     * unlimited number of attempts.
     */
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${clientIp}`;

    const reject = (retryAfterSeconds: number): void => {
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", now + retryAfterSeconds * 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      res.status(429).json({
        error: "Too many requests. Please wait before submitting another inquiry.",
      });
    };

    try {
      if (upstashEnabled) {
        const remoteCount = await upstashCount(key, windowSeconds);

        if (remoteCount !== null) {
          // INCR counts every attempt, so rejected requests extend the window. That is
          // deliberate here: the endpoint being protected is a spam target.
          if (remoteCount > maxRequests) {
            reject(windowSeconds);
            return;
          }
          res.setHeader("X-RateLimit-Limit", maxRequests);
          res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - remoteCount));
          next();
          return;
        }
      }

      const count = localCount(key, now, windowMs);
      if (count >= maxRequests) {
        reject(windowSeconds);
        return;
      }

      localRecord(key, now);
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - (count + 1)));
      next();
    } catch (error) {
      /** Fail open: a limiter defect must never make the contact form unreachable. */
      console.error("[RATE LIMIT] unexpected failure, allowing request:", error);
      next();
    }
  };
}

/**
 * Client IP as Express resolved it. Kept for logging parity; it deliberately does not
 * read X-Forwarded-For itself, because that header is attacker-controlled at the leftmost
 * position and must only be interpreted through the configured `trust proxy` hop count.
 */
export function extractClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

// Periodic garbage collection to prune stale entries.
setInterval(() => {
  pruneExpired(Date.now(), 15 * 60 * 1000);
}, 60 * 1000).unref();
