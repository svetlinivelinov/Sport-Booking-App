"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface SessionRow {
  id: string;
  title: string;
}

interface ResultRow {
  matchupId: string;
  sessionId: string;
  sessionTitle: string;
  roundNumber: number;
  slotNumber: number;
  sideAUserIds: string[];
  sideBUserIds: string[];
  sideAScore: number;
  sideBScore: number;
  winnerSide: "A" | "B" | "draw";
  submittedAt: string;
}

interface LeaderboardRow {
  userId: string;
  displayName: string;
  wins: number;
  losses: number;
  draws: number;
}

export function ResultsManager() {
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSessions() {
    const res = await fetch("/api/sessions?page=1&pageSize=100", { cache: "no-store" });
    const data = (await res.json()) as { rows?: SessionRow[]; error?: string };

    if (!res.ok) {
      setMessage(data.error ?? "Failed to load sessions");
      return;
    }

    setSessions(data.rows ?? []);
  }

  async function loadResults() {
    setLoading(true);
    setMessage(null);

    const query = new URLSearchParams({
      page: String(page),
      pageSize: "10",
    });

    if (sessionId) {
      query.set("sessionId", sessionId);
    }

    try {
      const res = await fetch(`/api/results?${query.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as {
        rows?: ResultRow[];
        leaderboard?: LeaderboardRow[];
        totalPages?: number;
        error?: string;
      };

      if (!res.ok) {
        setMessage(data.error ?? "Failed to load results");
        return;
      }

      setRows(data.rows ?? []);
      setLeaderboard(data.leaderboard ?? []);
      setTotalPages(Math.max(1, data.totalPages ?? 1));
    } catch {
      setMessage("Failed to load results");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("sessionId")?.trim() ?? "";
    setSessionId(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    void loadResults();
  }, [page, sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      void loadResults();
    }, 15000);

    return () => {
      clearInterval(timer);
    };
  }, [page, sessionId]);

  useEffect(() => {
    setPage(1);
  }, [sessionId]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-4xl font-bold tracking-tight">Results</h1>
      <p className="mt-2 text-[var(--app-muted)]">Browse completed matchup scores and leaderboard standings.</p>

      <section className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button
            type="button"
            onClick={() => void loadResults()}
            className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold"
          >
            Refresh
          </button>
        </div>

        <label className="mt-3 block text-sm text-[var(--app-muted)]">
          Session
          <select
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-[var(--app-foreground)]"
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
          >
            <option value="">All sessions</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          {!leaderboard.length ? <p className="mt-2 text-sm text-[var(--app-muted)]">No leaderboard entries yet.</p> : null}
          <div className="mt-4 space-y-2">
            {leaderboard.map((row) => (
              <div key={row.userId} className="rounded-xl border border-black/5 bg-[var(--app-bg)] px-3 py-2 text-sm">
                <p className="font-semibold">{row.displayName}</p>
                <p className="text-[var(--app-muted)]">
                  W: {row.wins} · L: {row.losses} · D: {row.draws}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Recent results</h2>
          {loading ? <p className="mt-2 text-sm text-[var(--app-muted)]">Loading results...</p> : null}
          {!loading && !rows.length ? <p className="mt-2 text-sm text-[var(--app-muted)]">No result rows found.</p> : null}

          <div className="mt-4 space-y-2">
            {rows.map((row) => (
              <div key={row.matchupId} className="rounded-xl border border-black/5 bg-[var(--app-bg)] px-3 py-2 text-sm">
                <p className="font-semibold">
                  {row.sessionTitle} · R{row.roundNumber} S{row.slotNumber}
                </p>
                <p className="text-[var(--app-muted)]">
                  {row.sideAUserIds.join(", ")} {row.sideAScore} - {row.sideBScore} {row.sideBUserIds.join(", ")}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
            >
              Prev
            </button>
            <p className="text-xs text-[var(--app-muted)]">
              Page {page} / {Math.max(1, totalPages)}
            </p>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </article>
      </section>

      {message ? <p className="mt-6 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--app-muted)]">{message}</p> : null}
    </main>
  );
}
