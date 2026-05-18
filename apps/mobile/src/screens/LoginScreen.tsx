import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";

interface LoginScreenProps {
  onContinue: () => void;
}

export function LoginScreen({ onContinue }: LoginScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Access your sport sessions and standings.</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={appTheme.colors.muted} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={appTheme.colors.muted} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: appTheme.colors.foreground,
    fontFamily: appTheme.fonts.sans,
  },
  subtitle: {
    fontSize: 14,
    color: appTheme.colors.muted,
    marginBottom: 4,
    fontFamily: appTheme.fonts.sans,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: appTheme.colors.surface,
    color: appTheme.colors.foreground,
  },
  button: {
    marginTop: 6,
    backgroundColor: appTheme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: appTheme.fonts.sans,
  },
});
