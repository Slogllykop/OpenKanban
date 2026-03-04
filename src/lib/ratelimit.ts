import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Redis client (lazy - only created if correct env vars exist)
// ---------------------------------------------------------------------------

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

// ---------------------------------------------------------------------------
// Rate limiters (one per concern, re-used across requests)
// ---------------------------------------------------------------------------

/** Board page visits - prevents mass slug probing. 30 req / 60 s per IP. */
let boardVisitLimiter: Ratelimit | null = null;

export function getBoardVisitLimiter(): Ratelimit | null {
  if (boardVisitLimiter) return boardVisitLimiter;

  const r = getRedis();
  if (!r) return null;

  boardVisitLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(30, "60s"),
    prefix: "rl:board-visit",
  });
  return boardVisitLimiter;
}
