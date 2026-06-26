"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Browser Supabase client. Used by the admin login/logout flow. Persists the
 * session in cookies (via @supabase/ssr) so Server Components can read it.
 *
 * Only call this when `hasSupabaseEnv()` is true — otherwise it will throw
 * because the public env vars are missing.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
