const rawUseMockData = import.meta.env.VITE_USE_MOCK_DATA;

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() !== "false";
};

export const appEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.trim() ?? "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "",
  useMockData: parseBoolean(rawUseMockData, true),
};

export const isSupabaseConfigured =
  Boolean(appEnv.supabaseUrl) && Boolean(appEnv.supabaseAnonKey);

export const activeDataSource = appEnv.useMockData || !isSupabaseConfigured
  ? "mock"
  : "supabase";

export function assertSupabaseConfigured() {
  if (isSupabaseConfigured) return;

  throw new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.",
  );
}
