/**
 * In-process rate limiter — a sliding window per key (IP + route).
 *
 * Honest limitation, stated up front: this lives in the Node process, so with
 * several instances behind a load balancer each instance keeps its own counter
 * and the effective limit is (limit × instances). That is acceptable for abuse
 * damping on a single-workshop booking form. For strict global limits, swap
 * `hit()` for Redis/Upstash — the call signature is deliberately tiny so the
 * adapter can be replaced in one file.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the oldest hit leaves the window. */
  retryAfter: number;
};

export function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_KEYS) {
      // Cheap eviction: drop already-expired buckets before growing further.
      for (const [k, b] of buckets) {
        if (b.hits.length === 0 || b.hits[b.hits.length - 1]! < cutoff) buckets.delete(k);
        if (buckets.size < MAX_KEYS / 2) break;
      }
    }
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }

  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  return { allowed: true, remaining: limit - bucket.hits.length, retryAfter: 0 };
}

/** Best-effort client identifier. Never stored, never sent to analytics. */
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip')) || 'unknown';
  return `${scope}:${ip.trim()}`;
}

/** Test helper. */
export function resetRateLimits(): void {
  buckets.clear();
}
