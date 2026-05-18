import { StyleSheet, Text, View } from "react-native";

import { appTheme } from "@sport-booking/shared";

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage display name, bio, and skill settings.</Text>
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
