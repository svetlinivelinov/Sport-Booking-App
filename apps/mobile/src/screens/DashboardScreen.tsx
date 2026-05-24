import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { getMyUser, getSessions, SessionSummary } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface DashboardScreenProps {
  token: string | null;
}

type SessionStatusFilter = "all" | "open" | "draft" | "finished";

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

function badgeStyle(status: string) {
  if (status === "open") {
    return {
      backgroundColor: appTheme.colors.statusOpenBg,
      borderColor: appTheme.colors.statusOpenBorder,
      color: appTheme.colors.statusOpenText,
    };
  }
  if (status === "finished") {
    return {
      backgroundColor: appTheme.colors.statusFinishedBg,
      borderColor: appTheme.colors.statusFinishedBorder,
      color: appTheme.colors.muted,
    };
  }
  return {
    backgroundColor: appTheme.colors.statusDraftBg,
    borderColor: appTheme.colors.statusDraftBorder,
    color: appTheme.colors.primary,
  };
}

export function DashboardScreen({ token }: DashboardScreenProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [myEvents, setMyEvents] = useState(0);
  const [openEvents, setOpenEvents] = useState(0);
  const [draftEvents, setDraftEvents] = useState(0);
  const [finishedEvents, setFinishedEvents] = useState(0);
  const [recentRows, setRecentRows] = useState<SessionSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<SessionStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!token) {
        setDisplayName(null);
        setTotalEvents(0);
        setMyEvents(0);
        setOpenEvents(0);
        setDraftEvents(0);
        setFinishedEvents(0);
        setRecentRows([]);
        setError("Sign in to load your dashboard.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [user, allSessions, mineSessions, openSessions, draftSessions, finishedSessions, recentSessions] = await Promise.all([
          getMyUser(token),
          getSessions(token, { pageSize: 1 }),
          getSessions(token, { mine: true, pageSize: 1 }),
          getSessions(token, { status: "open", pageSize: 1 }),
          getSessions(token, { status: "draft", pageSize: 1 }),
          getSessions(token, { status: "finished", pageSize: 1 }),
          getSessions(token, {
            status: statusFilter === "all" ? undefined : statusFilter,
            pageSize: 6,
          }),
        ]);

        if (!user) {
          setError("Session expired. Please sign in again.");
          setDisplayName(null);
          return;
        }

        setDisplayName(user.displayName);
        setTotalEvents(allSessions.total);
        setMyEvents(mineSessions.total);
        setOpenEvents(openSessions.total);
        setDraftEvents(draftSessions.total);
        setFinishedEvents(finishedSessions.total);
        setRecentRows(recentSessions.rows);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [statusFilter, token]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Live control center synced with web.</Text>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {displayName ? (
        <View style={styles.metricsGrid}>
          <View style={styles.metricCardWide}>
            <Text style={styles.metricLabel}>Welcome</Text>
            <Text style={styles.metricValue}>{displayName}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>My sessions</Text>
            <Text style={styles.metricValue}>{myEvents}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>All sessions</Text>
            <Text style={styles.metricValue}>{totalEvents}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Open</Text>
            <Text style={styles.metricValue}>{openEvents}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Draft</Text>
            <Text style={styles.metricValue}>{draftEvents}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Finished</Text>
            <Text style={styles.metricValue}>{finishedEvents}</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Recent sessions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(["all", "open", "draft", "finished"] as SessionStatusFilter[]).map((filter) => {
          const active = filter === statusFilter;
          return (
            <Pressable
              key={filter}
              onPress={() => setStatusFilter(filter)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.feedList}>
        {recentRows.map((row) => {
          const badge = badgeStyle(row.status);
          return (
            <View key={row.id} style={styles.feedItem}>
              <View style={styles.feedTopRow}>
                <Text style={styles.feedTitle}>{row.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor }]}>
                  <Text style={[styles.statusText, { color: badge.color }]}>{row.status}</Text>
                </View>
              </View>
              <Text style={styles.feedMeta}>{formatDate(row.startsAt)}</Text>
              <Text style={styles.feedMeta}>{row.venueName || "TBD"}</Text>
            </View>
          );
        })}
        {!isLoading && !recentRows.length && !error ? <Text style={styles.empty}>No sessions for this filter.</Text> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    gap: appTheme.spacing.size10,
    paddingBottom: appTheme.spacing.size8,
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.size8,
  },
  metricCardWide: {
    width: "100%",
    gap: appTheme.spacing.size6,
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size12,
    padding: 12,
    backgroundColor: appTheme.colors.background,
  },
  metricCard: {
    width: "48.5%",
    gap: appTheme.spacing.size4,
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size12,
    padding: 12,
    backgroundColor: appTheme.colors.background,
  },
  metricLabel: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.regular,
  },
  metricValue: {
    color: appTheme.colors.foreground,
    fontSize: appTheme.typography.size18,
    fontFamily: mobileFonts.bold,
  },
  error: {
    color: appTheme.colors.dangerText,
    fontSize: appTheme.typography.size13,
    fontFamily: mobileFonts.regular,
  },
  sectionTitle: {
    marginTop: 4,
    fontSize: appTheme.typography.size16,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  filterRow: {
    flexDirection: "row",
    gap: appTheme.spacing.size8,
    paddingVertical: appTheme.spacing.size4,
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
    textTransform: "capitalize",
    fontFamily: mobileFonts.semiBold,
  },
  filterTextActive: {
    color: appTheme.colors.onPrimary,
  },
  feedList: {
    gap: appTheme.spacing.size8,
  },
  feedItem: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size12,
    padding: 12,
    gap: appTheme.spacing.size2,
    backgroundColor: appTheme.colors.background,
  },
  feedTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: appTheme.spacing.size10,
  },
  feedTitle: {
    flex: 1,
    color: appTheme.colors.foreground,
    fontSize: appTheme.typography.size14,
    fontFamily: mobileFonts.semiBold,
  },
  feedMeta: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.regular,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: appTheme.radius.pill,
    paddingHorizontal: appTheme.spacing.size8,
    paddingVertical: appTheme.spacing.size3,
  },
  statusText: {
    fontSize: appTheme.typography.size10,
    textTransform: "uppercase",
    fontFamily: mobileFonts.semiBold,
  },
  empty: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size13,
    fontFamily: mobileFonts.regular,
  },
});
