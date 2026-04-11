/**
 * Bellek tabanlı rate limit — tek Node süreci içinde IP başına pencere.
 * Üretimde çoklu instance için Upstash Redis / benzeri önerilir.
 */
const hitsByIp = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

function prune(now: number) {
  for (const [ip, times] of hitsByIp) {
    const fresh = times.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) hitsByIp.delete(ip);
    else hitsByIp.set(ip, fresh);
  }
}

export function checkContactRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);

  const list = hitsByIp.get(ip) ?? [];
  if (list.length >= MAX_REQUESTS) {
    const oldest = Math.min(...list);
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  list.push(now);
  hitsByIp.set(ip, list);
  return { ok: true };
}
