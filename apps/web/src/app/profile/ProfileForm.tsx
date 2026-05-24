"use client";

import { FormEvent, useEffect, useState } from "react";

interface ProfileUser {
  id: string;
  email: string;
  role: "user" | "admin";
  displayName: string;
}

interface ProfileFormProps {
  initialEmail: string;
}

export function ProfileForm({ initialEmail }: ProfileFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/auth/me", { method: "GET" });
      if (!res.ok) {
        return;
      }

      const payload = (await res.json()) as { user?: ProfileUser | null };
      if (!payload.user) {
        return;
      }

      setEmail(payload.user.email);
      setDisplayName(payload.user.displayName);
    }

    void loadProfile();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setIsError(false);

    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });

    const payload = (await res.json()) as { error?: string; user?: ProfileUser };

    if (!res.ok) {
      setMessage(payload.error ?? "Unable to save profile changes.");
      setIsError(true);
      setBusy(false);
      return;
    }

    if (payload.user) {
      setEmail(payload.user.email);
      setDisplayName(payload.user.displayName);
    }

    setMessage("Profile updated.");
    setIsError(false);
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3">
      <input className="w-full rounded-xl border border-black/10 px-3 py-2" value={email} disabled />
      <input
        className="w-full rounded-xl border border-black/10 px-3 py-2"
        placeholder="Display name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        required
      />
      <textarea
        className="w-full rounded-xl border border-black/10 px-3 py-2"
        rows={3}
        placeholder="Bio"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        disabled
      />
      <p className="text-xs ui-text-muted">Bio editing will be enabled in a later migration.</p>
      {message ? (
        <p className={`text-sm ${isError ? "text-[var(--app-danger)]" : "text-green-700"}`}>{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-fit rounded-xl bg-[var(--app-primary)] px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
