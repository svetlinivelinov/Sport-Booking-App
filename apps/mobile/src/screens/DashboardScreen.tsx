import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { getMyUser, getSessions } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface DashboardScreenProps {
  token: string | null;
}

export function DashboardScreen({ token }: DashboardScreenProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [myEvents, setMyEvents] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!token) {
        setDisplayName(null);
        setTotalEvents(null);
        setMyEvents(null);
        setError("Sign in to load your dashboard.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const [user, allSessions, mineSessions] = await Promise.all([
          getMyUser(token),
          getSessions(token, { pageSize: 1 }),
          getSessions(token, { mine: true, pageSize: 1 }),
        ]);

        if (!user) {
          setError("Session expired. Please sign in again.");
          setDisplayName(null);
          return;
        }

        setDisplayName(user.displayName);
        setTotalEvents(allSessions.total);
        setMyEvents(mineSessions.total);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Your live booking snapshot from the web API.</Text>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {displayName ? (
        <View style={styles.metrics}>
          <Text style={styles.metric}>Welcome, {displayName}</Text>
          <Text style={styles.metric}>Total events: {totalEvents ?? "-"}</Text>
          <Text style={styles.metric}>My sessions: {myEvents ?? "-"}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
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
  metrics: {
    gap: 6,
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 12,
    padding: 12,
  },
  metric: {
    color: appTheme.colors.foreground,
    fontSize: 14,
    fontFamily: mobileFonts.regular,
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    fontFamily: mobileFonts.regular,
  },
});
