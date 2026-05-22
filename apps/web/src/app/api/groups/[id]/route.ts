import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { groups, sports } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateGroupBody {
  name?: string;
  description?: string;
}

export async function PATCH(request: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { id } = await context.params;
  const group = await db.query.groups.findFirst({ where: eq(groups.id, id) });
  if (!group) {
    return withCors(request, NextResponse.json({ error: "Group not found" }, { status: 404 }));
  }

  const canEdit = sessionUser.role === "admin" || group.ownerUserId === sessionUser.sub;
  if (!canEdit) {
    return withCors(request, NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }

  let body: UpdateGroupBody;
  try {
    body = (await request.json()) as UpdateGroupBody;
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const name = body.name?.trim();
  const description = body.description?.trim() || null;

  if (!name) {
    return withCors(request, NextResponse.json({ error: "name is required" }, { status: 400 }));
  }

  if (name.length < 3 || name.length > 120) {
    return withCors(
      request,
      NextResponse.json({ error: "name must be between 3 and 120 characters" }, { status: 400 }),
    );
  }

  const [updated] = await db
    .update(groups)
    .set({
      name,
      description,
    })
    .where(and(eq(groups.id, id), eq(groups.ownerUserId, group.ownerUserId)))
    .returning({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      sportId: groups.sportId,
      ownerUserId: groups.ownerUserId,
    });

  const sport = await db.query.sports.findFirst({ where: eq(sports.id, updated.sportId) });

  return withCors(
    request,
    NextResponse.json({
      group: {
        ...updated,
        sportName: sport?.name ?? "Unknown",
      },
    }),
  );
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

  const canDelete = sessionUser.role === "admin" || group.ownerUserId === sessionUser.sub;
  if (!canDelete) {
    return withCors(request, NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }

  await db.delete(groups).where(eq(groups.id, id));
  return withCors(request, NextResponse.json({ ok: true }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
