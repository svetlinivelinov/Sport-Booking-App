"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const appLinks = [
  { href: "/dashboard", label: "Upcoming" },
  { href: "/groups", label: "Groups" },
  { href: "/events", label: "Events" },
  { href: "/my-sessions", label: "My Sessions" },
  { href: "/results", label: "Results" },
  { href: "/profile", label: "Profile" },
];

function linkClass(pathname: string, href: string) {
  const active = pathname === href;
  return active
    ? "ui-nav-pill ui-nav-pill-active"
    : "ui-nav-pill ui-nav-pill-muted";
}

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="ui-brand-title">
        Sport Booking
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/login" className={linkClass(pathname, "/login")}>
          Login
        </Link>
        <Link href="/signup" className={linkClass(pathname, "/signup")}>
          Sign up
        </Link>
      </div>
    </nav>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    for (const link of appLinks) {
      router.prefetch(link.href);
    }
    router.prefetch("/admin");
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function loadRole() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (!cancelled) {
            setIsAdmin(false);
          }
          return;
        }

        const payload = (await response.json()) as { user?: { role?: "user" | "admin" } | null };
        if (!cancelled) {
          setIsAdmin(payload.user?.role === "admin");
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      }
    }

    void loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/dashboard" className="ui-brand-title">
        Sport Booking
      </Link>
      <div className="flex items-center gap-2">
        {appLinks.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(pathname, link.href)}>
            {link.label}
          </Link>
        ))}
        {isAdmin ? (
          <Link href="/admin" className={linkClass(pathname, "/admin")}>
            Admin
          </Link>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          disabled={busy}
          className="ui-nav-pill ui-nav-pill-danger disabled:opacity-60"
        >
          {busy ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
