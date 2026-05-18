import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { appTheme } from '@sport-booking/shared';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MySessionsScreen } from './src/screens/MySessionsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type ScreenKey = 'login' | 'dashboard' | 'events' | 'my-sessions' | 'profile';

const tabs: Array<{ key: ScreenKey; label: string }> = [
  { key: 'login', label: 'Login' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'events', label: 'Events' },
  { key: 'my-sessions', label: 'My Sessions' },
  { key: 'profile', label: 'Profile' },
];

export default function App() {
  const [screen, setScreen] = useState<ScreenKey>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);

  const content = useMemo(() => {
    if (screen === 'login') {
      return (
        <LoginScreen
          onContinue={(token) => {
            setAuthToken(token);
            setScreen('dashboard');
          }}
        />
      );
    }
    if (screen === 'dashboard') {
      return <DashboardScreen />;
    }
    if (screen === 'events') {
      return <EventsScreen />;
    }
    if (screen === 'my-sessions') {
      return <MySessionsScreen />;
    }
    return <ProfileScreen />;
  }, [screen]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sport Booking App v1</Text>
        <Text style={styles.headerSubtitle}>
          {authToken ? 'Authenticated with Bearer token flow' : 'Global theme and MVP screen flow'}
        </Text>
      </View>

      <View style={styles.card}>{content}</View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {tabs.map((tab) => {
          const active = tab.key === screen;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setScreen(tab.key)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 14,
  },
  headerTitle: {
    color: appTheme.colors.foreground,
    fontSize: 26,
    fontWeight: '700',
    fontFamily: appTheme.fonts.sans,
  },
  headerSubtitle: {
    color: appTheme.colors.muted,
    fontSize: 13,
    marginTop: 4,
    fontFamily: appTheme.fonts.sans,
  },
  card: {
    flex: 1,
    backgroundColor: appTheme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe2f0',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 14,
    paddingBottom: 6,
  },
  tab: {
    borderRadius: 999,
    backgroundColor: '#e7edf9',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: appTheme.colors.primary,
  },
  tabText: {
    color: appTheme.colors.foreground,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: appTheme.fonts.sans,
  },
  tabTextActive: {
    color: '#ffffff',
  },
});
