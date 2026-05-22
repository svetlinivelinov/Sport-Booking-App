import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const sessionRow = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });

  if (!sessionRow) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const canEdit = sessionUser.role === "admin" || sessionRow.createdByUserId === sessionUser.sub;
  if (!canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (sessionRow.status === "finished") {
    return NextResponse.json({ error: "Finished sessions cannot be finalized again" }, { status: 409 });
  }

  const [updated] = await db
    .update(sessions)
    .set({ status: "open" })
    .where(and(eq(sessions.id, id), eq(sessions.createdByUserId, sessionRow.createdByUserId)))
    .returning({
      id: sessions.id,
      title: sessions.title,
      status: sessions.status,
      startsAt: sessions.startsAt,
      venueName: sessions.venueName,
      groupId: sessions.groupId,
    });

  return NextResponse.json({ session: updated });
}
