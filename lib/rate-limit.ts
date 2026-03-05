/**
 * Simple in-memory rate limiter for form submission endpoints.
 * Uses a sliding window approach per IP address.
 *
 * For Vercel serverless: each function instance has its own Map,
 * so this provides per-instance limiting. For true distributed
 * rate limiting, use Upstash Redis or similar.
 */

const windowMs = 60_000; // 1 minute window
const maxRequests = 5; // max 5 submissions per window per IP

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically (every 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of ipMap) {
    if (now > entry.resetAt) ipMap.delete(key);
  }
}, 300_000);

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}
