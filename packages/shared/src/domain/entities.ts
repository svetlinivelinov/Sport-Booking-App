import type {
  MatchupStatus,
  ParticipationStatus,
  RankingModel,
  ScoringModel,
  SchedulingStrategy,
  SessionStatus,
  UserRole,
} from "./enums";

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface SportDefinition {
  id: string;
  slug: string;
  name: string;
  teamSize: number;
  scoringModel: ScoringModel;
  rankingModel: RankingModel;
  schedulingStrategy: SchedulingStrategy;
  rulesConfig: Record<string, unknown>;
}

export interface Group {
  id: string;
  sportId: string;
  name: string;
  description?: string;
  ownerUserId: string;
  createdAt: string;
}

export interface Session {
  id: string;
  sportId: string;
  groupId: string;
  title: string;
  status: SessionStatus;
  startsAt: string;
  venueName?: string;
  notes?: string;
  createdByUserId: string;
  createdAt: string;
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  status: ParticipationStatus;
  joinedAt: string;
}

export interface Matchup {
  id: string;
  sessionId: string;
  roundNumber: number;
  slotNumber: number;
  status: MatchupStatus;
  sideAUserIds: string[];
  sideBUserIds: string[];
}

export interface ScoreEntry {
  id: string;
  matchupId: string;
  submittedByUserId: string;
  scorePayload: Record<string, unknown>;
  createdAt: string;
}
