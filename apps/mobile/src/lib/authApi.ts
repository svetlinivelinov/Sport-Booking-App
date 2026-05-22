const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3010";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "user" | "admin";
  displayName: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  venueName: string | null;
  groupId: string;
  participantCount?: number;
  isParticipant?: boolean;
  myParticipantStatus?: string | null;
}

export interface GroupSummary {
  id: string;
  name: string;
  description: string | null;
  sportId: string;
  sportName: string;
  isOwner: boolean;
  isMember: boolean;
  memberRole: string | null;
  memberCount: number;
}

interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
  error?: string;
}

interface SessionsResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  rows: SessionSummary[];
  error?: string;
}

interface GroupsResponse {
  rows: GroupSummary[];
  error?: string;
}

export async function loginWithPassword(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as LoginResponse;

  if (!response.ok) {
    throw new Error(payload.error || "Login failed");
  }

  return payload;
}

export async function getMyUser(token: string): Promise<AuthenticatedUser | null> {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { user: AuthenticatedUser | null };
  return payload.user;
}

export async function getSessions(
  token: string,
  params: { mine?: boolean; participating?: boolean; status?: string; page?: number; pageSize?: number } = {},
): Promise<SessionsResponse> {
  const searchParams = new URLSearchParams();
  if (params.mine) {
    searchParams.set("mine", "1");
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.participating) {
    searchParams.set("participating", "1");
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  const query = searchParams.toString();
  const url = `${apiBaseUrl}/api/sessions${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await response.json()) as SessionsResponse;

  if (!response.ok) {
    throw new Error(payload.error || "Unable to load sessions");
  }

  return payload;
}

export async function joinSession(token: string, sessionId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/sessions/${sessionId}/participants`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error || "Unable to join session");
  }
}

export async function leaveSession(token: string, sessionId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/sessions/${sessionId}/participants`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error || "Unable to leave session");
  }
}

export async function getGroups(token: string): Promise<GroupsResponse> {
  const response = await fetch(`${apiBaseUrl}/api/groups`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await response.json()) as GroupsResponse;
  if (!response.ok) {
    throw new Error(payload.error || "Unable to load groups");
  }

  return payload;
}

export async function joinGroup(token: string, groupId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/groups/${groupId}/membership`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error || "Unable to join group");
  }
}

export async function leaveGroup(token: string, groupId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/groups/${groupId}/membership`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error || "Unable to leave group");
  }
}

export async function updateGroup(
  token: string,
  groupId: string,
  input: { name: string; description?: string },
): Promise<GroupSummary> {
  const response = await fetch(`${apiBaseUrl}/api/groups/${groupId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as { group?: GroupSummary; error?: string };
  if (!response.ok || !payload.group) {
    throw new Error(payload.error || "Unable to update group");
  }

  return payload.group;
}

export async function deleteGroup(token: string, groupId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/groups/${groupId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error || "Unable to delete group");
  }
}
