import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";

export default async function ResultsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Results</h1>
        <p className="mt-2 text-[var(--app-muted)]">Browse finished sessions and standings by sport or group.</p>
        <section className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Filters</h2>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Group filter, player search, and refresh actions will be connected next.</p>
        </section>
      </main>
    </div>
  );
}
