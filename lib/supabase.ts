import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Browser-safe client. Only ever used for read-only queries (RLS allows select only). */
export const supabaseAnon = createClient(url, anonKey);

/**
 * Server-only client that bypasses Row Level Security. Never import this file
 * from a "use client" component — the service role key must not reach the browser.
 */
export const supabaseAdmin = createClient(url, serviceRoleKey ?? anonKey, {
  auth: { persistSession: false },
});
