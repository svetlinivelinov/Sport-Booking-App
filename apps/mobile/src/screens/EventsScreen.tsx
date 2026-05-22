import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { getSessions, SessionSummary } from "../lib/authApi";
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
      const response = await getSessions(token, { pageSize: 20 });
      setRows(response.rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.subtitle}>Live sessions from the web backend.</Text>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {rows.map((row) => (
          <View key={row.id} style={styles.item}>
            <Text style={styles.itemTitle}>{row.title}</Text>
            <Text style={styles.itemMeta}>Status: {row.status}</Text>
            <Text style={styles.itemMeta}>Starts: {formatDate(row.startsAt)}</Text>
            <Text style={styles.itemMeta}>Venue: {row.venueName || "TBD"}</Text>
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
