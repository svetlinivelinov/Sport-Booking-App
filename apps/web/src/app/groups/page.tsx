import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { GroupsManager } from "@/components/GroupsManager";
import { AppNav } from "@/components/TopNav";

export default async function GroupsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <GroupsManager />
    </div>
  );
}
