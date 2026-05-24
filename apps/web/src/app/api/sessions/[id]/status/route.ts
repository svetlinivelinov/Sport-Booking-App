import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateStatusBody {
  status?: "draft" | "open" | "finished";
}

const VALID_STATUSES = new Set(["draft", "open", "finished"]);

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

  let body: UpdateStatusBody;
  try {
    body = (await request.json()) as UpdateStatusBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.status || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "status must be one of: draft, open, finished" }, { status: 400 });
  }

  const [updated] = await db
    .update(sessions)
    .set({ status: body.status })
    .where(eq(sessions.id, id))
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
