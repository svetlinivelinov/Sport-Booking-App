import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { AppNav } from "@/components/TopNav";
import { ProfileForm } from "./ProfileForm";

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
          <ProfileForm initialEmail={user.email} />
        </section>
      </main>
    </div>
  );
}
