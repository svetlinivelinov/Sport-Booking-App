import type { Matchup, ScoreEntry, Session, SessionParticipant, SportDefinition } from "./entities";

export interface ScheduleContext {
  session: Session;
  sport: SportDefinition;
  participants: SessionParticipant[];
}

export interface ScoreContext {
  sport: SportDefinition;
  matchup: Matchup;
  scoreEntry: ScoreEntry;
}

export interface RankingRow {
  participantUserId: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDiff: number;
}

export interface SportRules {
  generateMatchups(ctx: ScheduleContext): Matchup[];
  validateScore(ctx: ScoreContext): { valid: true } | { valid: false; reason: string };
  buildRanking(sessionId: string, participants: SessionParticipant[], entries: ScoreEntry[]): RankingRow[];
}
