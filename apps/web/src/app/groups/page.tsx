import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";

export default async function GroupsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Groups</h1>
        <p className="mt-2 text-[var(--app-muted)]">Create and manage sport communities and invites.</p>
        <section className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">My groups</h2>
          <p className="mt-2 text-sm text-[var(--app-muted)]">No groups yet.</p>
        </section>
      </main>
    </div>
  );
}
