import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/auth/session";
import { signAuthToken } from "@/auth/jwt";
import { hashPassword } from "@/auth/password";
import { db } from "@/db/client";
import { users } from "@/db/schema";

interface RegisterBody {
  email?: string;
  password?: string;
  displayName?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const displayName = body.displayName?.trim();

  if (!email || !password || !displayName) {
    return NextResponse.json({ error: "email, password, and displayName are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const [createdUser] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      email,
      passwordHash,
      displayName,
      role: "user",
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
    });

  const token = signAuthToken({
    sub: createdUser.id,
    email: createdUser.email,
    role: createdUser.role as "user" | "admin",
  });

  const response = NextResponse.json({ token, user: createdUser }, { status: 201 });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
