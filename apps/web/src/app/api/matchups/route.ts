import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { createMatchup, listMatchupsForSession } from "@/services/matchups";

interface CreateMatchupBody {
  sessionId?: string;
  roundNumber?: number;
  slotNumber?: number;
  sideAUserIds?: string[];
  sideBUserIds?: string[];
}

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId")?.trim();

  if (!sessionId) {
    return withCors(request, NextResponse.json({ error: "sessionId is required" }, { status: 400 }));
  }

  const rows = await listMatchupsForSession(sessionId);
  return withCors(request, NextResponse.json({ rows }));
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  let body: CreateMatchupBody;
  try {
    body = (await request.json()) as CreateMatchupBody;
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return withCors(request, NextResponse.json({ error: "sessionId is required" }, { status: 400 }));
  }

  const roundNumber = Number(body.roundNumber);
  const slotNumber = Number(body.slotNumber);
  if (!Number.isInteger(roundNumber) || roundNumber < 1) {
    return withCors(request, NextResponse.json({ error: "roundNumber must be a positive integer" }, { status: 400 }));
  }
  if (!Number.isInteger(slotNumber) || slotNumber < 1) {
    return withCors(request, NextResponse.json({ error: "slotNumber must be a positive integer" }, { status: 400 }));
  }

  const sideAUserIds = Array.isArray(body.sideAUserIds) ? body.sideAUserIds.filter((id): id is string => typeof id === "string") : [];
  const sideBUserIds = Array.isArray(body.sideBUserIds) ? body.sideBUserIds.filter((id): id is string => typeof id === "string") : [];

  if (!sideAUserIds.length || !sideBUserIds.length) {
    return withCors(request, NextResponse.json({ error: "Both sides must contain at least one user id" }, { status: 400 }));
  }

  const result = await createMatchup(
    sessionId,
    {
      roundNumber,
      slotNumber,
      sideAUserIds,
      sideBUserIds,
    },
    {
      sub: sessionUser.sub,
      role: sessionUser.role,
    },
  );

  if (!result.ok) {
    return withCors(request, NextResponse.json({ error: result.error }, { status: result.status }));
  }

  return withCors(request, NextResponse.json({ matchup: result.matchup }, { status: 201 }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
