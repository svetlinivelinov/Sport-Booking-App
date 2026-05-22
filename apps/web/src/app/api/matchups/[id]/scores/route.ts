import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { submitScore } from "@/services/matchups";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ScoreBody {
  sideAScore?: number;
  sideBScore?: number;
  details?: Record<string, unknown>;
}

export async function POST(request: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { id } = await context.params;

  let body: ScoreBody;
  try {
    body = (await request.json()) as ScoreBody;
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const sideAScore = Number(body.sideAScore);
  const sideBScore = Number(body.sideBScore);

  if (!Number.isFinite(sideAScore) || sideAScore < 0 || !Number.isFinite(sideBScore) || sideBScore < 0) {
    return withCors(
      request,
      NextResponse.json({ error: "sideAScore and sideBScore must be non-negative numbers" }, { status: 400 }),
    );
  }

  const result = await submitScore(
    id,
    {
      sideAScore,
      sideBScore,
      details: body.details,
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
