import { randomUUID } from "node:crypto";

import { and, count, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { groups, sessionParticipants, sessions, sports } from "@/db/schema";

interface CreateSessionBody {
  title?: string;
  venueName?: string;
  startsAt?: string;
  groupId?: string;
  sportId?: string;
}

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const status = searchParams.get("status")?.trim();
  const mine = searchParams.get("mine") === "1";
  const participating = searchParams.get("participating") === "1";

  let participatingIds: string[] | null = null;
  if (participating) {
    const participantRows = await db
      .select({ sessionId: sessionParticipants.sessionId })
      .from(sessionParticipants)
      .where(eq(sessionParticipants.userId, sessionUser.sub));
    participatingIds = participantRows.map((row) => row.sessionId);
  }

  let whereClause: ReturnType<typeof eq> | ReturnType<typeof and> | undefined;
  const filters: Array<ReturnType<typeof eq> | ReturnType<typeof inArray>> = [];
  if (status) {
    filters.push(eq(sessions.status, status));
  }
  if (mine) {
    filters.push(eq(sessions.createdByUserId, sessionUser.sub));
  }
  if (participating) {
    if (!participatingIds?.length) {
      return withCors(
        request,
        NextResponse.json({
          page,
          pageSize,
          total: 0,
          totalPages: 1,
          rows: [],
        }),
      );
    }
    filters.push(inArray(sessions.id, participatingIds));
  }

  if (filters.length === 1) {
    whereClause = filters[0];
  } else if (filters.length > 1) {
    whereClause = and(...filters);
  }

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

  const sessionIds = rows.map((row) => row.id);
  const participantRows = sessionIds.length
    ? await db
        .select({
          sessionId: sessionParticipants.sessionId,
          userId: sessionParticipants.userId,
          status: sessionParticipants.status,
        })
        .from(sessionParticipants)
        .where(inArray(sessionParticipants.sessionId, sessionIds))
    : [];

  const participantCountBySession = new Map<string, number>();
  const myParticipationBySession = new Map<string, string>();

  for (const participantRow of participantRows) {
    participantCountBySession.set(
      participantRow.sessionId,
      (participantCountBySession.get(participantRow.sessionId) ?? 0) + 1,
    );

    if (participantRow.userId === sessionUser.sub) {
      myParticipationBySession.set(participantRow.sessionId, participantRow.status);
    }
  }

  const enrichedRows = rows.map((row) => ({
    ...row,
    participantCount: participantCountBySession.get(row.id) ?? 0,
    isParticipant: myParticipationBySession.has(row.id),
    myParticipantStatus: myParticipationBySession.get(row.id) ?? null,
  }));

  return withCors(
    request,
    NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      rows: enrichedRows,
    }),
  );
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  let body: CreateSessionBody;
  try {
    body = (await request.json()) as CreateSessionBody;
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const title = body.title?.trim();
  const venueName = body.venueName?.trim() || null;

  if (!title) {
    return withCors(request, NextResponse.json({ error: "title is required" }, { status: 400 }));
  }

  let startsAt = new Date(Date.now() + 60 * 60 * 1000);
  if (body.startsAt) {
    const parsed = new Date(body.startsAt);
    if (Number.isNaN(parsed.getTime())) {
      return withCors(
        request,
        NextResponse.json({ error: "startsAt must be a valid date string" }, { status: 400 }),
      );
    }
    startsAt = parsed;
  }

  let resolvedGroupId: string | null = null;
  let resolvedSportId: string | null = null;

  if (body.groupId) {
    const group = await db.query.groups.findFirst({ where: eq(groups.id, body.groupId) });
    if (!group) {
      return withCors(request, NextResponse.json({ error: "groupId not found" }, { status: 400 }));
    }
    if (body.sportId && body.sportId !== group.sportId) {
      return withCors(
        request,
        NextResponse.json({ error: "sportId must match the selected group" }, { status: 400 }),
      );
    }
    resolvedGroupId = group.id;
    resolvedSportId = group.sportId;
  }

  if (!resolvedGroupId) {
    const ownedGroup = await db.query.groups.findFirst({ where: eq(groups.ownerUserId, sessionUser.sub) });
    if (ownedGroup) {
      resolvedGroupId = ownedGroup.id;
      resolvedSportId = ownedGroup.sportId;
    }
  }

  if (!resolvedGroupId && body.sportId) {
    const matchingGroup = await db.query.groups.findFirst({ where: eq(groups.sportId, body.sportId) });
    if (matchingGroup) {
      resolvedGroupId = matchingGroup.id;
      resolvedSportId = matchingGroup.sportId;
    }
  }

  if (!resolvedGroupId) {
    const firstGroup = await db.query.groups.findFirst();
    if (firstGroup) {
      resolvedGroupId = firstGroup.id;
      resolvedSportId = firstGroup.sportId;
    }
  }

  if (!resolvedGroupId || !resolvedSportId) {
    const defaultSportId = randomUUID();
    const defaultGroupId = randomUUID();
    const uniqueSuffix = Date.now().toString(36);

    await db.insert(sports).values({
      id: defaultSportId,
      slug: `custom-${uniqueSuffix}`,
      name: "Community Sport",
      teamSize: 2,
      scoringModel: "points",
      rankingModel: "points_then_diff",
      schedulingStrategy: "round_robin",
      rulesConfig: {},
    });

    await db.insert(groups).values({
      id: defaultGroupId,
      sportId: defaultSportId,
      ownerUserId: sessionUser.sub,
      name: "My Group",
      description: "Auto-created group for session planning",
    });

    resolvedSportId = defaultSportId;
    resolvedGroupId = defaultGroupId;
  }

  const [created] = await db
    .insert(sessions)
    .values({
      id: randomUUID(),
      sportId: resolvedSportId,
      groupId: resolvedGroupId,
      title,
      status: "draft",
      startsAt,
      venueName,
      notes: null,
      createdByUserId: sessionUser.sub,
    })
    .returning({
      id: sessions.id,
      title: sessions.title,
      status: sessions.status,
      startsAt: sessions.startsAt,
      venueName: sessions.venueName,
      groupId: sessions.groupId,
    });

  return withCors(request, NextResponse.json({ session: created }, { status: 201 }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
