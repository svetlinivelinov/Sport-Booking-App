import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { MySessionsManager } from "@/components/MySessionsManager";
import { AppNav } from "@/components/TopNav";

export default async function MySessionsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <MySessionsManager />
    </div>
  );
}
