import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 120 }).notNull(),
    role: varchar("role", { length: 16 }).notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_uq").on(table.email)],
);

export const sports = pgTable(
  "sports",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    teamSize: integer("team_size").notNull(),
    scoringModel: varchar("scoring_model", { length: 32 }).notNull(),
    rankingModel: varchar("ranking_model", { length: 32 }).notNull(),
    schedulingStrategy: varchar("scheduling_strategy", { length: 32 }).notNull(),
    rulesConfig: jsonb("rules_config").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sports_slug_uq").on(table.slug)],
);

export const groups = pgTable(
  "groups",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sportId: varchar("sport_id", { length: 36 })
      .notNull()
      .references(() => sports.id, { onDelete: "restrict" }),
    ownerUserId: varchar("owner_user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("groups_sport_idx").on(table.sportId)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sportId: varchar("sport_id", { length: 36 })
      .notNull()
      .references(() => sports.id, { onDelete: "restrict" }),
    groupId: varchar("group_id", { length: 36 })
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 140 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("draft"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    venueName: varchar("venue_name", { length: 140 }),
    notes: text("notes"),
    createdByUserId: varchar("created_by_user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sessions_group_idx").on(table.groupId),
    index("sessions_status_idx").on(table.status),
    index("sessions_start_idx").on(table.startsAt),
  ],
);

export const sessionParticipants = pgTable(
  "session_participants",
  {
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 16 }).notNull().default("joined"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.userId], name: "session_participants_pk" }),
    index("session_participants_user_idx").on(table.userId),
  ],
);

export const matchups = pgTable(
  "matchups",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    roundNumber: integer("round_number").notNull(),
    slotNumber: integer("slot_number").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    sideAUserIds: jsonb("side_a_user_ids").notNull().default([]),
    sideBUserIds: jsonb("side_b_user_ids").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("matchups_session_round_slot_uq").on(table.sessionId, table.roundNumber, table.slotNumber),
    index("matchups_session_idx").on(table.sessionId),
  ],
);

export const scoreEntries = pgTable(
  "score_entries",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    matchupId: varchar("matchup_id", { length: 36 })
      .notNull()
      .references(() => matchups.id, { onDelete: "cascade" }),
    submittedByUserId: varchar("submitted_by_user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    scorePayload: jsonb("score_payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("score_entries_matchup_idx").on(table.matchupId)],
);
