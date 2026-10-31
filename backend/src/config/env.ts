export interface BackendEnv {
  port: number;
  host: string;
  nodeEnv: string;
  isProduction: boolean;
  /** Number of trusted reverse-proxy hops Express strips before reading X-Forwarded-For. */
  trustProxyHops: number;
  /** Canonical site origin, used as the CORS/Origin fallback when no allowlist is set. */
  siteUrl: string;
  /** Ordered origin allowlist. Entries may contain a single `*` wildcard (e.g. `https://axioms-labs*.vercel.app`). */
  corsAllowedOrigins: string[];
  resendApiKey: string;
  contactNotificationEmail: string;
  contactWebhookUrl: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  /** Optional distributed rate-limit store. Both must be set to activate; no extra dependency is used. */
  upstashRedisRestUrl: string;
  upstashRedisRestToken: string;
}

/**
 * Fail closed on NODE_ENV: an unset variable must behave like production, not like
 * development. Express's default error page only renders stack traces when NODE_ENV
 * is anything other than "production", so a forgotten variable silently turned a
 * deployed API into a stack-trace oracle.
 */
const nodeEnv = process.env.NODE_ENV || "production";
const isProduction = nodeEnv === "production";

/**
 * Project-scoped Vercel pattern rather than a blanket `*.vercel.app`: it covers the
 * production alias (axioms-labs.vercel.app) plus every deployment/preview alias
 * (axioms-labs-<hash>-axiomic.vercel.app, axioms-labs-git-<branch>-axiomic.vercel.app)
 * without also trusting every other customer's vercel.app subdomain.
 * Override the whole allowlist with CORS_ALLOWED_ORIGINS if the project is renamed.
 */
const VERCEL_PREVIEW_PATTERN = "https://axioms-labs*.vercel.app";

const DEFAULT_SITE_URL = "https://axiomstudio.agency";

function parseOriginList(raw: string): string[] {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildAllowedOrigins(): string[] {
  const origins = new Set<string>([VERCEL_PREVIEW_PATTERN]);

  const explicit = parseOriginList(process.env.CORS_ALLOWED_ORIGINS || "");
  if (explicit.length > 0) {
    explicit.forEach((origin) => origins.add(origin));
  } else {
    origins.add(process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
  }

  if (!isProduction) {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return Array.from(origins);
}

export const env: BackendEnv = {
  port: Number(process.env.PORT || 4000),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv,
  isProduction,
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 1),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
  corsAllowedOrigins: buildAllowedOrigins(),
  resendApiKey: process.env.RESEND_API_KEY || "",
  contactNotificationEmail: process.env.CONTACT_NOTIFICATION_EMAIL || "",
  contactWebhookUrl: process.env.CONTACT_WEBHOOK_URL || "",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || "",
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || "",
};

/** Match one allowlist entry, supporting a single `*` wildcard without regex backtracking. */
function matchesPattern(candidate: string, pattern: string): boolean {
  if (pattern === candidate) return true;
  const wildcardIndex = pattern.indexOf("*");
  if (wildcardIndex === -1) return false;

  const prefix = pattern.slice(0, wildcardIndex);
  const suffix = pattern.slice(wildcardIndex + 1);
  return (
    candidate.startsWith(prefix) &&
    candidate.endsWith(suffix) &&
    candidate.length >= prefix.length + suffix.length
  );
}

/**
 * True when `origin` is on the allowlist. Callers decide what to do with an empty
 * origin: browsers always attach an Origin to a cross-site POST, so an absent one
 * means a non-browser client (curl, the Next.js rewrite proxy) rather than a CSRF.
 */
export function isAllowedOrigin(origin: string): boolean {
  const candidate = origin.trim().toLowerCase();
  if (!candidate) return false;
  return env.corsAllowedOrigins.some((allowed) => matchesPattern(candidate, allowed.toLowerCase()));
}

/** Derive an origin (`scheme://host[:port]`) from a full URL such as a Referer header. */
export function originFromUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.origin;
  } catch {
    return "";
  }
}
