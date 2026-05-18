import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";

export default async function CourtPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Court</h1>
        <p className="mt-2 text-[var(--app-muted)]">Live session management, rounds, and score submission.</p>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Session selector</h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">Choose an active session to load round and matchup details.</p>
          </article>
          <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Leaderboard</h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">Leaderboard appears once score entries are submitted.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
