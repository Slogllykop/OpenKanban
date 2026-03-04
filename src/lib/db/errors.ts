/** Helper to throw proper Error objects from Supabase errors */
export function handleSupabaseError(error: unknown): never {
  if (error && typeof error === "object" && "message" in error) {
    const err = error as Record<string, unknown>;
    throw new Error(
      `Supabase Error: ${String(err.message)}${err.code ? ` (Code: ${String(err.code)})` : ""}${
        err.details ? ` Details: ${String(err.details)}` : ""
      }${err.hint ? ` Hint: ${String(err.hint)}` : ""}`,
    );
  }
  throw new Error(String(error));
}
