import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { matchups, scoreEntries, sessions, users } from "@/db/schema";

export type MatchupStatus = "pending" | "in_progress" | "finished";

export interface MatchupScoreView {
  id: string;
  matchupId: string;
  submittedByUserId: string;
  sideAScore: number;
  sideBScore: number;
  createdAt: Date;
  rawPayload: unknown;
}

export interface MatchupView {
  id: string;
  sessionId: string;
  roundNumber: number;
  slotNumber: number;
  status: string;
  sideAUserIds: string[];
  sideBUserIds: string[];
  latestScore: MatchupScoreView | null;
}

export interface SessionPermissionUser {
  sub: string;
  role: "user" | "admin";
}

interface ScoreInput {
  sideAScore: number;
  sideBScore: number;
  details?: Record<string, unknown>;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function parseScorePayload(payload: unknown): { sideAScore: number; sideBScore: number } | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const objectPayload = payload as Record<string, unknown>;
  const sideAScore = Number(objectPayload.sideAScore);
  const sideBScore = Number(objectPayload.sideBScore);

  if (!Number.isFinite(sideAScore) || !Number.isFinite(sideBScore)) {
    return null;
  }

  return {
    sideAScore,
    sideBScore,
  };
}

function canManageSession(sessionRow: { createdByUserId: string }, user: SessionPermissionUser): boolean {
  return user.role === "admin" || sessionRow.createdByUserId === user.sub;
}

export async function getSessionForMatchup(sessionId: string) {
  return db.query.sessions.findFirst({ where: eq(sessions.id, sessionId) });
}

export async function getMatchupById(matchupId: string) {
  return db.query.matchups.findFirst({ where: eq(matchups.id, matchupId) });
}

export async function listMatchupsForSession(sessionId: string): Promise<MatchupView[]> {
  const rows = await db
    .select({
      id: matchups.id,
      sessionId: matchups.sessionId,
      roundNumber: matchups.roundNumber,
      slotNumber: matchups.slotNumber,
      status: matchups.status,
      sideAUserIds: matchups.sideAUserIds,
      sideBUserIds: matchups.sideBUserIds,
    })
    .from(matchups)
    .where(eq(matchups.sessionId, sessionId))
    .orderBy(asc(matchups.roundNumber), asc(matchups.slotNumber));

  if (!rows.length) {
    return [];
  }

  const matchupIds = rows.map((row) => row.id);
  const scoreRows = await db
    .select({
      id: scoreEntries.id,
      matchupId: scoreEntries.matchupId,
      submittedByUserId: scoreEntries.submittedByUserId,
      scorePayload: scoreEntries.scorePayload,
      createdAt: scoreEntries.createdAt,
    })
    .from(scoreEntries)
    .where(inArray(scoreEntries.matchupId, matchupIds))
    .orderBy(desc(scoreEntries.createdAt));

  const latestByMatchup = new Map<string, MatchupScoreView>();
  for (const scoreRow of scoreRows) {
    if (latestByMatchup.has(scoreRow.matchupId)) {
      continue;
    }

    const parsed = parseScorePayload(scoreRow.scorePayload);
    if (!parsed) {
      continue;
    }

    latestByMatchup.set(scoreRow.matchupId, {
      id: scoreRow.id,
      matchupId: scoreRow.matchupId,
      submittedByUserId: scoreRow.submittedByUserId,
      sideAScore: parsed.sideAScore,
      sideBScore: parsed.sideBScore,
      createdAt: scoreRow.createdAt,
      rawPayload: scoreRow.scorePayload,
    });
  }

  return rows.map((row) => ({
    ...row,
    sideAUserIds: toStringArray(row.sideAUserIds),
    sideBUserIds: toStringArray(row.sideBUserIds),
    latestScore: latestByMatchup.get(row.id) ?? null,
  }));
}

export async function createMatchup(
  sessionId: string,
  input: {
    roundNumber: number;
    slotNumber: number;
    sideAUserIds: string[];
    sideBUserIds: string[];
  },
  user: SessionPermissionUser,
) {
  const sessionRow = await getSessionForMatchup(sessionId);
  if (!sessionRow) {
    return { ok: false as const, status: 404, error: "Session not found" };
  }

  if (!canManageSession(sessionRow, user)) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  const [created] = await db
    .insert(matchups)
    .values({
      id: randomUUID(),
      sessionId,
      roundNumber: input.roundNumber,
      slotNumber: input.slotNumber,
      status: "pending",
      sideAUserIds: input.sideAUserIds,
      sideBUserIds: input.sideBUserIds,
    })
    .returning({
      id: matchups.id,
      sessionId: matchups.sessionId,
      roundNumber: matchups.roundNumber,
      slotNumber: matchups.slotNumber,
      status: matchups.status,
      sideAUserIds: matchups.sideAUserIds,
      sideBUserIds: matchups.sideBUserIds,
    });

  return {
    ok: true as const,
    matchup: {
      ...created,
      sideAUserIds: toStringArray(created.sideAUserIds),
      sideBUserIds: toStringArray(created.sideBUserIds),
      latestScore: null,
    } satisfies MatchupView,
  };
}

export async function updateMatchupStatus(matchupId: string, nextStatus: MatchupStatus, user: SessionPermissionUser) {
  const matchupRow = await getMatchupById(matchupId);
  if (!matchupRow) {
    return { ok: false as const, status: 404, error: "Matchup not found" };
  }

  const sessionRow = await getSessionForMatchup(matchupRow.sessionId);
  if (!sessionRow) {
    return { ok: false as const, status: 404, error: "Session not found" };
  }

  if (!canManageSession(sessionRow, user)) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  const transitions: Record<string, string[]> = {
    pending: ["in_progress", "finished"],
    in_progress: ["finished"],
    finished: [],
  };

  if (!transitions[matchupRow.status]?.includes(nextStatus)) {
    return { ok: false as const, status: 409, error: "Invalid status transition" };
  }

  const [updated] = await db
    .update(matchups)
    .set({ status: nextStatus })
    .where(eq(matchups.id, matchupId))
    .returning({
      id: matchups.id,
      sessionId: matchups.sessionId,
      roundNumber: matchups.roundNumber,
      slotNumber: matchups.slotNumber,
      status: matchups.status,
      sideAUserIds: matchups.sideAUserIds,
      sideBUserIds: matchups.sideBUserIds,
    });

  return {
    ok: true as const,
    matchup: {
      ...updated,
      sideAUserIds: toStringArray(updated.sideAUserIds),
      sideBUserIds: toStringArray(updated.sideBUserIds),
      latestScore: null,
    } satisfies MatchupView,
  };
}

export async function submitScore(matchupId: string, input: ScoreInput, user: SessionPermissionUser) {
  const matchupRow = await getMatchupById(matchupId);
  if (!matchupRow) {
    return { ok: false as const, status: 404, error: "Matchup not found" };
  }

  const sessionRow = await getSessionForMatchup(matchupRow.sessionId);
  if (!sessionRow) {
    return { ok: false as const, status: 404, error: "Session not found" };
  }

  const sideAIds = toStringArray(matchupRow.sideAUserIds);
  const sideBIds = toStringArray(matchupRow.sideBUserIds);
  const isParticipant = sideAIds.includes(user.sub) || sideBIds.includes(user.sub);
  if (!isParticipant && !canManageSession(sessionRow, user)) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  if (!["pending", "in_progress"].includes(matchupRow.status)) {
    return { ok: false as const, status: 409, error: "Invalid matchup status" };
  }

  const payload = {
    sideAScore: input.sideAScore,
    sideBScore: input.sideBScore,
    details: input.details ?? {},
  };

  const [{ scoreRow, matchupRow: updatedMatchup }] = await db.transaction(async (tx) => {
    const [createdScore] = await tx
      .insert(scoreEntries)
      .values({
        id: randomUUID(),
        matchupId,
        submittedByUserId: user.sub,
        scorePayload: payload,
      })
      .returning({
        id: scoreEntries.id,
        matchupId: scoreEntries.matchupId,
        submittedByUserId: scoreEntries.submittedByUserId,
        scorePayload: scoreEntries.scorePayload,
        createdAt: scoreEntries.createdAt,
      });

    const [updated] = await tx
      .update(matchups)
      .set({ status: "finished" })
      .where(eq(matchups.id, matchupId))
      .returning({
        id: matchups.id,
        sessionId: matchups.sessionId,
        roundNumber: matchups.roundNumber,
        slotNumber: matchups.slotNumber,
        status: matchups.status,
        sideAUserIds: matchups.sideAUserIds,
        sideBUserIds: matchups.sideBUserIds,
      });

    return [{ scoreRow: createdScore, matchupRow: updated }];
  });

  const parsed = parseScorePayload(scoreRow.scorePayload);
  const latestScore: MatchupScoreView | null = parsed
    ? {
        id: scoreRow.id,
        matchupId: scoreRow.matchupId,
        submittedByUserId: scoreRow.submittedByUserId,
        sideAScore: parsed.sideAScore,
        sideBScore: parsed.sideBScore,
        createdAt: scoreRow.createdAt,
        rawPayload: scoreRow.scorePayload,
      }
    : null;

  return {
    ok: true as const,
    matchup: {
      ...updatedMatchup,
      sideAUserIds: toStringArray(updatedMatchup.sideAUserIds),
      sideBUserIds: toStringArray(updatedMatchup.sideBUserIds),
      latestScore,
    } satisfies MatchupView,
  };
}

export interface ResultRow {
  matchupId: string;
  sessionId: string;
  sessionTitle: string;
  roundNumber: number;
  slotNumber: number;
  sideAUserIds: string[];
  sideBUserIds: string[];
  sideAScore: number;
  sideBScore: number;
  winnerSide: "A" | "B" | "draw";
  submittedAt: Date;
}

async function getLatestScoresByMatchupIds(matchupIds: string[]) {
  const latestByMatchup = new Map<string, { sideAScore: number; sideBScore: number; submittedAt: Date }>();

  if (!matchupIds.length) {
    return latestByMatchup;
  }

  const scoreRows = await db
    .select({
      matchupId: scoreEntries.matchupId,
      scorePayload: scoreEntries.scorePayload,
      createdAt: scoreEntries.createdAt,
    })
    .from(scoreEntries)
    .where(inArray(scoreEntries.matchupId, matchupIds))
    .orderBy(desc(scoreEntries.createdAt));

  for (const scoreRow of scoreRows) {
    if (latestByMatchup.has(scoreRow.matchupId)) {
      continue;
    }

    const parsed = parseScorePayload(scoreRow.scorePayload);
    if (!parsed) {
      continue;
    }

    latestByMatchup.set(scoreRow.matchupId, {
      sideAScore: parsed.sideAScore,
      sideBScore: parsed.sideBScore,
      submittedAt: scoreRow.createdAt,
    });
  }

  return latestByMatchup;
}

export async function getResultsPage(input: { sessionId?: string; page: number; pageSize: number }) {
  const filters = [eq(matchups.status, "finished")];

  if (input.sessionId) {
    filters.push(eq(matchups.sessionId, input.sessionId));
  }

  const whereClause = filters.length === 1 ? filters[0] : and(...filters);

  const pagedMatchupRows = await db
    .select({
      matchupId: matchups.id,
      sessionId: matchups.sessionId,
      sessionTitle: sessions.title,
      roundNumber: matchups.roundNumber,
      slotNumber: matchups.slotNumber,
      sideAUserIds: matchups.sideAUserIds,
      sideBUserIds: matchups.sideBUserIds,
    })
    .from(matchups)
    .innerJoin(sessions, eq(matchups.sessionId, sessions.id))
    .where(whereClause)
    .orderBy(desc(matchups.createdAt))
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize);

  const pagedMatchupIds = pagedMatchupRows.map((row) => row.matchupId);
  const latestByPagedMatchup = await getLatestScoresByMatchupIds(pagedMatchupIds);

  const rows: ResultRow[] = pagedMatchupRows
    .map((row) => {
      const score = latestByPagedMatchup.get(row.matchupId);
      if (!score) {
        return null;
      }

      const winnerSide =
        score.sideAScore === score.sideBScore ? "draw" : score.sideAScore > score.sideBScore ? "A" : "B";

      return {
        matchupId: row.matchupId,
        sessionId: row.sessionId,
        sessionTitle: row.sessionTitle,
        roundNumber: row.roundNumber,
        slotNumber: row.slotNumber,
        sideAUserIds: toStringArray(row.sideAUserIds),
        sideBUserIds: toStringArray(row.sideBUserIds),
        sideAScore: score.sideAScore,
        sideBScore: score.sideBScore,
        winnerSide,
        submittedAt: score.submittedAt,
      };
    })
    .filter((row): row is ResultRow => Boolean(row));

  const leaderboardMatchupRows = await db
    .select({
      matchupId: matchups.id,
      sideAUserIds: matchups.sideAUserIds,
      sideBUserIds: matchups.sideBUserIds,
    })
    .from(matchups)
    .where(whereClause);

  const leaderboardMatchupIds = leaderboardMatchupRows.map((row) => row.matchupId);
  const latestByLeaderboardMatchup = await getLatestScoresByMatchupIds(leaderboardMatchupIds);

  const scoredLeaderboardRows = leaderboardMatchupRows
    .map((row) => {
      const score = latestByLeaderboardMatchup.get(row.matchupId);
      if (!score) {
        return null;
      }

      const winnerSide =
        score.sideAScore === score.sideBScore ? "draw" : score.sideAScore > score.sideBScore ? "A" : "B";

      return {
        sideAUserIds: toStringArray(row.sideAUserIds),
        sideBUserIds: toStringArray(row.sideBUserIds),
        winnerSide,
      };
    })
    .filter(
      (
        row,
      ): row is { sideAUserIds: string[]; sideBUserIds: string[]; winnerSide: "A" | "B" | "draw" } =>
        Boolean(row),
    );

  const allUserIds = Array.from(
    new Set(scoredLeaderboardRows.flatMap((row) => [...row.sideAUserIds, ...row.sideBUserIds])),
  );
  const userRows = allUserIds.length
    ? await db.select({ id: users.id, displayName: users.displayName }).from(users).where(inArray(users.id, allUserIds))
    : [];

  const nameByUserId = new Map(userRows.map((row) => [row.id, row.displayName]));

  const leaderboardMap = new Map<string, { userId: string; displayName: string; wins: number; losses: number; draws: number }>();

  for (const resultRow of scoredLeaderboardRows) {
    for (const userId of resultRow.sideAUserIds) {
      const entry = leaderboardMap.get(userId) ?? {
        userId,
        displayName: nameByUserId.get(userId) ?? userId,
        wins: 0,
        losses: 0,
        draws: 0,
      };

      if (resultRow.winnerSide === "A") {
        entry.wins += 1;
      } else if (resultRow.winnerSide === "B") {
        entry.losses += 1;
      } else {
        entry.draws += 1;
      }

      leaderboardMap.set(userId, entry);
    }

    for (const userId of resultRow.sideBUserIds) {
      const entry = leaderboardMap.get(userId) ?? {
        userId,
        displayName: nameByUserId.get(userId) ?? userId,
        wins: 0,
        losses: 0,
        draws: 0,
      };

      if (resultRow.winnerSide === "B") {
        entry.wins += 1;
      } else if (resultRow.winnerSide === "A") {
        entry.losses += 1;
      } else {
        entry.draws += 1;
      }

      leaderboardMap.set(userId, entry);
    }
  }

  const leaderboard = Array.from(leaderboardMap.values()).sort((a, b) => {
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    if (a.losses !== b.losses) {
      return a.losses - b.losses;
    }
    return b.draws - a.draws;
  });

  return {
    rows,
    leaderboard,
  };
}
