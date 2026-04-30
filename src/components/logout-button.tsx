"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { apiFetch, ApiError } from "@/lib/api-client";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { clearSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setLoading(true);
    setError(null);

    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        retryOnAuth: false
      });
      clearSession();
      router.replace("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to log out.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "compact-logout" : "logout-panel"}>
      <button className="ghost-button" disabled={loading} onClick={logout} type="button">
        {loading ? "Signing out..." : "Logout"}
      </button>
      {error ? <p className="inline-error">{error}</p> : null}
    </div>
  );
}
