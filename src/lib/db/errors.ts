/**
 * Handle Supabase errors safely.
 *
 * Full error details (message, code, hints) are logged server-side for
 * debugging. Only a generic message is thrown to the client to avoid
 * leaking database internals (table names, constraint details, RPC
 * signatures). See: Security Audit Finding #2.
 */
export function handleSupabaseError(error: unknown): never {
  // Log full details server-side for debugging
  console.error("[Supabase Error]", error);

  // Throw a generic message to the client
  throw new Error("An unexpected error occurred. Please try again.");
}
