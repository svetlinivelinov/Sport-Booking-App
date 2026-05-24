import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { id } = await context.params;
  const sessionRow = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });

  if (!sessionRow) {
    return withCors(request, NextResponse.json({ error: "Session not found" }, { status: 404 }));
  }

  const canEdit = sessionUser.role === "admin" || sessionRow.createdByUserId === sessionUser.sub;
  if (!canEdit) {
    return withCors(request, NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }

  if (sessionRow.status === "open") {
    return withCors(
      request,
      NextResponse.json({
        session: {
          id: sessionRow.id,
          title: sessionRow.title,
          status: sessionRow.status,
          startsAt: sessionRow.startsAt,
          venueName: sessionRow.venueName,
          groupId: sessionRow.groupId,
        },
      }),
    );
  }

  if (sessionRow.status === "finished") {
    return withCors(
      request,
      NextResponse.json({ error: "Finished sessions cannot be finalized again" }, { status: 409 }),
    );
  }

  const [updated] = await db
    .update(sessions)
    .set({ status: "open" })
    .where(eq(sessions.id, id))
    .returning({
      id: sessions.id,
      title: sessions.title,
      status: sessions.status,
      startsAt: sessions.startsAt,
      venueName: sessions.venueName,
      groupId: sessions.groupId,
    });

  if (!updated) {
    return withCors(request, NextResponse.json({ error: "Session not found" }, { status: 404 }));
  }

  return withCors(request, NextResponse.json({ session: updated }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
