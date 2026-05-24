import { redirect } from "next/navigation";

import { requireRole } from "@/auth/session";
import { AppNav } from "@/components/TopNav";

export default async function AdminPage() {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect("/login");
    }
    redirect("/dashboard");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Admin Console</h1>
        <p className="mt-2 ui-text-muted">Role-protected management for users, sessions, and moderation flows.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Active users", "0"],
            ["Open sessions", "0"],
            ["Finished today", "0"],
            ["Reports", "0"],
          ].map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <p className="text-sm ui-text-muted">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
