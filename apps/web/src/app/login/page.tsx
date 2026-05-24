"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { PublicNav } from "@/components/TopNav";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setMessage(data.error ?? "Login failed");
      setBusy(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-full">
      <PublicNav />
      <main className="mx-auto max-w-md px-6 py-14">
        <section className="rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">Login</h1>
          <p className="mt-2 text-sm ui-text-muted">Access your dashboard and active sessions.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:border-[var(--app-primary)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:border-[var(--app-primary)]"
              />
            </label>
            {message ? <p className="text-sm text-[var(--app-danger)]">{message}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[var(--app-primary)] px-4 py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
