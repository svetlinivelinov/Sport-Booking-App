import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";

import { GroupSummary, getGroups, joinGroup, leaveGroup } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface GroupsScreenProps {
  token: string | null;
}

export function GroupsScreen({ token }: GroupsScreenProps) {
  const [rows, setRows] = useState<GroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadGroups() {
    if (!token) {
      setRows([]);
      setError("Sign in to load groups.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getGroups(token);
      setRows(response.rows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load groups.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadGroups();
  }, [token]);

  async function onJoin(groupId: string) {
    if (!token) {
      return;
    }

    try {
      await joinGroup(token, groupId);
      setRows((prev) =>
        prev.map((row) =>
          row.id === groupId
            ? { ...row, isMember: true, memberRole: row.isOwner ? "owner" : "member", memberCount: row.memberCount + 1 }
            : row,
        ),
      );
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Unable to join group.");
    }
  }

  async function onLeave(groupId: string) {
    if (!token) {
      return;
    }

    try {
      await leaveGroup(token, groupId);
      setRows((prev) =>
        prev.map((row) =>
          row.id === groupId
            ? { ...row, isMember: false, memberRole: null, memberCount: Math.max(0, row.memberCount - 1) }
            : row,
        ),
      );
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : "Unable to leave group.");
    }
  }

  const myGroups = rows.filter((row) => row.isMember);
  const discoverGroups = rows.filter((row) => !row.isMember);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Groups</Text>
      <Text style={styles.subtitle}>Join and manage your sport communities.</Text>

      {isLoading ? <ActivityIndicator color={appTheme.colors.primary} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My groups</Text>
        {myGroups.map((row) => (
          <View key={row.id} style={styles.item}>
            <Text style={styles.itemTitle}>{row.name}</Text>
            <Text style={styles.itemMeta}>{row.sportName} · {row.memberCount} members</Text>
            {row.description ? <Text style={styles.itemMeta}>{row.description}</Text> : null}
            {row.isOwner ? (
              <Text style={styles.ownerBadge}>Owner</Text>
            ) : (
              <TouchableOpacity style={styles.leaveButton} onPress={() => void onLeave(row.id)}>
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        {!isLoading && !myGroups.length ? <Text style={styles.empty}>No joined groups yet.</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discover groups</Text>
        {discoverGroups.map((row) => (
          <View key={row.id} style={styles.item}>
            <Text style={styles.itemTitle}>{row.name}</Text>
            <Text style={styles.itemMeta}>{row.sportName} · {row.memberCount} members</Text>
            {row.description ? <Text style={styles.itemMeta}>{row.description}</Text> : null}
            <TouchableOpacity style={styles.joinButton} onPress={() => void onJoin(row.id)}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        ))}
        {!isLoading && !discoverGroups.length ? <Text style={styles.empty}>No discoverable groups right now.</Text> : null}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadGroups} disabled={isLoading}>
        <Text style={styles.refreshButtonText}>{isLoading ? "Refreshing..." : "Refresh groups"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    gap: 10,
    paddingBottom: 10,
  },
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
  section: {
    marginTop: 2,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  item: {
    borderWidth: 1,
    borderColor: "#dbe2f0",
    borderRadius: 12,
    padding: 12,
    gap: 4,
    backgroundColor: appTheme.colors.surface,
  },
  itemTitle: {
    fontSize: 15,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  itemMeta: {
    fontSize: 12,
    color: appTheme.colors.muted,
    fontFamily: mobileFonts.regular,
  },
  ownerBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: appTheme.colors.primary,
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontFamily: mobileFonts.semiBold,
  },
  joinButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: appTheme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: mobileFonts.semiBold,
  },
  leaveButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dbe2f0",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  leaveButtonText: {
    color: appTheme.colors.foreground,
    fontSize: 12,
    fontFamily: mobileFonts.semiBold,
  },
  refreshButton: {
    marginTop: 6,
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: appTheme.colors.primary,
  },
  refreshButtonText: {
    color: "#fff",
    fontFamily: mobileFonts.bold,
  },
  empty: {
    color: appTheme.colors.muted,
    fontSize: 13,
    fontFamily: mobileFonts.regular,
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    fontFamily: mobileFonts.regular,
  },
});
