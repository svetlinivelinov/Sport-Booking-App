import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";

export default async function EventsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-2">
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Create session</h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">MVP shell based on support event page.</p>
          <form className="mt-5 space-y-3">
            <input className="w-full rounded-xl border border-black/10 px-3 py-2" placeholder="Session title" />
            <input className="w-full rounded-xl border border-black/10 px-3 py-2" placeholder="Venue" />
            <button type="button" className="rounded-xl bg-[var(--app-primary)] px-4 py-2 font-semibold text-white">
              Save draft
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Sessions</h2>
          <p className="mt-2 text-sm text-[var(--app-muted)]">No sessions yet.</p>
        </section>
      </main>
    </div>
  );
}
