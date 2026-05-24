import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { sports } from "@/db/schema";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const rows = await db
    .select({
      id: sports.id,
      slug: sports.slug,
      name: sports.name,
      teamSize: sports.teamSize,
      rulesConfig: sports.rulesConfig,
    })
    .from(sports)
    .orderBy(asc(sports.name));

  return withCors(request, NextResponse.json({ rows }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
