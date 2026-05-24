"use client";

import { useCallback, useEffect, useState } from "react";

interface SessionRow {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  venueName: string | null;
  participantCount: number;
}

interface SessionsResponse {
  total: number;
  totalPages: number;
  rows: SessionRow[];
  error?: string;
}

function statusBadgeClass(status: string) {
  if (status === "open") {
    return "border-[var(--app-status-open-border)] bg-[var(--app-status-open-bg)] text-[var(--app-status-open-text)]";
  }
  if (status === "finished") {
    return "border-[var(--app-status-finished-border)] bg-[var(--app-status-finished-bg)] ui-text-muted";
  }
  return "border-[var(--app-status-draft-border)] bg-[var(--app-status-draft-bg)] text-[var(--app-primary)]";
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function MySessionsManager() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMine = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/sessions?my=1&page=${page}&pageSize=10`, { cache: "no-store" });
      const payload = (await response.json()) as SessionsResponse;

      if (!response.ok) {
        setError(payload.error ?? "Unable to load your sessions.");
        setRows([]);
        setTotalPages(1);
        return;
      }

      setRows(payload.rows ?? []);
      setTotalPages(Math.max(1, payload.totalPages ?? 1));
    } catch {
      setError("Unable to load your sessions.");
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadMine();
  }, [loadMine]);

  async function onLeave(sessionId: string) {
    setBusySessionId(sessionId);
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/participants`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to leave this session.");
        return;
      }

      await loadMine();
    } catch {
      setError("Unable to leave this session.");
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="ui-heading-page">My Sessions</h1>
      <p className="mt-2 ui-text-sm ui-text-muted">Sessions you joined from events.</p>

      <section className="mt-8 ui-section">
        {loading ? <p className="ui-text-sm ui-text-muted">Loading sessions...</p> : null}
        {error ? <p className="ui-text-sm text-[var(--app-danger)]">{error}</p> : null}

        {!loading && !rows.length && !error ? <p className="ui-text-sm ui-text-muted">No sessions yet.</p> : null}

        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.id} className="ui-card">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{row.title}</p>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(row.status)}`}
                >
                  {row.status}
                </span>
              </div>
              <p className="ui-text-sm ui-text-muted">Starts: {formatDate(row.startsAt)}</p>
              <p className="ui-text-sm ui-text-muted">Venue: {row.venueName ?? "TBD"}</p>
              <p className="ui-text-sm ui-text-muted">Participants: {row.participantCount ?? 0}</p>

              {row.status !== "finished" ? (
                <button
                  type="button"
                  onClick={() => void onLeave(row.id)}
                  disabled={busySessionId === row.id}
                  className="mt-3 ui-button ui-button-neutral disabled:opacity-60"
                >
                  {busySessionId === row.id ? "Leaving..." : "Leave"}
                </button>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || loading}
            className="ui-button ui-button-neutral disabled:opacity-60"
          >
            Prev
          </button>
          <p className="ui-text-sm ui-text-muted">
            Page {page} / {Math.max(1, totalPages)}
          </p>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages || loading}
            className="ui-button ui-button-neutral disabled:opacity-60"
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => void loadMine()}
            disabled={loading}
            className="ui-button ui-button-primary disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh my sessions"}
          </button>
        </div>
      </section>
    </main>
  );
}
