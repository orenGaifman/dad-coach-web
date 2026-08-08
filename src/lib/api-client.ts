/**
 * Central HTTP client wrapping fetch for API calls.
 *
 * Responsibilities:
 * - Base URL resolution (from src/config/api.ts)
 * - Authentication header injection (CSRF token for mutations)
 * - Request/response JSON serialization
 * - HTTP error classification (network, 401, 403, 404, 429, 5xx)
 * - Typed ApiError throwing with code, message, retryable flag
 * - Request timeout enforcement
 * - Content-Type headers
 *
 * What it does NOT do:
 * - Caching (owned by TanStack Query in hooks)
 * - Retry logic for queries (owned by TanStack Query)
 * - Business validation (owned by services)
 * - UI error display (owned by components)
 */

import { API_BASE_URL, REQUEST_TIMEOUT } from '@/src/config/api';
import { AUTH_TOKEN_KEY } from '@/src/config/auth';
import type {
  ApiError as ApiErrorType,
  HttpErrorCategory,
  WorkspaceErrorCode,
} from '@/src/types/common';

// ---------------------------------------------------------------------------
// ApiError class
// ---------------------------------------------------------------------------

/**
 * Body object for backward compatibility with existing code.
 * Uses string for code to allow any error code (not just WorkspaceErrorCode).
 */
export interface ApiErrorBody {
  code?: string;
  message?: string;
  field?: string;
  retry_after?: number;
}

/**
 * Custom error class for API errors with structured error data.
 * Implements the ApiError interface from common.ts.
 * 
 * Supports two constructor signatures for backward compatibility:
 * - New: ApiError(status, code, message, options?)
 * - Old: ApiError(status, body)
 */
export class ApiError extends Error implements ApiErrorType {
  readonly code: WorkspaceErrorCode;
  readonly field?: string;
  readonly retry_after?: number;
  readonly retryable: boolean;
  readonly status: number;
  readonly category: HttpErrorCategory;

  constructor(
    status: number,
    codeOrBody: WorkspaceErrorCode | string | ApiErrorBody,
    message?: string,
    options?: {
      field?: string;
      retry_after?: number;
      retryable?: boolean;
      category?: HttpErrorCategory;
    }
  ) {
    // Detect old constructor signature: ApiError(status, body)
    if (typeof codeOrBody === 'object') {
      const body = codeOrBody;
      super(body.message ?? `API error ${status}`);
      this.name = 'ApiError';
      this.status = status;
      // Cast to WorkspaceErrorCode for interface compliance, but body.code can be any string
      this.code = (body.code ?? getDefaultErrorCode(status)) as WorkspaceErrorCode;
      this.field = body.field;
      this.retry_after = body.retry_after;
      this.retryable = isRetryable(status);
      this.category = classifyHttpError(status);
    } else {
      // New constructor signature: ApiError(status, code, message, options?)
      super(message ?? `API error ${status}`);
      this.name = 'ApiError';
      this.status = status;
      this.code = codeOrBody as WorkspaceErrorCode;
      this.field = options?.field;
      this.retry_after = options?.retry_after;
      this.retryable = options?.retryable ?? false;
      this.category = options?.category ?? classifyHttpError(status);
    }
  }

  /**
   * Backward compatibility getter for existing code that expects `err.body`.
   * Returns the error properties in the old format.
   */
  get body(): ApiErrorBody {
    return {
      code: this.code,
      message: this.message,
      field: this.field,
      retry_after: this.retry_after,
    };
  }
}

// ---------------------------------------------------------------------------
// HTTP Error Classification
// ---------------------------------------------------------------------------

/**
 * Classifies HTTP status codes into error categories.
 */
function classifyHttpError(status: number): HttpErrorCategory {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500 && status < 600) return 'server';
  return 'unknown';
}

/**
 * Maps HTTP status codes to default error codes.
 */
function getDefaultErrorCode(status: number): WorkspaceErrorCode {
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 429:
      return 'RATE_LIMITED';
    case 400:
    case 422:
      return 'VALIDATION_ERROR';
    default:
      if (status >= 500) return 'INTERNAL_ERROR';
      return 'INTERNAL_ERROR';
  }
}

/**
 * Determines if an error is retryable based on status code.
 */
function isRetryable(status: number): boolean {
  // Server errors (5xx) and rate limits (429) are retryable
  return status >= 500 || status === 429;
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
// Auth Token Management
// ---------------------------------------------------------------------------

/**
 * Gets the auth token from localStorage.
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

/**
 * Clears auth token and redirects to login.
 * Called when we receive a 401 Unauthorized response.
 * 
 * Does NOT clear token or redirect if:
 * - We're on the auth/magic page (token is being set)
 * - We're on public pages (join, landing, etc.)
 */
function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    
    // Don't clear token or redirect on auth pages - let them handle their own flow
    const authPages = ['/auth/magic', '/join', '/'];
    if (authPages.some(page => currentPath.startsWith(page) || currentPath === page)) {
      console.log('[ApiClient] Skipping handleUnauthorized on auth page:', currentPath);
      return;
    }
    
    localStorage.removeItem(AUTH_TOKEN_KEY);
    // Redirect to login page
    window.location.href = '/join';
  }
}

// ---------------------------------------------------------------------------
// Timeout utility
// ---------------------------------------------------------------------------

/**
 * Creates an AbortSignal that will abort after the specified timeout.
 * If an existing signal is provided, the request will abort on either timeout or the existing signal.
 */
function createTimeoutSignal(
  timeoutMs: number,
  existingSignal?: AbortSignal
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // If there's an existing signal, listen for its abort event
  if (existingSignal) {
    if (existingSignal.aborted) {
      controller.abort();
    } else {
      existingSignal.addEventListener('abort', () => controller.abort());
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

interface ErrorResponseBody {
  code?: WorkspaceErrorCode;
  message?: string;
  field?: string;
  retry_after?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal: existingSignal, headers: extraHeaders } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // Include auth token for authenticated requests
  const authToken = getAuthToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Include CSRF token for state-changing requests
  const csrfTokenValue = getCsrfToken();
  if (csrfTokenValue && method !== 'GET') {
    headers['X-CSRF-Token'] = csrfTokenValue;
  }

  // Create timeout signal
  const { signal, cleanup } = createTimeoutSignal(REQUEST_TIMEOUT, existingSignal);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    cleanup();

    if (!res.ok) {
      let errorBody: ErrorResponseBody = {};
      try {
        errorBody = (await res.json()) as ErrorResponseBody;
      } catch {
        // Response may not be JSON — use defaults
        errorBody = { message: res.statusText };
      }

      const status = res.status;
      
      // Handle 401 Unauthorized - clear token and redirect to login
      if (status === 401) {
        handleUnauthorized();
      }
      
      const code = errorBody.code ?? getDefaultErrorCode(status);
      const message = errorBody.message ?? `API error ${status}`;
      const category = classifyHttpError(status);

      throw new ApiError(status, code, message, {
        field: errorBody.field,
        retry_after: errorBody.retry_after,
        retryable: isRetryable(status),
        category,
      });
    }

    // Some endpoints may return 204 No Content
    if (res.status === 204) {
      return undefined as unknown as T;
    }

    return (await res.json()) as T;
  } catch (error) {
    cleanup();

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle abort/timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(0, 'TIMEOUT', 'Request timed out', {
        retryable: true,
        category: 'timeout',
      });
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'NETWORK_ERROR', 'Unable to connect to the server', {
        retryable: true,
        category: 'network',
      });
    }

    // Generic network failure
    throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed', {
      retryable: true,
      category: 'network',
    });
  }
}

// ---------------------------------------------------------------------------
// URL building utility
// ---------------------------------------------------------------------------

/**
 * Builds a URL path with query parameters.
 */
function buildUrl(path: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return path;
  }
  const searchParams = new URLSearchParams(params);
  return `${path}?${searchParams.toString()}`;
}

// ---------------------------------------------------------------------------
// Public API client
// ---------------------------------------------------------------------------

export const apiClient = {
  /**
   * Performs a GET request.
   * @param path - API endpoint path (e.g., '/workspace/summary')
   * @param paramsOrOptions - Optional query parameters OR options object (for backward compatibility)
   * @param options - Optional request options (signal) when params are provided
   */
  get<T>(
    path: string,
    paramsOrOptions?: Record<string, string> | { signal?: AbortSignal },
    options?: { signal?: AbortSignal }
  ): Promise<T> {
    // Handle backward compatibility: if second arg has 'signal', treat it as options
    if (paramsOrOptions !== undefined && typeof paramsOrOptions === 'object') {
      // Check if it's the options object with signal (not query params)
      const hasSignalKey = 'signal' in paramsOrOptions;
      const keys = Object.keys(paramsOrOptions);
      // If the only key is 'signal' or signal value is AbortSignal, treat as options
      if (
        hasSignalKey &&
        (keys.length === 1 ||
          (paramsOrOptions as { signal?: AbortSignal }).signal instanceof AbortSignal ||
          (paramsOrOptions as { signal?: AbortSignal }).signal === undefined)
      ) {
        return request<T>(path, {
          method: 'GET',
          signal: (paramsOrOptions as { signal?: AbortSignal }).signal,
        });
      }
    }
    const url = buildUrl(path, paramsOrOptions as Record<string, string> | undefined);
    return request<T>(url, { method: 'GET', ...options });
  },

  /**
   * Performs a POST request.
   * @param path - API endpoint path
   * @param body - Request body (will be JSON serialized)
   * @param options - Optional request options (signal)
   */
  post<T>(path: string, body?: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    return request<T>(path, { method: 'POST', body, ...options });
  },

  /**
   * Performs a PUT request.
   * @param path - API endpoint path
   * @param body - Request body (will be JSON serialized)
   * @param options - Optional request options (signal)
   */
  put<T>(path: string, body?: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    return request<T>(path, { method: 'PUT', body, ...options });
  },

  /**
   * Performs a DELETE request.
   * @param path - API endpoint path
   * @param options - Optional request options (signal)
   */
  delete(path: string, options?: { signal?: AbortSignal }): Promise<void> {
    return request<void>(path, { method: 'DELETE', ...options });
  },
};
