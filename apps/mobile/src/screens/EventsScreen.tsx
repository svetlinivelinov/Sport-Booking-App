import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { getSessions, joinSession, leaveSession, SessionSummary } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface EventsScreenProps {
  token: string | null;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function EventsScreen({ token }: EventsScreenProps) {
  const [rows, setRows] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    if (!token) {
      setRows([]);
      setError("Sign in to load events.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const firstPage = await getSessions(token, { status: "open", page: 1, pageSize: 50 });
      let allRows = firstPage.rows;

      if (firstPage.totalPages > 1) {
        const pages = await Promise.all(
          Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
            getSessions(token, { status: "open", page: index + 2, pageSize: 50 }),
          ),
        );
        allRows = allRows.concat(...pages.map((page) => page.rows));
      }

      setRows(allRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
    } finally {
      setIsLoading(false);
    }
  }

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
  }, [token]);

  async function onJoin(row: SessionSummary) {
    if (!token) {
      return;
    }
    setBusySessionId(row.id);
    setError(null);
    try {
      await joinSession(token, row.id);
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                isParticipant: true,
                myParticipantStatus: "joined",
                participantCount: (item.participantCount ?? 0) + 1,
              }
            : item,
        ),
      );
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
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                isParticipant: false,
                myParticipantStatus: null,
                participantCount: Math.max(0, (item.participantCount ?? 0) - 1),
              }
            : item,
        ),
      );
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : "Unable to leave session.");
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Open sessions synced from web (auto-refresh every 15s).</Text>

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
