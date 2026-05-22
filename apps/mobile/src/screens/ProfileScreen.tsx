import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";
import { AuthenticatedUser, getMyUser } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface ProfileScreenProps {
  token: string | null;
}

export function ProfileScreen({ token }: ProfileScreenProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProfile() {
    if (!token) {
      setUser(null);
      setError("Sign in to load your profile.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const currentUser = await getMyUser(token);
      if (!currentUser) {
        setError("Session expired. Please sign in again.");
        setUser(null);
        return;
      }
      setUser(currentUser);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load profile.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Live data from your authenticated web API session.</Text>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {user ? (
        <View style={styles.panel}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{user.displayName}</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user.role}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={loadProfile} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? "Refreshing..." : "Refresh profile"}</Text>
      </TouchableOpacity>
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
  panel: {
    gap: 4,
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: appTheme.colors.surface,
  },
  label: {
    fontSize: 12,
    color: appTheme.colors.muted,
    fontFamily: mobileFonts.regular,
  },
  value: {
    fontSize: 15,
    color: appTheme.colors.foreground,
    marginBottom: 4,
    fontFamily: mobileFonts.semiBold,
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    fontFamily: mobileFonts.regular,
  },
  button: {
    marginTop: 4,
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
