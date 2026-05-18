export type UserRole = "user" | "admin";

export type SessionStatus = "draft" | "open" | "active" | "finished" | "cancelled";

export type ParticipationStatus = "joined" | "waitlisted" | "cancelled";

export type MatchupStatus = "pending" | "active" | "submitted" | "verified";

export type ScoringModel = "points" | "sets" | "goals";

export type RankingModel = "points_then_diff" | "wins_then_diff";

export type SchedulingStrategy = "round_robin" | "swiss" | "knockout";
