import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { signAuthToken } from "@/auth/jwt";
import { verifyPassword } from "@/auth/password";
import { AUTH_COOKIE_NAME } from "@/auth/session";
import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { db } from "@/db/client";
import { users } from "@/db/schema";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return withCors(
      request,
      NextResponse.json({ error: "email and password are required" }, { status: 400 }),
    );
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (!user) {
    return withCors(request, NextResponse.json({ error: "Invalid credentials" }, { status: 401 }));
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return withCors(request, NextResponse.json({ error: "Invalid credentials" }, { status: 401 }));
  }

  const token = signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role as "user" | "admin",
  });

  const response = NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return withCors(request, response);
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
