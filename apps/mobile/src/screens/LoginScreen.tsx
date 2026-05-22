import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";

import { loginWithPassword } from "../lib/authApi";
import { showAlert } from "../ui/alerts";
import { mobileFonts } from "../ui/fonts";

interface LoginScreenProps {
  onContinue: (token: string) => void;
}

export function LoginScreen({ onContinue }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignIn() {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      showAlert("Missing fields", "Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await loginWithPassword(normalizedEmail, normalizedPassword);
      onContinue(result.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      showAlert("Sign in failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Access your sport sessions and standings.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={appTheme.colors.muted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={appTheme.colors.muted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleSignIn} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? "Signing in..." : "Sign in"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => onContinue("demo-token")} disabled={isSubmitting}>
        <Text style={styles.secondaryButtonText}>Continue in demo mode</Text>
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
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.bold,
  },
  subtitle: {
    fontSize: 14,
    color: appTheme.colors.muted,
    marginBottom: 4,
    fontFamily: mobileFonts.regular,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: appTheme.colors.surface,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.regular,
  },
  button: {
    marginTop: 6,
    backgroundColor: appTheme.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontFamily: mobileFonts.bold,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: appTheme.colors.primary,
    fontFamily: mobileFonts.semiBold,
  },
});
