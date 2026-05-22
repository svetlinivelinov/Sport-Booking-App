import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { getSessions, leaveSession, SessionSummary } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface MySessionsScreenProps {
  token: string | null;
  refreshKey: number;
  onSessionChange?: () => void;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function MySessionsScreen({ token, refreshKey, onSessionChange }: MySessionsScreenProps) {
  const [rows, setRows] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const loadMine = useCallback(async () => {
    if (!token) {
      setRows([]);
      setPage(1);
      setTotalPages(1);
      setError("Sign in to load your sessions.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getSessions(token, { participating: true, page, pageSize });

      if (page > 1 && response.rows.length === 0) {
        setPage((prev) => Math.max(1, prev - 1));
        return;
      }

      setRows(response.rows);
      setTotalPages(Math.max(1, response.totalPages || 1));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your sessions.");
    } finally {
      setIsLoading(false);
    }
  }, [page, token]);

  useEffect(() => {
    void loadMine();
  }, [loadMine, token, refreshKey]);

  async function onLeave(row: SessionSummary) {
    if (!token) {
      return;
    }

    setBusySessionId(row.id);
    setError(null);
    try {
      await leaveSession(token, row.id);
      onSessionChange?.();
      await loadMine();
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : "Unable to leave this session.");
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sessions</Text>
      <Text style={styles.subtitle}>Sessions you joined.</Text>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {rows.map((row) => (
          <View key={row.id} style={styles.item}>
            <Text style={styles.itemTitle}>{row.title}</Text>
            <Text style={styles.itemMeta}>Status: {row.status}</Text>
            <Text style={styles.itemMeta}>Starts: {formatDate(row.startsAt)}</Text>
            <Text style={styles.itemMeta}>Participants: {row.participantCount ?? 0}</Text>
            {row.status !== "finished" ? (
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => void onLeave(row)}
                disabled={busySessionId === row.id}
              >
                <Text style={styles.secondaryActionButtonText}>{busySessionId === row.id ? "Leaving..." : "Leave"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
        {!isLoading && !rows.length && !error ? <Text style={styles.empty}>No sessions yet.</Text> : null}
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

      <TouchableOpacity style={styles.button} onPress={loadMine} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Refreshing..." : "Refresh my sessions"}</Text>
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
