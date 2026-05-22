import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { matchups } from "@/db/schema";
import { getResultsPage } from "@/services/matchups";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  const [{ total }] = await db
    .select({ total: count() })
    .from(matchups)
    .where(sessionId ? and(eq(matchups.status, "finished"), eq(matchups.sessionId, sessionId)) : eq(matchups.status, "finished"));

  const data = await getResultsPage({
    sessionId,
    page,
    pageSize,
  });

  return withCors(
    request,
    NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      rows: data.rows,
      leaderboard: data.leaderboard,
    }),
  );
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
