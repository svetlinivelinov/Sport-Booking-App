import { redirect } from "next/navigation";
import { and, count, eq, gte, lt } from "drizzle-orm";

import { requireRole } from "@/auth/session";
import { AdminSessionsManager } from "@/components/AdminSessionsManager";
import { AppNav } from "@/components/TopNav";
import { db } from "@/db/client";
import { scoreEntries, sessions, users } from "@/db/schema";

export default async function AdminPage() {
  const auth = await requireRole("admin");
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect("/login");
    }
    redirect("/dashboard");
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [usersTotalResult, openSessionsResult, finishedTodayResult, scoreEntriesResult] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(sessions).where(eq(sessions.status, "open")),
    db
      .select({ total: count() })
      .from(sessions)
      .where(
        and(eq(sessions.status, "finished"), gte(sessions.startsAt, startOfToday), lt(sessions.startsAt, startOfTomorrow)),
      ),
    db.select({ total: count() }).from(scoreEntries),
  ]);

  const stats = [
    { label: "Active users", value: String(usersTotalResult[0]?.total ?? 0) },
    { label: "Open sessions", value: String(openSessionsResult[0]?.total ?? 0) },
    { label: "Finished today", value: String(finishedTodayResult[0]?.total ?? 0) },
    { label: "Score entries", value: String(scoreEntriesResult[0]?.total ?? 0) },
  ];

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="ui-heading-page">Admin Console</h1>
        <p className="mt-2 ui-text-sm ui-text-muted">Role-protected management for users, sessions, and moderation flows.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="ui-card p-5">
              <p className="ui-text-sm ui-text-muted">{stat.label}</p>
              <p className="mt-2 ui-metric-value">{stat.value}</p>
            </article>
          ))}
        </section>

        <AdminSessionsManager />
      </main>
    </div>
  );
}
