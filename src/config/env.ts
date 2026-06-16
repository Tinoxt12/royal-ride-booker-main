export const appEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "",
};

export const isSupabaseConfigured =
  Boolean(appEnv.supabaseUrl) && Boolean(appEnv.supabaseAnonKey);

export function assertSupabaseConfigured() {
  if (isSupabaseConfigured) return;

  throw new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
  );
}
