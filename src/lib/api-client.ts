/**
 * Minimal typed fetch wrapper for API calls.
 *
 * - Prepends base URL
 * - Includes credentials (cookies) for session management
 * - Parses JSON responses
 * - Throws ApiError with structured body on non-2xx responses
 */

import { API_BASE_URL } from '@/src/config/api';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  code?: string;
  message?: string;
  field?: string;
  retry_after?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? `API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Request options
// ---------------------------------------------------------------------------

export interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// CSRF Token Store (persisted in localStorage for cross-navigation)
// ---------------------------------------------------------------------------

const CSRF_STORAGE_KEY = 'dadcoach_csrf_token';
const SESSION_STORAGE_KEY = 'dadcoach_session_id';

let csrfToken: string | null = null;

export function setCsrfToken(token: string) {
  csrfToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CSRF_STORAGE_KEY, token);
  }
}

export function getCsrfToken(): string | null {
  if (!csrfToken && typeof window !== 'undefined') {
    csrfToken = localStorage.getItem(CSRF_STORAGE_KEY);
  }
  return csrfToken;
}

export function setStoredSessionId(id: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
}

export function getStoredSessionId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, headers: extraHeaders } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // Include CSRF token for state-changing requests
  const token = getCsrfToken();
  if (token && method !== 'GET') {
    headers['X-CSRF-Token'] = token;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    signal,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: ApiErrorBody = {};
    try {
      errorBody = (await res.json()) as ApiErrorBody;
    } catch {
      // Response may not be JSON — use defaults
      errorBody = { message: res.statusText };
    }
    throw new ApiError(res.status, errorBody);
  }

  // Some endpoints may return 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Public API client
// ---------------------------------------------------------------------------

export const apiClient = {
  get<T>(path: string, options?: { signal?: AbortSignal }): Promise<T> {
    return request<T>(path, { method: 'GET', ...options });
  },

  post<T>(path: string, body?: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    return request<T>(path, { method: 'POST', body, ...options });
  },

  put<T>(path: string, body?: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    return request<T>(path, { method: 'PUT', body, ...options });
  },

  delete<T>(path: string, options?: { signal?: AbortSignal }): Promise<T> {
    return request<T>(path, { method: 'DELETE', ...options });
  },
};
