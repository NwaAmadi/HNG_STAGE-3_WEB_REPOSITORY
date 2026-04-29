"use client";

import { LogoutButton } from "@/components/logout-button";
import { useSession } from "@/components/session-provider";

export default function AccountPage() {
  const { user } = useSession();

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Session Overview</h1>
          <p className="page-copy">
            This view is intentionally read-only because the current backend does not
            expose account update endpoints.
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <article className="panel">
          <h2>Current User</h2>
          <dl className="detail-list">
            <div>
              <dt>ID</dt>
              <dd>{user?.id ?? "..."}</dd>
            </div>
            <div>
              <dt>Username</dt>
              <dd>{user?.username ?? "..."}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{user?.role ?? "..."}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <h2>Session Actions</h2>
          <p>
            Logging out clears the active web session and returns you to the login
            screen.
          </p>
          <LogoutButton />
        </article>
      </div>
    </section>
  );
}
