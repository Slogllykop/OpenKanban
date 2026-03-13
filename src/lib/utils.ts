import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ADJECTIVES, NOUNS } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a UUID v4 string.
 * Prefers `crypto.randomUUID()` when available (secure contexts only),
 * otherwise falls back to `crypto.getRandomValues()` which works everywhere.
 */
export function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback: RFC 4122 v4 UUID using getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Compute a length-safe topic for Supabase Realtime channels.
 * Supabase has a strict limit of 255 characters per topic (including internal prefixes).
 * For long slugs, we truncate and append a short deterministic hash
 * to maintain uniqueness without exceeding the limit. We cap at 200 to be safe.
 */
export function getChannelTopic(prefix: string, slug: string): string {
  const topic = `${prefix}:${slug}`;
  if (topic.length <= 200) return topic;

  // Simple djb2 hash to keep ID unique after truncation
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 33) ^ slug.charCodeAt(i);
  }
  const hexHash = (hash >>> 0).toString(16);

  // Fit prefix, truncated slug, separator, and hex hash under 200 chars
  const truncateLength = 200 - prefix.length - hexHash.length - 3;
  return `${prefix}:${slug.slice(0, Math.max(0, truncateLength))}-${hexHash}`;
}

/**
 * Generates a random human-readable slug consisting of an adjective, a noun,
 * and a cryptographic random hex segment.
 * Useful for creating unique, memorable board identifiers.
 *
 * Finding #11: Uses crypto.getRandomValues() for 8 hex characters (~4 billion
 * possibilities per adjective-noun combo), significantly increasing entropy
 * over the previous 4-digit number (~9,000 possibilities).
 *
 * @returns A string in the format "adjective-noun-a3f9b2c1".
 */
export function generateRandomSlug(): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${hex}`;
}
