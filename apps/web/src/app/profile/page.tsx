import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Signed in as {user.email}</p>
          <form className="mt-6 grid gap-3">
            <input className="w-full rounded-xl border border-black/10 px-3 py-2" defaultValue={user.email} disabled />
            <input className="w-full rounded-xl border border-black/10 px-3 py-2" placeholder="Display name" />
            <textarea className="w-full rounded-xl border border-black/10 px-3 py-2" rows={3} placeholder="Bio" />
            <button type="button" className="w-fit rounded-xl bg-[var(--app-primary)] px-4 py-2 font-semibold text-white">
              Save changes
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
