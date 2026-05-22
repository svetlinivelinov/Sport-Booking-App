export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function normalizePage(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_PAGE;
  }
  return Math.max(DEFAULT_PAGE, Math.floor(parsed));
}

export function normalizePageSize(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(parsed)));
}
