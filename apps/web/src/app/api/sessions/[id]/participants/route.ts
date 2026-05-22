import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { sessionParticipants, sessions } from "@/db/schema";

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

  if (sessionRow.status !== "open") {
    return withCors(request, NextResponse.json({ error: "Only open sessions can be joined" }, { status: 409 }));
  }

  const existing = await db.query.sessionParticipants.findFirst({
    where: and(eq(sessionParticipants.sessionId, id), eq(sessionParticipants.userId, sessionUser.sub)),
  });

  if (existing) {
    return withCors(request, NextResponse.json({ ok: true, alreadyParticipant: true }));
  }

  await db.insert(sessionParticipants).values({
    sessionId: id,
    userId: sessionUser.sub,
    status: "joined",
  });

  return withCors(request, NextResponse.json({ ok: true }, { status: 201 }));
}

export async function DELETE(request: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { id } = await context.params;
  const sessionRow = await db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  if (!sessionRow) {
    return withCors(request, NextResponse.json({ error: "Session not found" }, { status: 404 }));
  }

  if (sessionRow.status === "finished") {
    return withCors(request, NextResponse.json({ error: "Cannot leave a finished session" }, { status: 409 }));
  }

  await db
    .delete(sessionParticipants)
    .where(and(eq(sessionParticipants.sessionId, id), eq(sessionParticipants.userId, sessionUser.sub)));

  return withCors(request, NextResponse.json({ ok: true }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
