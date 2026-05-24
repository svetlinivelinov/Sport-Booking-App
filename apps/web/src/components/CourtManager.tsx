"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface SessionRow {
  id: string;
  title: string;
  status: string;
  startsAt: string;
}

interface MatchupRow {
  id: string;
  sessionId: string;
  roundNumber: number;
  slotNumber: number;
  status: string;
  sideAUserIds: string[];
  sideBUserIds: string[];
  latestScore: {
    sideAScore: number;
    sideBScore: number;
  } | null;
}

export function CourtManager() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [matchups, setMatchups] = useState<MatchupRow[]>([]);
  const [roundNumber, setRoundNumber] = useState("1");
  const [slotNumber, setSlotNumber] = useState("1");
  const [sideAUsers, setSideAUsers] = useState("");
  const [sideBUsers, setSideBUsers] = useState("");
  const [scoreByMatchup, setScoreByMatchup] = useState<Record<string, { sideAScore: string; sideBScore: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSessions() {
    const res = await fetch("/api/sessions?mine=1&page=1&pageSize=100", { cache: "no-store" });
    const data = (await res.json()) as { rows?: SessionRow[]; error?: string };

    if (!res.ok) {
      setMessage(data.error ?? "Failed to load sessions");
      return;
    }

    const rows = data.rows ?? [];
    setSessions(rows);

    if (!selectedSessionId && rows.length) {
      setSelectedSessionId(rows[0].id);
    }
  }

  async function loadMatchups(sessionId: string) {
    if (!sessionId) {
      setMatchups([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/matchups?sessionId=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
      const data = (await res.json()) as { rows?: MatchupRow[]; error?: string };

      if (!res.ok) {
        setMessage(data.error ?? "Failed to load matchups");
        return;
      }

      setMatchups(data.rows ?? []);
    } catch {
      setMessage("Failed to load matchups");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  useEffect(() => {
    void loadMatchups(selectedSessionId);
  }, [selectedSessionId]);

  async function onCreateMatchup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSessionId) {
      setMessage("Pick a session first");
      return;
    }

    const sideAUserIds = sideAUsers
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const sideBUserIds = sideBUsers
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/matchups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          roundNumber: Number(roundNumber),
          slotNumber: Number(slotNumber),
          sideAUserIds,
          sideBUserIds,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Failed to create matchup");
        return;
      }

      setRoundNumber("1");
      setSlotNumber("1");
      setSideAUsers("");
      setSideBUsers("");
      setMessage("Matchup created");
      await loadMatchups(selectedSessionId);
    } catch {
      setMessage("Failed to create matchup");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(matchupId: string, status: "in_progress" | "finished") {
    setMessage(null);

    const res = await fetch(`/api/matchups/${matchupId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Failed to update status");
      return;
    }

    await loadMatchups(selectedSessionId);
  }

  async function submitScore(matchupId: string) {
    const score = scoreByMatchup[matchupId] ?? { sideAScore: "0", sideBScore: "0" };
    setMessage(null);

    const res = await fetch(`/api/matchups/${matchupId}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sideAScore: Number(score.sideAScore),
        sideBScore: Number(score.sideBScore),
      }),
    });

    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(data.error ?? "Failed to submit score");
      return;
    }

    setMessage("Score submitted");
    await loadMatchups(selectedSessionId);
  }

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions],
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="ui-heading-page">Court</h1>
      <p className="mt-2 ui-text-muted">Manage matchups and submit scores.</p>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="ui-section">
          <h2 className="ui-heading-section">Session selector</h2>
          <select
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
            className="mt-3 ui-input w-full"
          >
            <option value="">Select a session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} ({session.status})
              </option>
            ))}
          </select>
          {selectedSession ? (
            <p className="mt-3 ui-text-sm ui-text-muted">Starts: {new Date(selectedSession.startsAt).toLocaleString()}</p>
          ) : null}
        </article>

        <article className="ui-section">
          <h2 className="ui-heading-section">Create matchup</h2>
          <form className="mt-3 space-y-2" onSubmit={onCreateMatchup}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={1}
                value={roundNumber}
                onChange={(event) => setRoundNumber(event.target.value)}
                className="ui-input"
                placeholder="Round"
              />
              <input
                type="number"
                min={1}
                value={slotNumber}
                onChange={(event) => setSlotNumber(event.target.value)}
                className="ui-input"
                placeholder="Slot"
              />
            </div>
            <input
              value={sideAUsers}
              onChange={(event) => setSideAUsers(event.target.value)}
              className="ui-input w-full"
              placeholder="Side A user IDs (comma separated)"
            />
            <input
              value={sideBUsers}
              onChange={(event) => setSideBUsers(event.target.value)}
              className="ui-input w-full"
              placeholder="Side B user IDs (comma separated)"
            />
            <button
              type="submit"
              disabled={saving || !selectedSessionId}
              className="ui-button ui-button-primary disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create matchup"}
            </button>
          </form>
        </article>
      </section>

      <section className="mt-6 ui-section">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="ui-heading-section">Matchups</h2>
          <div className="flex items-center gap-2">
            {selectedSessionId ? (
              <Link
                href={`/results?sessionId=${encodeURIComponent(selectedSessionId)}`}
                className="ui-button ui-button-neutral"
              >
                View results
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void loadMatchups(selectedSessionId)}
              className="ui-button ui-button-neutral"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? <p className="ui-text-sm ui-text-muted">Loading matchups...</p> : null}
        {!loading && !matchups.length ? <p className="ui-text-sm ui-text-muted">No matchups yet.</p> : null}

        <div className="space-y-3">
          {matchups.map((matchup) => (
            <article key={matchup.id} className="ui-card">
              <p className="font-semibold">
                Round {matchup.roundNumber} · Slot {matchup.slotNumber} · {matchup.status}
              </p>
              <p className="ui-text-sm ui-text-muted">A: {matchup.sideAUserIds.join(", ") || "n/a"}</p>
              <p className="ui-text-sm ui-text-muted">B: {matchup.sideBUserIds.join(", ") || "n/a"}</p>
              <p className="mt-1 ui-text-sm ui-text-muted">
                Latest score: {matchup.latestScore ? `${matchup.latestScore.sideAScore} - ${matchup.latestScore.sideBScore}` : "none"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {matchup.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => void setStatus(matchup.id, "in_progress")}
                    className="ui-button ui-button-neutral"
                  >
                    Start matchup
                  </button>
                ) : null}

                <input
                  type="number"
                  min={0}
                  value={scoreByMatchup[matchup.id]?.sideAScore ?? "0"}
                  disabled={matchup.status === "finished"}
                  onChange={(event) =>
                    setScoreByMatchup((prev) => ({
                      ...prev,
                      [matchup.id]: { ...(prev[matchup.id] ?? { sideAScore: "0", sideBScore: "0" }), sideAScore: event.target.value },
                    }))
                  }
                  className="w-20 rounded-xl border border-[var(--app-border-soft)] px-2 py-1"
                />
                <span className="ui-text-sm ui-text-muted">-</span>
                <input
                  type="number"
                  min={0}
                  value={scoreByMatchup[matchup.id]?.sideBScore ?? "0"}
                  disabled={matchup.status === "finished"}
                  onChange={(event) =>
                    setScoreByMatchup((prev) => ({
                      ...prev,
                      [matchup.id]: { ...(prev[matchup.id] ?? { sideAScore: "0", sideBScore: "0" }), sideBScore: event.target.value },
                    }))
                  }
                  className="w-20 rounded-xl border border-[var(--app-border-soft)] px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => void submitScore(matchup.id)}
                  disabled={matchup.status === "finished"}
                  className="ui-button ui-button-accent disabled:opacity-60"
                >
                  {matchup.status === "finished" ? "Finalized" : "Submit score"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {message ? <p className="mt-6 ui-card ui-text-sm ui-text-muted">{message}</p> : null}
    </main>
  );
}
