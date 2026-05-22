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
  params: { mine?: boolean; status?: string; page?: number; pageSize?: number } = {},
): Promise<SessionsResponse> {
  const searchParams = new URLSearchParams();
  if (params.mine) {
    searchParams.set("mine", "1");
  }
  if (params.status) {
    searchParams.set("status", params.status);
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
