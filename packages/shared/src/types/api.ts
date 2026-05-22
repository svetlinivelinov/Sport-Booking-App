export interface ApiErrorResponse {
  error: string;
}

export interface ApiPagedResponse<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  rows: T[];
}
