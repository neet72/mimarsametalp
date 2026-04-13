import "server-only";

import { LRUCache } from "lru-cache";

type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; remaining: 0; resetAt: number; retryAfterSec: number };

type Bucket = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as {
  __adminRateLimit?: LRUCache<string, Bucket>;
};

function getCache() {
  if (!globalForRateLimit.__adminRateLimit) {
    globalForRateLimit.__adminRateLimit = new LRUCache<string, Bucket>({
      // TTL'yi biz resetAt ile yöneteceğiz; memory bound için max yeterli.
      max: 10_000,
    });
  }
  return globalForRateLimit.__adminRateLimit;
}

/**
 * Basit fixed-window rate limit (instance-local).
 * Not: Serverless ortamda instance bazlıdır; küçük projelerde hızlı koruma sağlar.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const cache = getCache();
  const now = Date.now();

  const existing = cache.get(key);
  if (!existing || existing.resetAt <= now) {
    const bucket: Bucket = { count: 1, resetAt: now + windowMs };
    cache.set(key, bucket);
    return { ok: true, remaining: Math.max(0, limit - 1), resetAt: bucket.resetAt };
  }

  const nextCount = existing.count + 1;
  const bucket: Bucket = { count: nextCount, resetAt: existing.resetAt };
  cache.set(key, bucket);

  if (nextCount > limit) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { ok: false, remaining: 0, resetAt: bucket.resetAt, retryAfterSec };
  }

  return { ok: true, remaining: Math.max(0, limit - nextCount), resetAt: bucket.resetAt };
}

