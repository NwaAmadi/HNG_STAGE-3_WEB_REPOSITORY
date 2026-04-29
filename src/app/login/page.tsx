"use client";

import { useEffect } from "react";
import { useSession } from "@/components/session-provider";

export default function LoginPage() {
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && user) {
      window.location.replace("/dashboard");
    }
  }, [loading, user]);

  return (
    <main className="auth-page">
      <section className="hero-panel">
        <p className="eyebrow">Insighta Labs+</p>
        <h1>Profile intelligence for teams that need secure, searchable insight.</h1>
        <p className="lede">
          Sign in with GitHub to review enriched profiles, run natural-language
          searches, export filtered data, and manage admin workflows from one
          portal.
        </p>
        <div className="feature-grid">
          <article className="feature-card">
            <h2>Role-aware access</h2>
            <p>Analysts can read and export. Admins can also create and delete.</p>
          </article>
          <article className="feature-card">
            <h2>Cookie-based security</h2>
            <p>OAuth, refresh, and CSRF handling are wired around the backend contract.</p>
          </article>
          <article className="feature-card">
            <h2>Operational visibility</h2>
            <p>Profiles, search, exports, and session state stay in one workflow.</p>
          </article>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">Web Portal Access</p>
          <h2>Continue with GitHub</h2>
          <p>
            Authentication is handled with HTTP-only cookies via the backend OAuth
            flow. Use your approved GitHub account to enter the portal.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              window.location.assign("/api/auth/github");
            }}
            type="button"
          >
            Sign in with GitHub
          </button>
          <p className="subtle-copy">
            By continuing, you will be redirected through the secure OAuth flow and
            returned to the portal on success.
          </p>
          <a
            className="text-link"
            href="https://docs.github.com/en/apps/oauth-apps"
            rel="noreferrer"
            target="_blank"
          >
            OAuth background
          </a>
        </div>
      </section>
    </main>
  );
}
