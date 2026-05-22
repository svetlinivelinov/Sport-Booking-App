import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { getSessions, leaveSession, SessionSummary } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface MySessionsScreenProps {
  token: string | null;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function MySessionsScreen({ token }: MySessionsScreenProps) {
  const [rows, setRows] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadMine() {
    if (!token) {
      setRows([]);
      setError("Sign in to load your sessions.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getSessions(token, { participating: true, pageSize: 20 });
      setRows(response.rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your sessions.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMine();
  }, [token]);

  async function onLeave(row: SessionSummary) {
    if (!token) {
      return;
    }

    setBusySessionId(row.id);
    setError(null);
    try {
      await leaveSession(token, row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
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
