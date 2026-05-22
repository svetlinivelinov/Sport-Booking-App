export const AUTH_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

export const AUTH_COOKIE_NAME = "sport_booking_auth";
export const AUTH_HEADER_PREFIX = "Bearer";
