import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { sessions } from "@/db/schema";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const status = searchParams.get("status")?.trim();

  const whereClause = status ? eq(sessions.status, status) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(sessions)
    .where(whereClause);

  const rows = await db
    .select({
      id: sessions.id,
      title: sessions.title,
      status: sessions.status,
      startsAt: sessions.startsAt,
      venueName: sessions.venueName,
      groupId: sessions.groupId,
    })
    .from(sessions)
    .where(whereClause)
    .orderBy(desc(sessions.startsAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json({
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    rows,
  });
}
