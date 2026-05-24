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
  participantCount?: number;
  isParticipant?: boolean;
  myParticipantStatus?: string | null;
}

export function EventsManager() {
  const [title, setTitle] = useState("");
  const [venueName, setVenueName] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState(getDefaultStartsAtLocal);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [discoverSessions, setDiscoverSessions] = useState<SessionRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVenueName, setEditVenueName] = useState("");
  const [editStartsAtLocal, setEditStartsAtLocal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
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

  async function loadDiscoverSessions() {
    try {
      const res = await fetch("/api/sessions?status=open&page=1&pageSize=25", { cache: "no-store" });
      const data = (await res.json()) as { rows?: SessionRow[]; error?: string };

      if (!res.ok) {
        setMessage(data.error ?? "Unable to load discover sessions");
        return;
      }

      setDiscoverSessions(data.rows ?? []);
    } catch {
      setMessage("Unable to load discover sessions");
    }
  }

  useEffect(() => {
    void loadSessions();
    void loadDiscoverSessions();
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
      void loadDiscoverSessions();
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
      setDiscoverSessions((prev) => prev.map((row) => (row.id === id ? data.session! : row)));
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
      setDiscoverSessions((prev) => prev.map((row) => (row.id === id ? data.session! : row)));
      cancelEditing();
      setMessage("Session updated");
    } catch {
      setMessage("Failed to update session");
    } finally {
      setUpdating(false);
    }
  }

  async function joinSession(id: string) {
    setJoiningId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/sessions/${id}/participants`, { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Failed to join session");
        return;
      }

      setDiscoverSessions((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                isParticipant: true,
                myParticipantStatus: "joined",
                participantCount: (row.participantCount ?? 0) + 1,
              }
            : row,
        ),
      );
      setMessage("Joined session");
    } catch {
      setMessage("Failed to join session");
    } finally {
      setJoiningId(null);
    }
  }

  async function leaveSession(id: string) {
    setLeavingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/sessions/${id}/participants`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Failed to leave session");
        return;
      }

      setDiscoverSessions((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                isParticipant: false,
                myParticipantStatus: null,
                participantCount: Math.max(0, (row.participantCount ?? 0) - 1),
              }
            : row,
        ),
      );
      setMessage("Left session");
    } catch {
      setMessage("Failed to leave session");
    } finally {
      setLeavingId(null);
    }
  }

  const sessionItems = useMemo(
    () =>
      sessions.map((row) => (
        <article key={row.id} className="ui-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{row.title}</p>
              <p className="ui-text-sm ui-text-muted">
                {new Date(row.startsAt).toLocaleString()} · {row.venueName ?? "TBA"} · {row.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startEditing(row)}
                className="ui-button ui-button-neutral"
              >
                Edit
              </button>
              {row.status === "draft" ? (
                <button
                  type="button"
                  onClick={() => void finalizeSession(row.id)}
                  className="ui-button ui-button-accent"
                >
                  Finalize
                </button>
              ) : null}
            </div>
          </div>
          {editingId === row.id ? (
            <div className="mt-4 space-y-2 rounded-xl border border-[var(--app-border-soft)] bg-[var(--app-surface)] p-3">
              <input
                className="ui-input w-full"
                placeholder="Session title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                required
              />
              <input
                className="ui-input w-full"
                placeholder="Venue"
                value={editVenueName}
                onChange={(event) => setEditVenueName(event.target.value)}
              />
              <input
                type="datetime-local"
                className="ui-input w-full"
                value={editStartsAtLocal}
                onChange={(event) => setEditStartsAtLocal(event.target.value)}
                required
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void saveSessionChanges(row.id)}
                  disabled={updating}
                  className="ui-button ui-button-primary disabled:opacity-60"
                >
                  {updating ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="ui-button ui-button-neutral"
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

  const discoverItems = useMemo(
    () =>
      discoverSessions.map((row) => (
        <article key={row.id} className="ui-card">
          <p className="font-semibold">{row.title}</p>
          <p className="ui-text-sm ui-text-muted">
            {new Date(row.startsAt).toLocaleString()} · {row.venueName ?? "TBA"} · {row.status}
          </p>
          <p className="mt-1 ui-text-xs ui-text-muted">Participants: {row.participantCount ?? 0}</p>
          <div className="mt-2">
            {row.isParticipant ? (
              <button
                type="button"
                onClick={() => void leaveSession(row.id)}
                disabled={leavingId === row.id}
                className="ui-button ui-button-neutral disabled:opacity-60"
              >
                {leavingId === row.id ? "Leaving..." : "Leave"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void joinSession(row.id)}
                disabled={joiningId === row.id}
                className="ui-button ui-button-accent disabled:opacity-60"
              >
                {joiningId === row.id ? "Joining..." : "Join"}
              </button>
            )}
          </div>
        </article>
      )),
    [discoverSessions, joiningId, leavingId],
  );

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-2">
      <section className="ui-section">
        <h1 className="ui-metric-value tracking-tight">Create session</h1>
        <p className="mt-2 ui-text-sm ui-text-muted">Create a draft, then finalize it to make it active.</p>
        <form className="mt-5 space-y-3" onSubmit={onCreate}>
          <input
            className="ui-input w-full"
            placeholder="Session title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <input
            className="ui-input w-full"
            placeholder="Venue"
            value={venueName}
            onChange={(event) => setVenueName(event.target.value)}
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium ui-text-muted">Date and time</span>
            <input
              type="datetime-local"
              className="ui-input w-full"
              value={startsAtLocal}
              onChange={(event) => setStartsAtLocal(event.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="ui-button ui-button-primary disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save draft"}
          </button>
        </form>
      </section>

      <section className="ui-section">
        <h2 className="ui-heading-section">Sessions</h2>
        {loading ? <p className="mt-2 ui-text-sm ui-text-muted">Loading sessions...</p> : null}
        {!loading && sessions.length === 0 ? <p className="mt-2 ui-text-sm ui-text-muted">No sessions yet.</p> : null}
        <div className="mt-4 space-y-3">{sessionItems}</div>
      </section>

      <section className="ui-section lg:col-span-2">
        <h2 className="ui-heading-section">Join open sessions</h2>
        {!discoverSessions.length ? <p className="mt-2 ui-text-sm ui-text-muted">No open sessions available.</p> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">{discoverItems}</div>
      </section>

      {message ? (
        <p className="lg:col-span-2 ui-card ui-text-sm ui-text-muted">{message}</p>
      ) : null}
    </main>
  );
}
