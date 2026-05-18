const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "user" | "admin";
  displayName: string;
}

interface LoginResponse {
  token: string;
  user: AuthenticatedUser;
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
