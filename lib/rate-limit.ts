import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitState {
  buckets: Map<string, Bucket>;
  lastPrunedAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var safeRouteRateLimitState: RateLimitState | undefined;
}

const state = globalThis.safeRouteRateLimitState ??= {
  buckets: new Map<string, Bucket>(),
  lastPrunedAt: 0
};
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const address = request.headers.get("x-real-ip")?.trim()
    || forwarded?.split(",")[0]?.trim()
    || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

export function checkRateLimit(
  request: NextRequest,
  route: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  if (now - state.lastPrunedAt > windowMs) {
    for (const [key, bucket] of state.buckets) {
      if (bucket.resetAt <= now) state.buckets.delete(key);
    }
    state.lastPrunedAt = now;
  }

  const key = `${route}:${clientKey(request)}`;
  let bucket = state.buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (state.buckets.size >= MAX_BUCKETS) {
      const oldestKey = state.buckets.keys().next().value;
      if (oldestKey) state.buckets.delete(oldestKey);
    }
    bucket = { count: 0, resetAt: now + windowMs };
    state.buckets.set(key, bucket);
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    limit,
    remaining: limit - bucket.count,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.retryAfterSeconds),
    ...(result.allowed ? {} : { "Retry-After": String(result.retryAfterSeconds) })
  };
}
