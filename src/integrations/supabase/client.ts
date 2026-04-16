import { createClient } from "@supabase/supabase-js";
import { appEnv, assertSupabaseConfigured } from "@/config/env";
import type { Database } from "./database.types";

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  assertSupabaseConfigured();

  supabaseClient = createClient<Database>(
    appEnv.supabaseUrl,
    appEnv.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  return supabaseClient;
}
