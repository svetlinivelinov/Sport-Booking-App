import { NextResponse } from "next/server";

const DEFAULT_DEV_ORIGINS = new Set([
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
]);

function resolveAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }

  if (process.env.NODE_ENV !== "production") {
    return origin;
  }

  const envOrigin = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envOrigin && origin === envOrigin) {
    return origin;
  }

  if (DEFAULT_DEV_ORIGINS.has(origin)) {
    return origin;
  }

  return null;
}

export function withCors(request: Request, response: NextResponse): NextResponse {
  const allowedOrigin = resolveAllowedOrigin(request);
  if (!allowedOrigin) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Vary", "Origin");

  return response;
}

export function corsPreflight(request: Request): NextResponse {
  return withCors(request, new NextResponse(null, { status: 204 }));
}
