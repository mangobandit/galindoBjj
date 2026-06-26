import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseEnv } from "./env";
import type { Database } from "./types";

/**
 * Server Supabase client (Server Components, Server Actions, Route Handlers).
 * Returns `null` when Supabase is not configured yet, so callers can render a
 * friendly setup notice instead of crashing.
 */
export async function createClient() {
  // Read cookies first (even if we bail) so any route using this client is
  // treated as dynamic — admin pages must never be statically cached.
  const cookieStore = await cookies();

  if (!hasSupabaseEnv()) return null;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // The middleware refreshes the session cookie instead.
          }
        },
      },
    },
  );
}
