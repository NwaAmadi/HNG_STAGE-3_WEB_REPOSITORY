"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, hasResolved } = useSession();

  useEffect(() => {
    if (hasResolved && !loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hasResolved, loading, pathname, router, user]);

  if (loading || !hasResolved) {
    return <div className="screen-loader">Validating session...</div>;
  }

  if (!user) {
    return <div className="screen-loader">Redirecting to login...</div>;
  }

  return <>{children}</>;
}
