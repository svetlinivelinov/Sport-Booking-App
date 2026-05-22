import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { CourtManager } from "@/components/CourtManager";
import { AppNav } from "@/components/TopNav";

export default async function CourtPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <CourtManager />
    </div>
  );
}
