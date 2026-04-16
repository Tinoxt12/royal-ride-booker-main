import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { activeDataSource } from "@/repositories";
import { getSupabaseClient } from "@/integrations/supabase/client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    activeDataSource === "mock" ? "authenticated" : "loading",
  );
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (activeDataSource === "mock") return;

    const supabase = getSupabaseClient();
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error) {
        setSession(null);
        setStatus("unauthenticated");
        return;
      }

      setSession(data.session);
      setStatus(data.session ? "authenticated" : "unauthenticated");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      session,
      async signIn(email: string, password: string) {
        if (activeDataSource === "mock") {
          setStatus("authenticated");
          return;
        }

        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSession(data.session);
        setStatus(data.session ? "authenticated" : "unauthenticated");
      },
      async signOut() {
        if (activeDataSource === "mock") {
          setSession(null);
          setStatus("unauthenticated");
          return;
        }

        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        setSession(null);
        setStatus("unauthenticated");
      },
    }),
    [session, status],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider.");
  }

  return context;
}
