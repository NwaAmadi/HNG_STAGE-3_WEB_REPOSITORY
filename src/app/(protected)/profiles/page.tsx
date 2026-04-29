"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreateProfileForm } from "@/components/create-profile-form";
import { useSession } from "@/components/session-provider";
import { apiFetch, ApiError } from "@/lib/api-client";
import { toBackendUrl } from "@/lib/public-config";
import { buildQueryString, cleanObject, getPositiveInt } from "@/lib/utils";
import type { PaginatedProfilesResponse } from "@/lib/types";

const DEFAULT_LIMIT = 10;

export default function ProfilesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useSession();
  const [profiles, setProfiles] = useState<PaginatedProfilesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const page = getPositiveInt(searchParams.get("page"), 1);
  const limit = getPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const totalPages = useMemo(() => {
    if (!profiles) {
      return 1;
    }

    return Math.max(1, Math.ceil(profiles.total / profiles.limit));
  }, [profiles]);

  const queryString = searchParams.toString();

  useEffect(() => {
    let active = true;
    const url = queryString
      ? `/api/profiles?${queryString}`
      : `/api/profiles?page=1&limit=${DEFAULT_LIMIT}`;

    apiFetch<PaginatedProfilesResponse>(url)
      .then((response) => {
        if (active) {
          setProfiles(response);
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

        setError("Unable to load profiles.");
      });

    return () => {
      active = false;
    };
  }, [queryString]);

  function updateFilters(formData: FormData) {
    const values = cleanObject({
      gender: formData.get("gender")?.toString() ?? "",
      age_group: formData.get("age_group")?.toString() ?? "",
      country_id: formData.get("country_id")?.toString()?.toUpperCase() ?? "",
      min_age: formData.get("min_age")?.toString() ?? "",
      max_age: formData.get("max_age")?.toString() ?? "",
      min_gender_probability: formData.get("min_gender_probability")?.toString() ?? "",
      min_country_probability: formData.get("min_country_probability")?.toString() ?? "",
      sort_by: formData.get("sort_by")?.toString() ?? "",
      order: formData.get("order")?.toString() ?? "",
      limit: formData.get("limit")?.toString() ?? DEFAULT_LIMIT.toString(),
      page: "1"
    });

    router.replace(`${pathname}?${buildQueryString(values)}`);
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPage.toString());
    params.set("limit", limit.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }

  const exportHref = toBackendUrl(
    `/api/profiles/export?${buildQueryString({
      ...Object.fromEntries(searchParams.entries()),
      format: "csv"
    })}`
  );

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Profiles</p>
          <h1>Profiles Directory</h1>
          <p className="page-copy">
            Filter, sort, paginate, and export enriched profiles from the current
            backend dataset.
          </p>
        </div>
        <div className="actions-row">
          <a className="secondary-button" href={exportHref}>
            Export CSV
          </a>
        </div>
      </div>

      <form
        className="panel filter-grid"
        onSubmit={(event) => {
          event.preventDefault();
          updateFilters(new FormData(event.currentTarget));
        }}
      >
        <label>
          Gender
          <select name="gender" defaultValue={searchParams.get("gender") ?? ""}>
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>
          Age Group
          <select name="age_group" defaultValue={searchParams.get("age_group") ?? ""}>
            <option value="">All</option>
            <option value="child">Child</option>
            <option value="teenager">Teenager</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
        </label>
        <label>
          Country Code
          <input name="country_id" defaultValue={searchParams.get("country_id") ?? ""} />
        </label>
        <label>
          Min Age
          <input name="min_age" type="number" defaultValue={searchParams.get("min_age") ?? ""} />
        </label>
        <label>
          Max Age
          <input name="max_age" type="number" defaultValue={searchParams.get("max_age") ?? ""} />
        </label>
        <label>
          Min Gender Probability
          <input
            name="min_gender_probability"
            type="number"
            min="0"
            max="1"
            step="0.01"
            defaultValue={searchParams.get("min_gender_probability") ?? ""}
          />
        </label>
        <label>
          Min Country Probability
          <input
            name="min_country_probability"
            type="number"
            min="0"
            max="1"
            step="0.01"
            defaultValue={searchParams.get("min_country_probability") ?? ""}
          />
        </label>
        <label>
          Sort By
          <select name="sort_by" defaultValue={searchParams.get("sort_by") ?? ""}>
            <option value="">Default</option>
            <option value="age">Age</option>
            <option value="created_at">Created At</option>
            <option value="gender_probability">Gender Probability</option>
          </select>
        </label>
        <label>
          Order
          <select name="order" defaultValue={searchParams.get("order") ?? ""}>
            <option value="">Default</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
        <label>
          Page Size
          <select name="limit" defaultValue={limit.toString()}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
        <div className="actions-row">
          <button className="primary-button" type="submit">
            Apply Filters
          </button>
          <Link className="ghost-button" href="/profiles">
            Reset
          </Link>
        </div>
      </form>

      {user?.role === "admin" ? <CreateProfileForm /> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="panel">
        <div className="table-header">
          <h2>Results</h2>
          <p>
            Page {profiles?.page ?? page} of {totalPages}
          </p>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Country</th>
                <th>Confidence</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.data.length ? (
                profiles.data.map((profile) => (
                  <tr key={profile.id}>
                    <td>
                      <Link href={`/profiles/${profile.id}`}>{profile.name}</Link>
                    </td>
                    <td>{profile.age}</td>
                    <td>{profile.gender}</td>
                    <td>{profile.country_name}</td>
                    <td>
                      {Math.round(profile.gender_probability * 100)}% /{" "}
                      {Math.round(profile.country_probability * 100)}%
                    </td>
                    <td>{new Date(profile.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No profiles matched the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
            Showing {profiles?.data.length ?? 0} of {profiles?.total ?? 0}
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
      </div>
    </section>
  );
}
