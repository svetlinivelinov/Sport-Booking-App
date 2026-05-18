import Link from "next/link";

import { PublicNav } from "@/components/TopNav";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <PublicNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--app-muted)]">Multi-sport and rebrand-ready</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight">
          Organize sessions, track matchups, and keep standings in one place.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--app-muted)]">
          From football to padel and beyond, run your activities with shared scheduling, score flow, and role-based management.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/signup" className="rounded-full bg-[var(--app-primary)] px-5 py-2.5 font-semibold text-white">
            Create account
          </Link>
          <Link href="/login" className="rounded-full border border-black/10 bg-white px-5 py-2.5 font-semibold">
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}
