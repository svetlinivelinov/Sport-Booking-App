import { redirect } from "next/navigation";

import { getSessionUser } from "@/auth/session";

export default async function CourtPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  redirect("/my-sessions");
}
