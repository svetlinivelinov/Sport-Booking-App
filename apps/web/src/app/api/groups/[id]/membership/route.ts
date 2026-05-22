import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { groupMembers, groups } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { id } = await context.params;
  const group = await db.query.groups.findFirst({ where: eq(groups.id, id) });
  if (!group) {
    return withCors(request, NextResponse.json({ error: "Group not found" }, { status: 404 }));
  }

  const existing = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, id), eq(groupMembers.userId, sessionUser.sub)),
  });

  if (existing) {
    return withCors(request, NextResponse.json({ ok: true, alreadyMember: true }));
  }

  await db.insert(groupMembers).values({
    groupId: id,
    userId: sessionUser.sub,
    role: "member",
  });

  return withCors(request, NextResponse.json({ ok: true }, { status: 201 }));
}

export async function DELETE(request: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { id } = await context.params;
  const group = await db.query.groups.findFirst({ where: eq(groups.id, id) });
  if (!group) {
    return withCors(request, NextResponse.json({ error: "Group not found" }, { status: 404 }));
  }

  if (group.ownerUserId === sessionUser.sub) {
    return withCors(
      request,
      NextResponse.json({ error: "Owner cannot leave. Transfer ownership first." }, { status: 409 }),
    );
  }

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, id), eq(groupMembers.userId, sessionUser.sub)));

  return withCors(request, NextResponse.json({ ok: true }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
