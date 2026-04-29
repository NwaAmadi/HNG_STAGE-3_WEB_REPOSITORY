"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Envelope, Profile } from "@/lib/types";

export function CreateProfileForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiFetch<Envelope<Profile>>("/api/profiles", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      setMessage(`Profile ready for ${response.data.name}.`);
      setName("");
      router.push(`/profiles/${response.data.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to create this profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel create-form" onSubmit={createProfile}>
      <div>
        <p className="eyebrow">Admin Action</p>
        <h2>Create Profile</h2>
        <p>Submit a person’s name and let the backend enrich or return the stored record.</p>
      </div>
      <div className="inline-form">
        <input
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Harriet Tubman"
          required
          value={name}
        />
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}
    </form>
  );
}
