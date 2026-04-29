"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import { buildQueryString, getPositiveInt } from "@/lib/utils";
import type { PaginatedProfilesResponse } from "@/lib/types";

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<PaginatedProfilesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const q = searchParams.get("q") ?? "";
  const page = getPositiveInt(searchParams.get("page"), 1);
  const limit = getPositiveInt(searchParams.get("limit"), 10);

  const totalPages = useMemo(() => {
    if (!results) {
      return 1;
    }

    return Math.max(1, Math.ceil(results.total / results.limit));
  }, [results]);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      setError(null);
      return;
    }

    let active = true;

    apiFetch<PaginatedProfilesResponse>(
      `/api/profiles/search?${buildQueryString({ q, page: page.toString(), limit: limit.toString() })}`
    )
      .then((response) => {
        if (active) {
          setResults(response);
          setError(null);
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

        setError("Unable to run this search.");
      });

    return () => {
      active = false;
    };
  }, [limit, page, q]);

  function submitSearch(formData: FormData) {
    const nextQuery = formData.get("q")?.toString() ?? "";
    const nextLimit = formData.get("limit")?.toString() ?? "10";
    router.replace(`${pathname}?${buildQueryString({ q: nextQuery, page: "1", limit: nextLimit })}`);
  }

  function goToPage(nextPage: number) {
    router.replace(
      `${pathname}?${buildQueryString({ q, page: nextPage.toString(), limit: limit.toString() })}`
    );
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Natural Language Search</p>
          <h1>Search the dataset like a human request</h1>
          <p className="page-copy">
            Try phrases like “young males from nigeria” or “females above 30.”
          </p>
        </div>
      </div>

      <form
        className="panel search-bar"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(new FormData(event.currentTarget));
        }}
      >
        <input
          aria-label="Search query"
          defaultValue={q}
          name="q"
          placeholder="adult males from kenya"
        />
        <select defaultValue={limit.toString()} name="limit">
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
        <button className="primary-button" type="submit">
          Search
        </button>
      </form>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="panel">
        <div className="table-header">
          <h2>Search Results</h2>
          <p>{q ? `${results?.total ?? 0} matches` : "Enter a query to begin"}</p>
        </div>

        {results?.data.length ? (
          <>
            <div className="cards-grid">
              {results.data.map((profile) => (
                <Link className="result-card" href={`/profiles/${profile.id}`} key={profile.id}>
                  <h3>{profile.name}</h3>
                  <p>
                    {profile.gender}, {profile.age} years old, {profile.country_name}
                  </p>
                  <span>Created {new Date(profile.created_at).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>

            <div className="pagination-row">
              <button
                className="ghost-button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                type="button"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                className="ghost-button"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                type="button"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state-block">
            {q ? "No search results yet." : "Search results will appear here."}
          </div>
        )}
      </div>
    </section>
  );
}
