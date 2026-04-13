import { rateLimit } from "@/lib/security/rate-limit";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export function checkContactRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const rl = rateLimit(`contact:${ip}`, MAX_REQUESTS, WINDOW_MS);
  if (!rl.ok) return { ok: false, retryAfterSec: rl.retryAfterSec };
  return { ok: true };
}
