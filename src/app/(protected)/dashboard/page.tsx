"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { PaginatedProfilesResponse } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useSession();
  const [totalProfiles, setTotalProfiles] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    apiFetch<PaginatedProfilesResponse>("/api/profiles?page=1&limit=1")
      .then((response) => {
        if (active) {
          setTotalProfiles(response.total);
        }
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }

        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }

        setError("Unable to load dashboard metrics.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="page-copy">
            A lightweight operational view built from the currently available API
            surface.
          </p>
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="stats-grid">
        <article className="stat-card">
          <span>Total Profiles</span>
          <strong>{totalProfiles ?? "..."}</strong>
          <p>Derived from the paginated profiles endpoint.</p>
        </article>
        <article className="stat-card">
          <span>Signed-in User</span>
          <strong>{user?.username ?? "..."}</strong>
          <p>Loaded from the current authenticated session.</p>
        </article>
        <article className="stat-card">
          <span>Access Level</span>
          <strong>{user?.role ?? "..."}</strong>
          <p>Admin can create/delete; analyst can read, search, and export.</p>
        </article>
      </div>

      <div className="two-column">
        <article className="panel">
          <h2>Portal focus</h2>
          <ul className="plain-list">
            <li>Secure OAuth login using backend-managed cookies.</li>
            <li>Role-aware UI for profile creation and deletion.</li>
            <li>Natural-language search for analyst-friendly exploration.</li>
            <li>CSV export for downstream operational use.</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Backend gaps handled in UI</h2>
          <ul className="plain-list">
            <li>Total pages are computed client-side from `total` and `limit`.</li>
            <li>Account details stay read-only because no update endpoint exists.</li>
            <li>Dashboard metrics are derived instead of fetched from a dedicated API.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
