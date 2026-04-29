"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Envelope, Profile } from "@/lib/types";

export default function ProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    apiFetch<Envelope<Profile>>(`/api/profiles/${params.id}`)
      .then((response) => {
        if (active) {
          setProfile(response.data);
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

        setError("Unable to load this profile.");
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  async function deleteProfile() {
    const confirmed = window.confirm("Delete this profile permanently?");
    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await apiFetch(`/api/profiles/${params.id}`, {
        method: "DELETE"
      });
      router.replace("/profiles");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to delete this profile.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Profile Detail</p>
          <h1>{profile?.name ?? "Loading profile..."}</h1>
          <p className="page-copy">
            Review the stored intelligence record and any admin-only destructive action.
          </p>
        </div>
        <div className="actions-row">
          <Link className="ghost-button" href="/profiles">
            Back to Profiles
          </Link>
          {user?.role === "admin" ? (
            <button
              className="danger-button"
              disabled={deleting}
              onClick={deleteProfile}
              type="button"
            >
              {deleting ? "Deleting..." : "Delete Profile"}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      {profile ? (
        <div className="detail-grid">
          <article className="panel">
            <h2>Identity</h2>
            <dl className="detail-list">
              <div>
                <dt>ID</dt>
                <dd>{profile.id}</dd>
              </div>
              <div>
                <dt>Name</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(profile.created_at).toLocaleString()}</dd>
              </div>
            </dl>
          </article>

          <article className="panel">
            <h2>Demographics</h2>
            <dl className="detail-list">
              <div>
                <dt>Gender</dt>
                <dd>{profile.gender}</dd>
              </div>
              <div>
                <dt>Gender Probability</dt>
                <dd>{Math.round(profile.gender_probability * 100)}%</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{profile.age}</dd>
              </div>
              <div>
                <dt>Age Group</dt>
                <dd>{profile.age_group}</dd>
              </div>
            </dl>
          </article>

          <article className="panel">
            <h2>Country Intelligence</h2>
            <dl className="detail-list">
              <div>
                <dt>Country ID</dt>
                <dd>{profile.country_id}</dd>
              </div>
              <div>
                <dt>Country Name</dt>
                <dd>{profile.country_name}</dd>
              </div>
              <div>
                <dt>Country Probability</dt>
                <dd>{Math.round(profile.country_probability * 100)}%</dd>
              </div>
            </dl>
          </article>
        </div>
      ) : (
        <div className="panel">Loading profile details...</div>
      )}
    </section>
  );
}
