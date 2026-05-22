import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { getSessions, joinSession, leaveSession, SessionSummary } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface EventsScreenProps {
  token: string | null;
  refreshKey: number;
  onSessionChange?: () => void;
}

type EventsFilter = "open" | "joined" | "mine";

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function EventsScreen({ token, refreshKey, onSessionChange }: EventsScreenProps) {
  const [rows, setRows] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<EventsFilter>("open");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const loadEvents = useCallback(async () => {
    if (!token) {
      setRows([]);
      setPage(1);
      setTotalPages(1);
      setError("Sign in to load events.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getSessions(token, {
        status: filter === "open" ? "open" : undefined,
        participating: filter === "joined",
        mine: filter === "mine",
        page,
        pageSize,
      });
      setRows(response.rows);
      setTotalPages(Math.max(1, response.totalPages || 1));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
    } finally {
      setIsLoading(false);
    }
  }, [filter, page, token]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    void loadEvents();

    if (!token) {
      return;
    }

    const timer = setInterval(() => {
      void loadEvents();
    }, 15000);

    return () => {
      clearInterval(timer);
    };
  }, [loadEvents, token, refreshKey]);

  async function onJoin(row: SessionSummary) {
    if (!token) {
      return;
    }
    setBusySessionId(row.id);
    setError(null);
    try {
      await joinSession(token, row.id);
      onSessionChange?.();
      await loadEvents();
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Unable to join session.");
    } finally {
      setBusySessionId(null);
    }
  }

  async function onLeave(row: SessionSummary) {
    if (!token) {
      return;
    }
    setBusySessionId(row.id);
    setError(null);
    try {
      await leaveSession(token, row.id);
      onSessionChange?.();
      await loadEvents();
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : "Unable to leave session.");
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Synced from web with filters and paging (auto-refresh every 15s).</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {(["open", "joined", "mine"] as EventsFilter[]).map((filterValue) => {
          const active = filterValue === filter;
          return (
            <Pressable
              key={filterValue}
              onPress={() => setFilter(filterValue)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{filterValue}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {rows.map((row) => (
          <View key={row.id} style={styles.item}>
            <Text style={styles.itemTitle}>{row.title}</Text>
            <Text style={styles.itemMeta}>Status: {row.status}</Text>
            <Text style={styles.itemMeta}>Starts: {formatDate(row.startsAt)}</Text>
            <Text style={styles.itemMeta}>Venue: {row.venueName || "TBD"}</Text>
            <Text style={styles.itemMeta}>Participants: {row.participantCount ?? 0}</Text>
            {row.status === "open" ? (
              row.isParticipant ? (
                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={() => void onLeave(row)}
                  disabled={busySessionId === row.id}
                >
                  <Text style={styles.secondaryActionButtonText}>{busySessionId === row.id ? "Leaving..." : "Leave"}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => void onJoin(row)}
                  disabled={busySessionId === row.id}
                >
                  <Text style={styles.primaryActionButtonText}>{busySessionId === row.id ? "Joining..." : "Join"}</Text>
                </TouchableOpacity>
              )
            ) : null}
          </View>
        ))}
        {!isLoading && !rows.length && !error ? <Text style={styles.empty}>No events found.</Text> : null}
      </ScrollView>

      <View style={styles.pagingRow}>
        <TouchableOpacity
          style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
          onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page <= 1 || isLoading}
        >
          <Text style={styles.pageButtonText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.pageLabel}>
          Page {page} / {Math.max(1, totalPages)}
        </Text>
        <TouchableOpacity
          style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
          onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page >= totalPages || isLoading}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={loadEvents} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Refreshing..." : "Refresh events"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, flex: 1 },
  title: {
    fontSize: 24,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.bold,
  },
  subtitle: {
    color: appTheme.colors.muted,
    fontSize: 14,
    fontFamily: mobileFonts.regular,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 999,
    backgroundColor: "#eef2fa",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    borderColor: appTheme.colors.primary,
    backgroundColor: appTheme.colors.primary,
  },
  filterText: {
    color: appTheme.colors.foreground,
    fontSize: 12,
    textTransform: "capitalize",
    fontFamily: mobileFonts.semiBold,
  },
  filterTextActive: {
    color: "#ffffff",
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 8,
  },
  item: {
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 12,
    padding: 12,
    gap: 3,
  },
  itemTitle: {
    fontSize: 16,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.bold,
  },
  itemMeta: {
    fontSize: 13,
    color: appTheme.colors.muted,
    fontFamily: mobileFonts.regular,
  },
  primaryActionButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: appTheme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  primaryActionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: mobileFonts.semiBold,
  },
  secondaryActionButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbe2f0",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  secondaryActionButtonText: {
    color: appTheme.colors.foreground,
    fontSize: 12,
    fontFamily: mobileFonts.semiBold,
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    fontFamily: mobileFonts.regular,
  },
  empty: {
    color: appTheme.colors.muted,
    fontSize: 13,
    fontFamily: mobileFonts.regular,
  },
  pagingRow: {
    marginTop: -2,
    marginBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  pageButton: {
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    color: appTheme.colors.foreground,
    fontSize: 12,
    fontFamily: mobileFonts.semiBold,
  },
  pageLabel: {
    color: appTheme.colors.muted,
    fontSize: 12,
    fontFamily: mobileFonts.regular,
  },
  button: {
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: appTheme.colors.primary,
  },
  buttonText: {
    color: "#fff",
    fontFamily: mobileFonts.bold,
  },
});
