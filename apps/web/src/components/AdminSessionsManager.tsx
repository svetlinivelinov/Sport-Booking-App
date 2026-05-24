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

type SessionStatus = "draft" | "open" | "finished";
type StatusFilter = "all" | SessionStatus;

interface SessionsResponse {
  rows?: SessionRow[];
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

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export function AdminSessionsManager() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const query = new URLSearchParams({ page: "1", pageSize: "20" });
      if (statusFilter !== "all") {
        query.set("status", statusFilter);
      }

      const response = await fetch(`/api/sessions?${query.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as SessionsResponse;

      if (!response.ok) {
        setRows([]);
        setMessage(payload.error ?? "Unable to load sessions.");
        return;
      }

      setRows(payload.rows ?? []);
    } catch {
      setRows([]);
      setMessage("Unable to load sessions.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  function beginEdit(row: SessionRow) {
    setEditingId(row.id);
    setTitle(row.title);
    setVenueName(row.venueName ?? "");
    setStartsAt(toDatetimeLocal(row.startsAt));
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setVenueName("");
    setStartsAt("");
  }

  async function saveEdit(sessionId: string) {
    setBusyId(sessionId);
    setMessage(null);

    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          venueName,
          startsAt,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Unable to update session.");
        return;
      }

      cancelEdit();
      setMessage("Session updated.");
      await loadSessions();
    } catch {
      setMessage("Unable to update session.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeSession(sessionId: string) {
    const confirmed = window.confirm("Remove this session? This also removes related participants and matchups.");
    if (!confirmed) {
      return;
    }

    setBusyId(sessionId);
    setMessage(null);

    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "Unable to remove session.");
        return;
      }

      if (editingId === sessionId) {
        cancelEdit();
      }
      setMessage("Session removed.");
      await loadSessions();
    } catch {
      setMessage("Unable to remove session.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateStatus(sessionId: string, status: SessionStatus) {
    setBusyId(sessionId);
    setMessage(null);

    try {
      const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error ?? "Unable to update status.");
        return;
      }

      setMessage(`Status updated to ${status}.`);
      await loadSessions();
    } catch {
      setMessage("Unable to update status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8 ui-section">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="ui-heading-section">Session moderation</h2>
        <button type="button" className="ui-button ui-button-neutral" onClick={() => void loadSessions()} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "open", "draft", "finished"] as StatusFilter[]).map((filter) => {
          const active = filter === statusFilter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`ui-button border capitalize ${
                active
                  ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-[var(--app-on-primary)]"
                  : "border-[var(--app-border-soft)] bg-[var(--app-surface)]"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {message ? <p className="mb-4 ui-text-sm ui-text-muted">{message}</p> : null}

      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="ui-card">
            {editingId === row.id ? (
              <div className="space-y-2">
                <input className="ui-input w-full" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
                <input className="ui-input w-full" value={venueName} onChange={(event) => setVenueName(event.target.value)} placeholder="Venue" />
                <input
                  type="datetime-local"
                  className="ui-input w-full"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="ui-button ui-button-primary disabled:opacity-60"
                    onClick={() => void saveEdit(row.id)}
                    disabled={busyId === row.id}
                  >
                    {busyId === row.id ? "Saving..." : "Save"}
                  </button>
                  <button type="button" className="ui-button ui-button-neutral" onClick={cancelEdit} disabled={busyId === row.id}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{row.title}</p>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadgeClass(row.status)}`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="ui-text-sm ui-text-muted">Starts: {new Date(row.startsAt).toLocaleString()}</p>
                  <p className="ui-text-sm ui-text-muted">Venue: {row.venueName ?? "TBD"}</p>
                  <p className="ui-text-sm ui-text-muted">Participants: {row.participantCount ?? 0}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="ui-button ui-button-neutral"
                    onClick={() => void updateStatus(row.id, "draft")}
                    disabled={busyId === row.id || row.status === "draft"}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    className="ui-button ui-button-accent"
                    onClick={() => void updateStatus(row.id, "open")}
                    disabled={busyId === row.id || row.status === "open"}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="ui-button ui-button-neutral"
                    onClick={() => void updateStatus(row.id, "finished")}
                    disabled={busyId === row.id || row.status === "finished"}
                  >
                    Finish
                  </button>
                  <button
                    type="button"
                    className="ui-button ui-button-neutral"
                    onClick={() => beginEdit(row)}
                    disabled={busyId === row.id}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="ui-button ui-button-danger disabled:opacity-60"
                    onClick={() => void removeSession(row.id)}
                    disabled={busyId === row.id}
                  >
                    {busyId === row.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {!loading && !rows.length ? <p className="mt-4 ui-text-sm ui-text-muted">No sessions to moderate.</p> : null}
    </section>
  );
}
