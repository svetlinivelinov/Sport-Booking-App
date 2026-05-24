import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { appTheme } from "@sport-booking/shared";

import { deleteGroup, GroupSummary, getGroups, joinGroup, leaveGroup, updateGroup } from "../lib/authApi";
import { mobileFonts } from "../ui/fonts";

interface GroupsScreenProps {
  token: string | null;
}

export function GroupsScreen({ token }: GroupsScreenProps) {
  const [rows, setRows] = useState<GroupSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  function startEdit(row: GroupSummary) {
    setEditingId(row.id);
    setEditName(row.name);
    setEditDescription(row.description ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  async function onSaveOwnerGroup(groupId: string) {
    if (!token) {
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await updateGroup(token, groupId, { name: editName, description: editDescription });
      setRows((prev) =>
        prev.map((row) =>
          row.id === groupId
            ? {
                ...row,
                name: updated.name,
                description: updated.description,
                sportName: updated.sportName,
              }
            : row,
        ),
      );
      cancelEdit();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update group.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function onDeleteOwnerGroup(groupId: string) {
    if (!token) {
      return;
    }

    setDeletingId(groupId);
    try {
      await deleteGroup(token, groupId);
      setRows((prev) => prev.filter((row) => row.id !== groupId));
      if (editingId === groupId) {
        cancelEdit();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete group.");
    } finally {
      setDeletingId(null);
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
            {editingId === row.id ? (
              <>
                <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Group name" />
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Description"
                  multiline
                />
                <View style={styles.inlineButtons}>
                  <TouchableOpacity style={styles.joinButton} onPress={() => void onSaveOwnerGroup(row.id)} disabled={isUpdating}>
                    <Text style={styles.joinButtonText}>{isUpdating ? "Saving..." : "Save"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.leaveButton} onPress={cancelEdit} disabled={isUpdating}>
                    <Text style={styles.leaveButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.itemTitle}>{row.name}</Text>
                <Text style={styles.itemMeta}>{row.sportName} · {row.memberCount} members</Text>
                {row.description ? <Text style={styles.itemMeta}>{row.description}</Text> : null}
                {row.isOwner ? (
                  <View style={styles.inlineButtons}>
                    <Text style={styles.ownerBadge}>Owner</Text>
                    <TouchableOpacity style={styles.leaveButton} onPress={() => startEdit(row)}>
                      <Text style={styles.leaveButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => void onDeleteOwnerGroup(row.id)}
                      disabled={deletingId === row.id}
                    >
                      <Text style={styles.deleteButtonText}>{deletingId === row.id ? "Deleting..." : "Delete"}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.leaveButton} onPress={() => void onLeave(row.id)}>
                    <Text style={styles.leaveButtonText}>Leave</Text>
                  </TouchableOpacity>
                )}
              </>
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
    gap: appTheme.spacing.size10,
    paddingBottom: appTheme.spacing.size10,
  },
  title: {
    fontSize: appTheme.typography.size24,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.bold,
  },
  subtitle: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size14,
    fontFamily: mobileFonts.regular,
  },
  section: {
    marginTop: 2,
    gap: appTheme.spacing.size8,
  },
  sectionTitle: {
    fontSize: appTheme.typography.size16,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  item: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size12,
    padding: 12,
    gap: appTheme.spacing.size4,
    backgroundColor: appTheme.colors.surface,
  },
  itemTitle: {
    fontSize: appTheme.typography.size15,
    color: appTheme.colors.foreground,
    fontFamily: mobileFonts.semiBold,
  },
  itemMeta: {
    fontSize: appTheme.typography.size12,
    color: appTheme.colors.muted,
    fontFamily: mobileFonts.regular,
  },
  ownerBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: appTheme.radius.pill,
    backgroundColor: appTheme.colors.primary,
    color: appTheme.colors.onPrimary,
    paddingHorizontal: appTheme.spacing.size10,
    paddingVertical: appTheme.spacing.size4,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.semiBold,
  },
  joinButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: appTheme.radius.size10,
    backgroundColor: appTheme.colors.accent,
    paddingHorizontal: appTheme.spacing.size12,
    paddingVertical: appTheme.spacing.size6,
  },
  joinButtonText: {
    color: appTheme.colors.onPrimary,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.semiBold,
  },
  leaveButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: appTheme.radius.size10,
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    backgroundColor: appTheme.colors.onPrimary,
    paddingHorizontal: appTheme.spacing.size12,
    paddingVertical: appTheme.spacing.size6,
  },
  leaveButtonText: {
    color: appTheme.colors.foreground,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.semiBold,
  },
  deleteButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: appTheme.radius.size10,
    backgroundColor: appTheme.colors.danger,
    paddingHorizontal: appTheme.spacing.size12,
    paddingVertical: appTheme.spacing.size6,
  },
  deleteButtonText: {
    color: appTheme.colors.onPrimary,
    fontSize: appTheme.typography.size12,
    fontFamily: mobileFonts.semiBold,
  },
  inlineButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appTheme.spacing.size8,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radius.size10,
    paddingHorizontal: appTheme.spacing.size10,
    paddingVertical: appTheme.spacing.size8,
    color: appTheme.colors.foreground,
    backgroundColor: appTheme.colors.surface,
    fontFamily: mobileFonts.regular,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  refreshButton: {
    marginTop: 6,
    alignItems: "center",
    borderRadius: appTheme.radius.size10,
    paddingVertical: appTheme.spacing.size10,
    backgroundColor: appTheme.colors.primary,
  },
  refreshButtonText: {
    color: appTheme.colors.onPrimary,
    fontFamily: mobileFonts.bold,
  },
  empty: {
    color: appTheme.colors.muted,
    fontSize: appTheme.typography.size13,
    fontFamily: mobileFonts.regular,
  },
  error: {
    color: appTheme.colors.dangerText,
    fontSize: appTheme.typography.size13,
    fontFamily: mobileFonts.regular,
  },
});
