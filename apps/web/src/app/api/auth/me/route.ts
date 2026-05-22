import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { corsPreflight, withCors } from "@/app/api/auth/cors";
import { getSessionUser } from "@/auth/session";
import { db } from "@/db/client";
import { users } from "@/db/schema";

interface UpdateProfileBody {
  displayName?: string;
}

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ user: null }, { status: 401 }));
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, sessionUser.sub) });
  if (!user) {
    return withCors(request, NextResponse.json({ user: null }, { status: 404 }));
  }

  return withCors(
    request,
    NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
    }),
  );
}

export async function PATCH(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  let body: UpdateProfileBody;
  try {
    body = (await request.json()) as UpdateProfileBody;
  } catch {
    return withCors(request, NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }));
  }

  const displayName = body.displayName?.trim();
  if (!displayName) {
    return withCors(request, NextResponse.json({ error: "displayName is required" }, { status: 400 }));
  }

  if (displayName.length < 2 || displayName.length > 120) {
    return withCors(
      request,
      NextResponse.json({ error: "displayName must be between 2 and 120 characters" }, { status: 400 }),
    );
  }

  const [updated] = await db
    .update(users)
    .set({ displayName })
    .where(eq(users.id, sessionUser.sub))
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      displayName: users.displayName,
    });

  if (!updated) {
    return withCors(request, NextResponse.json({ error: "User not found" }, { status: 404 }));
  }

  return withCors(request, NextResponse.json({ user: updated }));
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
