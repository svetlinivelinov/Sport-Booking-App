import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateSessionBody {
  title?: string;
  venueName?: string;
  startsAt?: string;
}

export async function PATCH(request: Request, context: RouteContext) {
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

  let body: UpdateSessionBody;
  try {
    body = (await request.json()) as UpdateSessionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = body.title?.trim();
  const venueName = body.venueName?.trim() || null;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!body.startsAt) {
    return NextResponse.json({ error: "startsAt is required" }, { status: 400 });
  }

  const startsAt = new Date(body.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "startsAt must be a valid date string" }, { status: 400 });
  }

  const [updated] = await db
    .update(sessions)
    .set({
      title,
      venueName,
      startsAt,
    })
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

export async function DELETE(_: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const sessionRow = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });

  if (!sessionRow) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const canDelete = sessionUser.role === "admin" || sessionRow.createdByUserId === sessionUser.sub;
  if (!canDelete) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(sessions).where(eq(sessions.id, id));

  return NextResponse.json({ ok: true });
}
