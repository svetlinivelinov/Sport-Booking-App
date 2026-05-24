import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Manrope_400Regular, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { appTheme } from '@sport-booking/shared';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MySessionsScreen } from './src/screens/MySessionsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { mobileFonts } from './src/ui/fonts';

type ScreenKey = 'login' | 'dashboard' | 'groups' | 'events' | 'my-sessions' | 'results' | 'profile';

const baseTabs: Array<{ key: ScreenKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'groups', label: 'Groups' },
  { key: 'events', label: 'Events' },
  { key: 'my-sessions', label: 'My Sessions' },
  { key: 'results', label: 'Results' },
  { key: 'profile', label: 'Profile' },
];

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [screen, setScreen] = useState<ScreenKey>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
    const tabs = useMemo<Array<{ key: ScreenKey; label: string }>>(
      () => [{ key: 'login', label: authToken ? 'Logout' : 'Login' }, ...baseTabs],
      [authToken],
    );

  const { height } = useWindowDimensions();
  const isCompactHeight = height < 760;

  function onSessionChange() {
    setSessionRefreshKey((prev) => prev + 1);
  }

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
      return <DashboardScreen token={authToken} />;
    }
    if (screen === 'events') {
      return <EventsScreen token={authToken} refreshKey={sessionRefreshKey} onSessionChange={onSessionChange} />;
    }
    if (screen === 'groups') {
      return <GroupsScreen token={authToken} />;
    }
    if (screen === 'my-sessions') {
      return <MySessionsScreen token={authToken} refreshKey={sessionRefreshKey} onSessionChange={onSessionChange} />;
    }
    if (screen === 'results') {
      return <ResultsScreen token={authToken} />;
    }
    return <ProfileScreen token={authToken} />;
  }, [authToken, screen, sessionRefreshKey]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[appTheme.colors.backgroundTop, appTheme.colors.backgroundBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backgroundGradient}
      />

      <View style={[styles.container, isCompactHeight && styles.containerCompact]}>
        <View style={[styles.header, isCompactHeight && styles.headerCompact]}>
          <Text style={styles.headerTitle}>Sport Booking App v1</Text>
          <Text style={styles.headerSubtitle}>
            {authToken ? 'Authenticated with Bearer token flow' : 'Global theme and MVP screen flow'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => {
            const active = tab.key === screen;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  if (tab.key === 'login' && authToken) {
                    setAuthToken(null);
                    setSessionRefreshKey(0);
                    setScreen('login');
                    return;
                  }
                  setScreen(tab.key);
                }}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.card, isCompactHeight && styles.cardCompact]}>{content}</View>

        <StatusBar style="light" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: appTheme.spacing.size20,
    paddingTop: appTheme.spacing.size64,
    paddingBottom: appTheme.spacing.size32,
    minHeight: 0,
  },
  containerCompact: {
    paddingTop: appTheme.spacing.size20,
    paddingBottom: appTheme.spacing.size20,
  },
  header: {
    marginBottom: 14,
  },
  headerCompact: {
    marginBottom: appTheme.spacing.size8,
  },
  headerTitle: {
    color: appTheme.colors.foreground,
    fontSize: appTheme.typography.size26,
    fontFamily: mobileFonts.bold,
  },
  headerSubtitle: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size13,
    marginTop: 4,
    fontFamily: mobileFonts.regular,
  },
  card: {
    flex: 1,
    minHeight: 0,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.size18,
    padding: 16,
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
  },
  cardCompact: {
    padding: appTheme.spacing.size12,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appTheme.spacing.size8,
    paddingTop: appTheme.spacing.size2,
    paddingBottom: appTheme.spacing.size10,
  },
  tabScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: appTheme.spacing.size8,
  },
  tab: {
    flexShrink: 0,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.surfaceStrong,
    paddingHorizontal: appTheme.spacing.size12,
    paddingVertical: appTheme.spacing.size8,
  },
  tabActive: {
    backgroundColor: appTheme.colors.primary,
  },
  tabText: {
    color: appTheme.colors.foreground,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.semiBold,
  },
  tabTextActive: {
    color: appTheme.colors.onPrimary,
  },
});
