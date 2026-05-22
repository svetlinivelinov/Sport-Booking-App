"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const appLinks = [
  { href: "/dashboard", label: "Upcoming" },
  { href: "/groups", label: "Groups" },
  { href: "/events", label: "Events" },
  { href: "/profile", label: "Profile" },
];

function linkClass(pathname: string, href: string) {
  const active = pathname === href;
  return active
    ? "rounded-full bg-[var(--app-primary)] px-3 py-1.5 text-sm font-semibold text-white"
    : "rounded-full px-3 py-1.5 text-sm font-medium text-[var(--app-muted)] hover:bg-black/5";
}

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-lg font-bold tracking-tight">
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

  async function handleLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/dashboard" className="text-lg font-bold tracking-tight">
        Sport Booking
      </Link>
      <div className="flex items-center gap-2">
        {appLinks.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(pathname, link.href)}>
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          disabled={busy}
          className="rounded-full bg-[var(--app-danger)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
