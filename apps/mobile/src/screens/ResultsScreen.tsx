import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import {
  getResults,
  getSessions,
  LeaderboardSummary,
  ResultSummary,
  SessionSummary,
} from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface ResultsScreenProps {
  token: string | null;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

async function loadAllSessions(token: string): Promise<SessionSummary[]> {
  const firstPage = await getSessions(token, {
    page: 1,
    pageSize: 100,
  });

  let rows = firstPage.rows;
  if (firstPage.totalPages > 1) {
    const pages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        getSessions(token, {
          page: index + 2,
          pageSize: 100,
        }),
      ),
    );
    rows = rows.concat(...pages.map((page) => page.rows));
  }

  const sorted = [...rows].sort((a, b) => {
    const aTime = new Date(a.startsAt).getTime();
    const bTime = new Date(b.startsAt).getTime();
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
      return a.title.localeCompare(b.title);
    }
    if (Number.isNaN(aTime)) {
      return 1;
    }
    if (Number.isNaN(bTime)) {
      return -1;
    }
    return bTime - aTime;
  });

  const byTitle = new Map<string, SessionSummary>();
  for (const row of sorted) {
    const key = row.title.trim().toLowerCase() || row.id;
    if (!byTitle.has(key)) {
      byTitle.set(key, row);
    }
  }

  return Array.from(byTitle.values());
}

export function ResultsScreen({ token }: ResultsScreenProps) {
  const [rows, setRows] = useState<ResultSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardSummary[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadResults() {
    if (!token) {
      setRows([]);
      setLeaderboard([]);
      setError("Sign in to load results.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [resultsResponse, sessionsResponse] = await Promise.all([
        getResults(token, {
          sessionId: selectedSessionId || undefined,
          page,
          pageSize: 10,
        }),
        loadAllSessions(token),
      ]);

      setRows(resultsResponse.rows);
      setLeaderboard(resultsResponse.leaderboard);
      setTotalPages(Math.max(1, resultsResponse.totalPages || 1));
      setSessions(sessionsResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load results.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [selectedSessionId]);

  useEffect(() => {
    void loadResults();

    if (!token) {
      return;
    }

    const timer = setInterval(() => {
      void loadResults();
    }, 15000);

    return () => {
      clearInterval(timer);
    };
  }, [page, selectedSessionId, token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.subtitle}>Session results and live leaderboard.</Text>

      <Text style={styles.counterText}>Sessions: {sessions.length}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, !selectedSessionId && styles.filterChipActive]}
          onPress={() => setSelectedSessionId("")}
        >
          <Text style={[styles.filterText, !selectedSessionId && styles.filterTextActive]}>All sessions</Text>
        </Pressable>
        {sessions.map((session) => {
          const active = selectedSessionId === session.id;
          return (
            <Pressable
              key={session.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSelectedSessionId(session.id)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{session.title}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {!leaderboard.length && !isLoading ? <Text style={styles.empty}>No leaderboard entries yet.</Text> : null}
          {leaderboard.slice(0, 8).map((entry) => (
            <View key={entry.userId} style={styles.leaderRow}>
              <Text style={styles.leaderName}>{entry.displayName}</Text>
              <Text style={styles.leaderStats}>W {entry.wins}  L {entry.losses}  D {entry.draws}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent results</Text>
          {!rows.length && !isLoading ? <Text style={styles.empty}>No results found.</Text> : null}
          {rows.map((row) => (
            <View key={row.matchupId} style={styles.item}>
              <Text style={styles.itemTitle}>{row.sessionTitle}</Text>
              <Text style={styles.itemMeta}>Session game • Round {row.roundNumber}, Match {row.slotNumber}</Text>
              <Text style={styles.itemMeta}>{row.sideAUserIds.join(", ")} {row.sideAScore} - {row.sideBScore} {row.sideBUserIds.join(", ")}</Text>
              <Text style={styles.itemMeta}>Submitted: {formatDate(row.submittedAt)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.pagingRow}>
        <Pressable
          style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
          onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || isLoading}
        >
          <Text style={styles.pageButtonText}>Prev</Text>
        </Pressable>
        <Text style={styles.pageLabel}>Page {page} / {Math.max(1, totalPages)}</Text>
        <Pressable
          style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
          onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages || isLoading}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: appTheme.spacing.size10,
  },
  title: {
    fontSize: appTheme.typography.size24,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.bold,
  },
  subtitle: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size14,
    fontFamily: mobileFonts.regular,
  },
  counterText: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.regular,
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: appTheme.spacing.size8,
    paddingVertical: appTheme.spacing.size2,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.surfaceMuted,
    paddingHorizontal: appTheme.spacing.size12,
    paddingVertical: appTheme.spacing.size7,
  },
  filterChipActive: {
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.primary,
  },
  filterText: {
    color: appTheme.colors.foreground,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.semiBold,
  },
  filterTextActive: {
    color: appTheme.colors.onPrimary,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    gap: appTheme.spacing.size10,
    paddingBottom: appTheme.spacing.size20,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size12,
    padding: 12,
    gap: appTheme.spacing.size8,
    backgroundColor: appTheme.colors.background,
  },
  sectionTitle: {
    fontSize: appTheme.typography.size16,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  leaderRow: {
    gap: appTheme.spacing.size2,
  },
  leaderName: {
    fontSize: appTheme.typography.size14,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  leaderStats: {
    fontSize: appTheme.typography.size12,
    color: appTheme.colors.muted,
    fontFamily: mobileFonts.regular,
  },
  item: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size12,
    padding: 10,
    gap: appTheme.spacing.size2,
    backgroundColor: appTheme.colors.background,
  },
  itemTitle: {
    fontSize: appTheme.typography.size14,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  itemMeta: {
    fontSize: appTheme.typography.size12,
    color: appTheme.colors.muted,
    fontFamily: mobileFonts.regular,
  },
  empty: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size13,
    fontFamily: mobileFonts.regular,
  },
  error: {
    color: appTheme.colors.dangerText,
    fontSize: appTheme.typography.size13,
    fontFamily: mobileFonts.regular,
  },
  pagingRow: {
    marginTop: -2,
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: appTheme.spacing.size10,
  },
  pageButton: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size10,
    backgroundColor: appTheme.colors.onPrimary,
    paddingHorizontal: appTheme.spacing.size12,
    paddingVertical: appTheme.spacing.size7,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    color: appTheme.colors.foreground,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.semiBold,
  },
  pageLabel: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.regular,
  },
});
