import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use a global variable to persist the client across hot reloads
const globalForSupabase = globalThis as unknown as { supabase?: ReturnType<typeof createSupabaseClient> };

export const supabase =
  globalForSupabase.supabase ??
  (globalForSupabase.supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey));

export function createClient() {
  return supabase;
}