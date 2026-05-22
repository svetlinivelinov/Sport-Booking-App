import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";

interface DashboardPageProps {
  searchParams?: Promise<{ page?: string; pageSize?: string; status?: string; mine?: string }>;
}

const VALID_STATUS = new Set(["draft", "open", "finished"]);

function toQueryString(params: { page: number; pageSize: number; status?: string; mine?: boolean }) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.mine) {
    query.set("mine", "1");
  }
  return query.toString();
}

function statusChip(status: string) {
  if (status === "open") {
    return "border-[var(--app-accent)]/20 bg-[var(--app-accent)]/10 text-[var(--app-accent)]";
  }
  if (status === "finished") {
    return "border-black/10 bg-black/5 text-[var(--app-muted)]";
  }
  return "border-[var(--app-primary)]/20 bg-[var(--app-primary)]/10 text-[var(--app-primary)]";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(params.pageSize ?? "10")));
  const mine = params.mine === "1";
  const status = params.status && VALID_STATUS.has(params.status) ? params.status : undefined;

  const filterWhere = mine && status
    ? and(eq(sessions.createdByUserId, user.sub), eq(sessions.status, status))
    : mine
      ? eq(sessions.createdByUserId, user.sub)
      : status
        ? eq(sessions.status, status)
        : undefined;

  const [
    [{ total }],
    [{ totalMine }],
    [{ totalOpen }],
    [{ totalDraft }],
    [{ totalFinished }],
  ] = await Promise.all([
    db.select({ total: count() }).from(sessions).where(filterWhere),
    db.select({ totalMine: count() }).from(sessions).where(eq(sessions.createdByUserId, user.sub)),
    db.select({ totalOpen: count() }).from(sessions).where(eq(sessions.status, "open")),
    db.select({ totalDraft: count() }).from(sessions).where(eq(sessions.status, "draft")),
    db.select({ totalFinished: count() }).from(sessions).where(eq(sessions.status, "finished")),
  ]);

  const rows = await db
    .select({
      id: sessions.id,
      title: sessions.title,
      status: sessions.status,
      startsAt: sessions.startsAt,
      venueName: sessions.venueName,
    })
    .from(sessions)
    .where(filterWhere)
    .orderBy(desc(sessions.startsAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const activeFilterLabel = mine
    ? status
      ? `Mine · ${status}`
      : "Mine · all statuses"
    : status
      ? `All · ${status}`
      : "All sessions";

  const allHref = `/dashboard?${toQueryString({ page: 1, pageSize })}`;
  const mineHref = `/dashboard?${toQueryString({ page: 1, pageSize, mine: true })}`;
  const openHref = `/dashboard?${toQueryString({ page: 1, pageSize, status: "open", mine })}`;
  const draftHref = `/dashboard?${toQueryString({ page: 1, pageSize, status: "draft", mine })}`;
  const finishedHref = `/dashboard?${toQueryString({ page: 1, pageSize, status: "finished", mine })}`;
  const prevHref = `/dashboard?${toQueryString({ page: Math.max(1, page - 1), pageSize, status, mine })}`;
  const nextHref = `/dashboard?${toQueryString({ page: Math.min(totalPages, page + 1), pageSize, status, mine })}`;

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-[var(--app-muted)]">Welcome back, {user.email}. Here is your live sport booking control center.</p>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">My sessions</p>
            <p className="mt-2 text-2xl font-bold">{totalMine}</p>
          </article>
          <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">Open sessions</p>
            <p className="mt-2 text-2xl font-bold text-[var(--app-accent)]">{totalOpen}</p>
          </article>
          <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">Draft sessions</p>
            <p className="mt-2 text-2xl font-bold text-[var(--app-primary)]">{totalDraft}</p>
          </article>
          <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">Finished sessions</p>
            <p className="mt-2 text-2xl font-bold text-[var(--app-muted)]">{totalFinished}</p>
          </article>
        </section>

        <section className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
          <p className="mr-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-muted)]">Quick actions</p>
          <Link href="/events" className="rounded-xl bg-[var(--app-primary)] px-3 py-1.5 text-sm font-semibold text-white">
            Create session
          </Link>
          <Link href={mineHref} className="rounded-xl border border-black/10 bg-[var(--app-bg)] px-3 py-1.5 text-sm font-semibold">
            My sessions
          </Link>
          <Link href={openHref} className="rounded-xl border border-black/10 bg-[var(--app-bg)] px-3 py-1.5 text-sm font-semibold">
            Open only
          </Link>
        </section>

        <section className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Event feed</h2>
            <p className="text-sm text-[var(--app-muted)]">
              {activeFilterLabel} · Page {page} of {totalPages} ({total} total)
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={allHref}
              className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${
                !mine && !status ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white" : "border-black/10 bg-[var(--app-bg)]"
              }`}
            >
              All
            </Link>
            <Link
              href={mineHref}
              className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${
                mine && !status ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white" : "border-black/10 bg-[var(--app-bg)]"
              }`}
            >
              Mine
            </Link>
            <Link
              href={openHref}
              className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${
                status === "open" ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-white" : "border-black/10 bg-[var(--app-bg)]"
              }`}
            >
              Open
            </Link>
            <Link
              href={draftHref}
              className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${
                status === "draft" ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white" : "border-black/10 bg-[var(--app-bg)]"
              }`}
            >
              Draft
            </Link>
            <Link
              href={finishedHref}
              className={`rounded-xl border px-3 py-1.5 text-sm font-semibold ${
                status === "finished" ? "border-black/20 bg-black/80 text-white" : "border-black/10 bg-[var(--app-bg)]"
              }`}
            >
              Finished
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {rows.length === 0 ? (
              <p className="text-sm text-[var(--app-muted)]">No events yet. Create one from the Events page.</p>
            ) : (
              rows.map((row) => (
                <article key={row.id} className="rounded-2xl border border-black/5 bg-[var(--app-bg)] px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{row.title}</p>
                      <p className="text-sm text-[var(--app-muted)]">
                        {new Date(row.startsAt).toLocaleString()} · {row.venueName ?? "TBA"}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusChip(row.status)}`}>
                      {row.status}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Link href={prevHref} className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-semibold">
              Prev
            </Link>
            <Link href={nextHref} className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-semibold">
              Next
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
