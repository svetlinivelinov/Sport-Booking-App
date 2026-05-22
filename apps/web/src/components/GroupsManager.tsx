"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  sportId: string;
  sportName: string;
  isOwner: boolean;
  isMember: boolean;
  memberRole: string | null;
  memberCount: number;
}

export function GroupsManager() {
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadGroups() {
    setLoading(true);
    try {
      const response = await fetch("/api/groups", { cache: "no-store" });
      const payload = (await response.json()) as { rows?: GroupRow[]; error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Unable to load groups");
        return;
      }
      setRows(payload.rows ?? []);
    } catch {
      setMessage("Unable to load groups");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGroups();
  }, []);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const payload = (await response.json()) as { group?: GroupRow; error?: string };
      if (!response.ok || !payload.group) {
        setMessage(payload.error ?? "Unable to create group");
        return;
      }

      setRows((prev) => [payload.group!, ...prev]);
      setName("");
      setDescription("");
      setMessage("Group created");
    } catch {
      setMessage("Unable to create group");
    } finally {
      setSaving(false);
    }
  }

  async function joinGroup(groupId: string) {
    setMessage(null);
    const response = await fetch(`/api/groups/${groupId}/membership`, { method: "POST" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to join group");
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === groupId
          ? {
              ...row,
              isMember: true,
              memberRole: row.isOwner ? "owner" : "member",
              memberCount: row.isMember ? row.memberCount : row.memberCount + 1,
            }
          : row,
      ),
    );
  }

  async function leaveGroup(groupId: string) {
    setMessage(null);
    const response = await fetch(`/api/groups/${groupId}/membership`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to leave group");
      return;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.id === groupId
          ? {
              ...row,
              isMember: false,
              memberRole: null,
              memberCount: row.memberCount > 0 ? row.memberCount - 1 : 0,
            }
          : row,
      ),
    );
  }

  function startEdit(row: GroupRow) {
    setEditingId(row.id);
    setEditName(row.name);
    setEditDescription(row.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  async function saveEdit(groupId: string) {
    setUpdating(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });

      const payload = (await response.json()) as { group?: GroupRow; error?: string };
      if (!response.ok || !payload.group) {
        setMessage(payload.error ?? "Unable to update group");
        return;
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === groupId
            ? {
                ...row,
                name: payload.group!.name,
                description: payload.group!.description,
                sportName: payload.group!.sportName,
              }
            : row,
        ),
      );

      cancelEdit();
      setMessage("Group updated");
    } catch {
      setMessage("Unable to update group");
    } finally {
      setUpdating(false);
    }
  }

  async function deleteOwnedGroup(groupId: string) {
    const confirmed = typeof globalThis.confirm === "function" ? globalThis.confirm("Delete this group?") : true;
    if (!confirmed) {
      return;
    }

    setDeletingId(groupId);
    setMessage(null);
    try {
      const response = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Unable to delete group");
        return;
      }

      setRows((prev) => prev.filter((row) => row.id !== groupId));
      setMessage("Group deleted");
    } catch {
      setMessage("Unable to delete group");
    } finally {
      setDeletingId(null);
    }
  }

  const myGroups = useMemo(() => rows.filter((row) => row.isMember), [rows]);
  const discoverGroups = useMemo(() => rows.filter((row) => !row.isMember), [rows]);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10 lg:grid-cols-2">
      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Create group</h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">Start a community and invite players around a sport.</p>

        <form className="mt-5 space-y-3" onSubmit={onCreate}>
          <input
            className="w-full rounded-xl border border-black/10 px-3 py-2"
            placeholder="Group name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <textarea
            className="w-full rounded-xl border border-black/10 px-3 py-2"
            rows={3}
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--app-primary)] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create group"}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">My groups</h2>
        {loading ? <p className="mt-2 text-sm text-[var(--app-muted)]">Loading groups...</p> : null}
        {!loading && myGroups.length === 0 ? <p className="mt-2 text-sm text-[var(--app-muted)]">You have not joined any groups yet.</p> : null}

        <div className="mt-4 space-y-3">
          {myGroups.map((row) => (
            <article key={row.id} className="rounded-2xl border border-black/5 bg-[var(--app-bg)] px-4 py-3">
              {editingId === row.id ? (
                <div className="space-y-2">
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                  />
                  <textarea
                    className="w-full rounded-xl border border-black/10 px-3 py-2"
                    rows={3}
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit(row.id)}
                      disabled={updating}
                      className="rounded-xl bg-[var(--app-primary)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {updating ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{row.name}</p>
                    <p className="text-sm text-[var(--app-muted)]">
                      {row.sportName} · {row.memberCount} members · {row.memberRole ?? "member"}
                    </p>
                    {row.description ? <p className="mt-1 text-sm text-[var(--app-muted)]">{row.description}</p> : null}
                  </div>
                  {!row.isOwner ? (
                    <button
                      type="button"
                      onClick={() => void leaveGroup(row.id)}
                      className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold"
                    >
                      Leave
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-[var(--app-primary)] px-3 py-1.5 text-sm font-semibold text-white">Owner</span>
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteOwnedGroup(row.id)}
                        disabled={deletingId === row.id}
                        className="rounded-xl bg-[var(--app-danger)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {deletingId === row.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-2">
        <h2 className="text-xl font-semibold">Discover groups</h2>
        {!loading && discoverGroups.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--app-muted)]">No available groups to join right now.</p>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {discoverGroups.map((row) => (
            <article key={row.id} className="rounded-2xl border border-black/5 bg-[var(--app-bg)] px-4 py-3">
              <p className="font-semibold">{row.name}</p>
              <p className="text-sm text-[var(--app-muted)]">{row.sportName} · {row.memberCount} members</p>
              {row.description ? <p className="mt-1 text-sm text-[var(--app-muted)]">{row.description}</p> : null}
              <button
                type="button"
                onClick={() => void joinGroup(row.id)}
                className="mt-3 rounded-xl bg-[var(--app-accent)] px-3 py-1.5 text-sm font-semibold text-white"
              >
                Join group
              </button>
            </article>
          ))}
        </div>
      </section>

      {message ? (
        <p className="lg:col-span-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[var(--app-muted)]">{message}</p>
      ) : null}
    </main>
  );
}
