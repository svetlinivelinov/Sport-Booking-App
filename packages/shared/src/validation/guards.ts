export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isEmailLike(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}
