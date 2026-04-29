"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError, refreshSession } from "@/lib/api-client";
import type { Envelope, User } from "@/lib/types";

type SessionContextValue = {
  user: User | null;
  loading: boolean;
  hasResolved: boolean;
  reloadSession: () => Promise<void>;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasResolved, setHasResolved] = useState(false);

  async function loadSession() {
    try {
      const response = await apiFetch<Envelope<User>>("/api/users/me", {
        retryOnAuth: false
      });
      setUser(response.data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          await refreshSession();
          const response = await apiFetch<Envelope<User>>("/api/users/me", {
            retryOnAuth: false
          });
          setUser(response.data);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
      setHasResolved(true);
    }
  }

  useEffect(() => {
    void loadSession();
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      loading,
      hasResolved,
      reloadSession: async () => {
        setLoading(true);
        await loadSession();
      },
      clearSession: () => {
        setUser(null);
        setLoading(false);
        setHasResolved(true);
      }
    }),
    [hasResolved, loading, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
