import { StyleSheet, Text, View } from "react-native";

import { appTheme } from "@sport-booking/shared";

export function MySessionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sessions</Text>
      <Text style={styles.subtitle}>Track your joined sessions, status, and results.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: appTheme.colors.foreground,
    fontFamily: appTheme.fonts.sans,
  },
  subtitle: {
    color: appTheme.colors.muted,
    fontSize: 14,
    fontFamily: appTheme.fonts.sans,
  },
});
