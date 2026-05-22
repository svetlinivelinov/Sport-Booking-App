import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { MatchupStatus, updateMatchupStatus } from "@/services/matchups";

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface StatusBody {
  status?: MatchupStatus;
}

export async function PATCH(request: Request, context: RouteContext) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { id } = await context.params;

  let body: StatusBody;
  try {
    body = (await request.json()) as StatusBody;
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  if (!body.status || !["pending", "in_progress", "finished"].includes(body.status)) {
    return withCors(request, NextResponse.json({ error: "status must be pending, in_progress, or finished" }, { status: 400 }));
  }

  const result = await updateMatchupStatus(id, body.status, {
    sub: sessionUser.sub,
    role: sessionUser.role,
  });

  if (!result.ok) {
    return withCors(request, NextResponse.json({ error: result.error }, { status: result.status }));
  }

  return withCors(request, NextResponse.json({ matchup: result.matchup }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
