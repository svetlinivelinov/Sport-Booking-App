import { cookies, headers } from "next/headers";

import { verifyAuthToken } from "./jwt";

export const AUTH_COOKIE_NAME = "sport_booking_auth";

async function getBearerToken() {
  const authorization = (await headers()).get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export async function getSessionUser() {
  const token = (await getBearerToken()) ?? (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

export async function requireRole(role: "admin" | "user") {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return { ok: false as const, status: 401, error: "Unauthorized" };
  }

  if (role === "admin" && sessionUser.role !== "admin") {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }

  return { ok: true as const, user: sessionUser };
}
