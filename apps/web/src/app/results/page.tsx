import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";
import { ResultsManager } from "@/components/ResultsManager";
import { AppNav } from "@/components/TopNav";

export default async function ResultsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-full">
      <AppNav />
      <ResultsManager />
    </div>
  );
}
