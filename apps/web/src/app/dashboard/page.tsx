import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";

interface DashboardPageProps {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(params.pageSize ?? "10")));

  const [{ total }] = await db.select({ total: count() }).from(sessions);

  const rows = await db
    .select({
      id: sessions.id,
      title: sessions.title,
      status: sessions.status,
      startsAt: sessions.startsAt,
      venueName: sessions.venueName,
    })
    .from(sessions)
    .orderBy(desc(sessions.startsAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Upcoming</h1>
        <p className="mt-2 text-[var(--app-muted)]">Welcome back, {user.email}. Your next sessions will appear here.</p>
        <section className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Event feed</h2>
            <p className="text-sm text-[var(--app-muted)]">
              Page {page} of {totalPages} ({total} total)
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {rows.length === 0 ? (
              <p className="text-sm text-[var(--app-muted)]">No events yet. Create one from the Events page.</p>
            ) : (
              rows.map((row) => (
                <article key={row.id} className="rounded-2xl border border-black/5 bg-[var(--app-bg)] px-4 py-3">
                  <p className="font-semibold">{row.title}</p>
                  <p className="text-sm text-[var(--app-muted)]">
                    {new Date(row.startsAt).toLocaleString()} · {row.venueName ?? "TBA"} · {row.status}
                  </p>
                </article>
              ))
            )}
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Link
              href={`/dashboard?page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
              className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
            >
              Prev
            </Link>
            <Link
              href={`/dashboard?page=${Math.min(totalPages, page + 1)}&pageSize=${pageSize}`}
              className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-semibold"
            >
              Next
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
