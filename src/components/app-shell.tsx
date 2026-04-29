"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { useSession } from "@/components/session-provider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profiles", label: "Profiles" },
  { href: "/search", label: "Search" },
  { href: "/account", label: "Account" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Insighta Labs+</p>
          <h1>Web Portal</h1>
          <p>{user?.role === "admin" ? "Administrator workspace" : "Analyst workspace"}</p>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link className={active ? "nav-link active" : "nav-link"} href={item.href} key={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div>
            <strong>{user?.username}</strong>
            <p>{user?.role}</p>
          </div>
          <LogoutButton compact />
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
