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
      <input className="ui-input w-full opacity-80" value={email} disabled />
      <input
        className="ui-input w-full"
        placeholder="Display name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        required
      />
      <textarea
        className="ui-input w-full"
        rows={3}
        placeholder="Bio"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        disabled
      />
      <p className="ui-text-xs ui-text-muted">Bio editing will be enabled in a later migration.</p>
      {message ? (
        <p className={`ui-text-sm ${isError ? "text-[var(--app-danger)]" : "text-[var(--app-status-open-text)]"}`}>{message}</p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="ui-button ui-button-primary w-fit disabled:opacity-60"
      >
        {busy ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
