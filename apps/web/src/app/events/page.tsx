import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { EventsManager } from "@/components/EventsManager";
import { AppNav } from "@/components/TopNav";

export default async function EventsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <EventsManager />
    </div>
  );
}
