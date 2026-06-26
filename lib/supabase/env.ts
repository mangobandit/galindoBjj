/**
 * The app is built to boot even before Supabase is configured, so the public
 * marketing pages render during a fresh `npm run dev` or a static preview.
 * Anything that actually needs the database checks this first and degrades to
 * a friendly "not configured yet" state instead of crashing.
 */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
