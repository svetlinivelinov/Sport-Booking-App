export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function safeTrim(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}
