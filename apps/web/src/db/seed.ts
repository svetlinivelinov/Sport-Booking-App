import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config as loadEnv } from "dotenv";

import { db } from "./client";
import { groups, matchups, scoreEntries, sessionParticipants, sessions, sports, users } from "./schema";

type SeedMode = "small" | "large";

interface SeedConfig {
  users: number;
  groups: number;
  sessions: number;
  participantsPerSession: number;
  roundsPerSession: number;
  matchupsPerRound: number;
}

const CONFIGS: Record<SeedMode, SeedConfig> = {
  small: {
    users: 40,
    groups: 8,
    sessions: 36,
    participantsPerSession: 8,
    roundsPerSession: 2,
    matchupsPerRound: 2,
  },
  large: {
    users: 2200,
    groups: 260,
    sessions: 3200,
    participantsPerSession: 8,
    roundsPerSession: 2,
    matchupsPerRound: 2,
  },
};

const CHUNK_SIZE = 500;

function loadEnvironment() {
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "apps/web/.env"),
    resolve(process.cwd(), "apps/web/.env.local"),
  ];

  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      loadEnv({ path: filePath, override: true });
    }
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Create apps/web/.env or root .env with DATABASE_URL set.");
  }
}

function pickMode(input?: string): SeedMode {
  return input === "large" ? "large" : "small";
}

async function insertInChunks<T extends Record<string, unknown>>(
  table: { [k: string]: unknown },
  rows: T[],
) {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    await db.insert(table as never).values(chunk as never);
  }
}

function randomInt(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

async function clearAll() {
  await db.delete(scoreEntries);
  await db.delete(matchups);
  await db.delete(sessionParticipants);
  await db.delete(sessions);
  await db.delete(groups);
  await db.delete(sports);
  await db.delete(users);
}

async function seed(mode: SeedMode) {
  const cfg = CONFIGS[mode];
  console.log(`Seeding mode: ${mode}`);

  await clearAll();

  const now = new Date();

  const sportRows = [
    {
      id: randomUUID(),
      slug: "padel",
      name: "Padel",
      teamSize: 2,
      scoringModel: "points",
      rankingModel: "points_then_diff",
      schedulingStrategy: "round_robin",
      rulesConfig: { targetPoints: 21 },
      createdAt: now,
    },
    {
      id: randomUUID(),
      slug: "football",
      name: "Football",
      teamSize: 11,
      scoringModel: "goals",
      rankingModel: "wins_then_diff",
      schedulingStrategy: "round_robin",
      rulesConfig: { durationMinutes: 90 },
      createdAt: now,
    },
  ];
  await db.insert(sports).values(sportRows);

  const userRows = Array.from({ length: cfg.users }, (_, i) => ({
    id: randomUUID(),
    email: `user${i + 1}@demo.local`,
    passwordHash: "$2b$12$WjzL3GvS5vPc2c2SY8uS9e2xM8uG3SuW5f5QWz2tJk9M3iQHBh5Au",
    displayName: `User ${i + 1}`,
    role: i === 0 ? "admin" : "user",
    createdAt: now,
  }));
  await insertInChunks(users, userRows);

  const groupRows = Array.from({ length: cfg.groups }, (_, i) => ({
    id: randomUUID(),
    sportId: sportRows[i % sportRows.length].id,
    ownerUserId: userRows[i % userRows.length].id,
    name: `Group ${i + 1}`,
    description: `Auto-generated ${mode} seed group ${i + 1}`,
    createdAt: now,
  }));
  await insertInChunks(groups, groupRows);

  const sessionRows = Array.from({ length: cfg.sessions }, (_, i) => {
    const group = groupRows[i % groupRows.length];
    const owner = userRows[i % userRows.length];
    const startsAt = new Date(now.getTime() + (i % 60) * 3600_000);
    return {
      id: randomUUID(),
      sportId: group.sportId,
      groupId: group.id,
      title: `Session ${i + 1}`,
      status: i % 5 === 0 ? "finished" : "open",
      startsAt,
      venueName: `Venue ${1 + (i % 25)}`,
      notes: null,
      createdByUserId: owner.id,
      createdAt: now,
    };
  });
  await insertInChunks(sessions, sessionRows);

  const participantRows: Array<(typeof sessionParticipants.$inferInsert)> = [];
  for (const session of sessionRows) {
    const selected = new Set<number>();
    while (selected.size < cfg.participantsPerSession) {
      selected.add(randomInt(userRows.length));
    }
    for (const idx of selected) {
      participantRows.push({
        sessionId: session.id,
        userId: userRows[idx].id,
        status: "joined",
        joinedAt: now,
      });
    }
  }
  await insertInChunks(sessionParticipants, participantRows as unknown as Record<string, unknown>[]);

  const matchupRows: Array<(typeof matchups.$inferInsert)> = [];
  for (const session of sessionRows) {
    for (let round = 1; round <= cfg.roundsPerSession; round += 1) {
      for (let slot = 1; slot <= cfg.matchupsPerRound; slot += 1) {
        const a1 = userRows[randomInt(userRows.length)].id;
        const a2 = userRows[randomInt(userRows.length)].id;
        const b1 = userRows[randomInt(userRows.length)].id;
        const b2 = userRows[randomInt(userRows.length)].id;
        matchupRows.push({
          id: randomUUID(),
          sessionId: session.id,
          roundNumber: round,
          slotNumber: slot,
          status: session.status === "finished" ? "verified" : "pending",
          sideAUserIds: [a1, a2],
          sideBUserIds: [b1, b2],
          createdAt: now,
        });
      }
    }
  }
  await insertInChunks(matchups, matchupRows as unknown as Record<string, unknown>[]);

  const scoreRows: Array<(typeof scoreEntries.$inferInsert)> = [];
  for (const matchup of matchupRows) {
    if (matchup.status !== "verified") {
      continue;
    }
    scoreRows.push({
      id: randomUUID(),
      matchupId: matchup.id,
      submittedByUserId: userRows[randomInt(userRows.length)].id,
      scorePayload: {
        sideA: randomInt(8),
        sideB: randomInt(8),
      },
      createdAt: now,
    });
  }
  await insertInChunks(scoreEntries, scoreRows as unknown as Record<string, unknown>[]);

  console.log(
    JSON.stringify(
      {
        mode,
        users: userRows.length,
        groups: groupRows.length,
        sessions: sessionRows.length,
        participants: participantRows.length,
        matchups: matchupRows.length,
        scoreEntries: scoreRows.length,
      },
      null,
      2,
    ),
  );
}

const mode = pickMode(process.argv[2]);

loadEnvironment();

seed(mode)
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
