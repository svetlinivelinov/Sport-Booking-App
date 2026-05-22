"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

function getDefaultStartsAtLocal(): string {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setSeconds(0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toLocalDateTimeValue(isoDate: string): string {
  const date = new Date(isoDate);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

interface SessionRow {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  venueName: string | null;
  groupId: string;
}

export function EventsManager() {
  const [title, setTitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState(getDefaultStartsAtLocal);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVenueName, setEditVenueName] = useState("");
  const [editStartsAtLocal, setEditStartsAtLocal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSessions() {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions?mine=1&page=1&pageSize=25", { cache: "no-store" });
      const data = (await res.json()) as { rows?: SessionRow[]; error?: string };

      if (!res.ok) {
        setMessage(data.error ?? "Unable to load sessions");
        return;
      }

      setSessions(data.rows ?? []);
    } catch {
      setMessage("Unable to load sessions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, venueName, startsAt: new Date(startsAtLocal).toISOString() }),
      });

      const data = (await res.json()) as { session?: SessionRow; error?: string };
      if (!res.ok || !data.session) {
        setMessage(data.error ?? "Failed to create session");
        return;
      }

      setSessions((prev) => [data.session as SessionRow, ...prev]);
      setTitle("");
      setVenueName("");
      setStartsAtLocal(getDefaultStartsAtLocal());
      setMessage("Draft created");
    } catch {
      setMessage("Failed to create session");
    } finally {
      setSaving(false);
    }
  }

  async function finalizeSession(id: string) {
    setMessage(null);

    try {
      const res = await fetch(`/api/sessions/${id}/finalize`, { method: "POST" });
      const data = (await res.json()) as { session?: SessionRow; error?: string };

      if (!res.ok || !data.session) {
        setMessage(data.error ?? "Failed to finalize session");
        return;
      }

      setSessions((prev) => prev.map((row) => (row.id === id ? data.session! : row)));
      setMessage("Session finalized");
    } catch {
      setMessage("Failed to finalize session");
    }
  }

  function startEditing(session: SessionRow) {
    setEditingId(session.id);
    setEditTitle(session.title);
    setEditVenueName(session.venueName ?? "");
    setEditStartsAtLocal(toLocalDateTimeValue(session.startsAt));
    setMessage(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditVenueName("");
    setEditStartsAtLocal("");
  }

  async function saveSessionChanges(id: string) {
    setUpdating(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          venueName: editVenueName,
          startsAt: new Date(editStartsAtLocal).toISOString(),
        }),
      });

      const data = (await res.json()) as { session?: SessionRow; error?: string };
      if (!res.ok || !data.session) {
        setMessage(data.error ?? "Failed to update session");
        return;
      }

      setSessions((prev) => prev.map((row) => (row.id === id ? data.session! : row)));
      cancelEditing();
      setMessage("Session updated");
    } catch {
      setMessage("Failed to update session");
    } finally {
      setUpdating(false);
    }
  }

  const sessionItems = useMemo(
    () =>
      sessions.map((row) => (
        <article key={row.id} className="rounded-2xl border border-black/5 bg-[var(--app-bg)] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{row.title}</p>
              <p className="text-sm text-[var(--app-muted)]">
                {new Date(row.startsAt).toLocaleString()} · {row.venueName ?? "TBA"} · {row.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startEditing(row)}
                className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold"
              >
                Edit
              </button>
              {row.status === "draft" ? (
                <button
                  type="button"
                  onClick={() => void finalizeSession(row.id)}
                  className="rounded-xl bg-[var(--app-accent)] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Finalize
                </button>
              ) : null}
            </div>
          </div>
          {editingId === row.id ? (
            <div className="mt-4 space-y-2 rounded-xl border border-black/10 bg-white p-3">
              <input
                className="w-full rounded-xl border border-black/10 px-3 py-2"
                placeholder="Session title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-black/10 px-3 py-2"
                placeholder="Venue"
                value={editVenueName}
                onChange={(event) => setEditVenueName(event.target.value)}
              />
              <input
                type="datetime-local"
                className="w-full rounded-xl border border-black/10 px-3 py-2"
                value={editStartsAtLocal}
                onChange={(event) => setEditStartsAtLocal(event.target.value)}
                required
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void saveSessionChanges(row.id)}
                  disabled={updating}
                  className="rounded-xl bg-[var(--app-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {updating ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </article>
      )),
    [editStartsAtLocal, editTitle, editVenueName, editingId, sessions, updating],
  );

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-2">
      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Create session</h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">Create a draft, then finalize it to make it active.</p>
        <form className="mt-5 space-y-3" onSubmit={onCreate}>
          <input
            className="w-full rounded-xl border border-black/10 px-3 py-2"
            placeholder="Session title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <input
            className="w-full rounded-xl border border-black/10 px-3 py-2"
            placeholder="Venue"
            value={venueName}
            onChange={(event) => setVenueName(event.target.value)}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--app-muted)]">Date and time</span>
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={startsAtLocal}
              onChange={(event) => setStartsAtLocal(event.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--app-primary)] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save draft"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Sessions</h2>
        {loading ? <p className="mt-2 text-sm text-[var(--app-muted)]">Loading sessions...</p> : null}
        {!loading && sessions.length === 0 ? <p className="mt-2 text-sm text-[var(--app-muted)]">No sessions yet.</p> : null}
        <div className="mt-4 space-y-3">{sessionItems}</div>
      </section>

      {message ? (
        <p className="lg:col-span-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--app-muted)]">{message}</p>
      ) : null}
    </main>
  );
}
