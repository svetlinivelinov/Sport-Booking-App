import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { groupMembers, groups, sports } from "@/db/schema";

interface CreateGroupBody {
  name?: string;
  description?: string;
  sportId?: string;
}

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const groupRows = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      ownerUserId: groups.ownerUserId,
      sportId: groups.sportId,
      sportName: sports.name,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .innerJoin(sports, eq(sports.id, groups.sportId));

  const memberships = await db
    .select({
      groupId: groupMembers.groupId,
      userId: groupMembers.userId,
      role: groupMembers.role,
    })
    .from(groupMembers);

  const memberCounts = new Map<string, number>();
  const userMemberships = new Map<string, { role: string }>();

  for (const membership of memberships) {
    memberCounts.set(membership.groupId, (memberCounts.get(membership.groupId) ?? 0) + 1);
    if (membership.userId === sessionUser.sub) {
      userMemberships.set(membership.groupId, { role: membership.role });
    }
  }

  const rows = groupRows.map((groupRow) => {
    const userMembership = userMemberships.get(groupRow.id);
    const isOwner = groupRow.ownerUserId === sessionUser.sub;

    return {
      id: groupRow.id,
      name: groupRow.name,
      description: groupRow.description,
      sportId: groupRow.sportId,
      sportName: groupRow.sportName,
      createdAt: groupRow.createdAt,
      isOwner,
      isMember: isOwner || Boolean(userMembership),
      memberRole: isOwner ? "owner" : userMembership?.role ?? null,
      memberCount: memberCounts.get(groupRow.id) ?? 0,
    };
  });

  return withCors(request, NextResponse.json({ rows }));
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  let body: CreateGroupBody;
  try {
    body = (await request.json()) as CreateGroupBody;
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

  let sportId = body.sportId;
  if (sportId) {
    const sport = await db.query.sports.findFirst({ where: eq(sports.id, sportId) });
    if (!sport) {
      return withCors(request, NextResponse.json({ error: "sportId not found" }, { status: 400 }));
    }
  } else {
    const firstSport = await db.query.sports.findFirst();
    if (!firstSport) {
      return withCors(
        request,
        NextResponse.json({ error: "No sports available. Seed or create a sport first." }, { status: 400 }),
      );
    }
    sportId = firstSport.id;
  }

  const groupId = randomUUID();

  const [created] = await db
    .insert(groups)
    .values({
      id: groupId,
      sportId,
      ownerUserId: sessionUser.sub,
      name,
      description,
    })
    .returning({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      sportId: groups.sportId,
      ownerUserId: groups.ownerUserId,
      createdAt: groups.createdAt,
    });

  await db.insert(groupMembers).values({
    groupId,
    userId: sessionUser.sub,
    role: "manager",
  });

  const sport = await db.query.sports.findFirst({ where: eq(sports.id, created.sportId) });

  return withCors(
    request,
    NextResponse.json(
    {
      group: {
        ...created,
        sportName: sport?.name ?? "Unknown",
        isOwner: true,
        isMember: true,
        memberRole: "owner",
        memberCount: 1,
      },
    },
    { status: 201 },
    ),
  );
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
