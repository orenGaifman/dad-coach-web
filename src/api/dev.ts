/**
 * Dev Dashboard API client functions.
 *
 * Provides fetch functions for the Dev Dashboard debugging endpoints.
 * These endpoints are only available in non-production environments.
 *
 * @see Requirements 1.1, 2.1, 3.1, 4.1
 */

import { apiClient, ApiError } from '@/src/lib/api-client';
import type {
  DevFatherListItem,
  DevFatherState,
  DevMessagesResponse,
  DevTransitionsResponse,
  PaginatedResponse,
} from '@/src/types/dev';

// ---------------------------------------------------------------------------
// List Fathers
// ---------------------------------------------------------------------------

/**
 * Fetch a paginated list of fathers for the Dev Dashboard.
 *
 * @param search - Optional search query to filter by phone or display_name (case-insensitive)
 * @param page - Zero-indexed page number (default: 0)
 * @param pageSize - Number of results per page (default: 20, max: 100)
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Paginated list of fathers with debugging info
 * @throws ApiError with status 400 if pageSize exceeds 100
 * @throws ApiError with status 403 if accessed in production environment
 *
 * @see Requirement 1.1: List All Fathers
 */
export async function fetchFathers(
  search?: string,
  page?: number,
  pageSize?: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<DevFatherListItem>> {
  const queryParams: Record<string, string> = {};

  if (search !== undefined && search !== '') {
    queryParams.search = search;
  }

  if (page !== undefined) {
    queryParams.page = String(page);
  }

  if (pageSize !== undefined) {
    queryParams.page_size = String(pageSize);
  }

  try {
    return await apiClient.get<PaginatedResponse<DevFatherListItem>>(
      '/dev/fathers',
      queryParams,
      { signal }
    );
  } catch (error) {
    // Re-throw ApiError with additional context if needed
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Get Father State
// ---------------------------------------------------------------------------

/**
 * Fetch detailed state information for a specific father.
 *
 * @param id - Father identifier
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Complete father state details including workflow, belt, children, and quality times
 * @throws ApiError with status 403 if accessed in production environment
 * @throws ApiError with status 404 if father ID does not exist
 *
 * @see Requirement 2.1: Get Father State Details
 */
export async function fetchFatherState(
  id: number,
  signal?: AbortSignal
): Promise<DevFatherState> {
  try {
    return await apiClient.get<DevFatherState>(`/dev/fathers/${id}/state`, { signal });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Get Messages
// ---------------------------------------------------------------------------

/**
 * Fetch the message log for a specific father.
 *
 * @param id - Father identifier
 * @param limit - Maximum number of messages to return (default: 50, max: 200)
 * @param since - Optional ISO 8601 timestamp; returns only messages after this time
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Message log entries for the father
 * @throws ApiError with status 400 if limit exceeds 200
 * @throws ApiError with status 403 if accessed in production environment
 * @throws ApiError with status 404 if father ID does not exist
 *
 * @see Requirement 3.1: Get Message Log
 */
export async function fetchMessages(
  id: number,
  limit?: number,
  since?: string,
  signal?: AbortSignal
): Promise<DevMessagesResponse> {
  const queryParams: Record<string, string> = {};

  if (limit !== undefined) {
    queryParams.limit = String(limit);
  }

  if (since !== undefined && since !== '') {
    queryParams.since = since;
  }

  try {
    return await apiClient.get<DevMessagesResponse>(
      `/dev/fathers/${id}/messages`,
      queryParams,
      { signal }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Get Transitions
// ---------------------------------------------------------------------------

/**
 * Fetch the workflow state transition history for a specific father.
 *
 * @param id - Father identifier
 * @param limit - Maximum number of transitions to return (default: 30, max: 100)
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Workflow state transition log entries for the father
 * @throws ApiError with status 400 if limit exceeds 100
 * @throws ApiError with status 403 if accessed in production environment
 * @throws ApiError with status 404 if father ID does not exist
 *
 * @see Requirement 4.1: Get State Transitions
 */
export async function fetchTransitions(
  id: number,
  limit?: number,
  signal?: AbortSignal
): Promise<DevTransitionsResponse> {
  const queryParams: Record<string, string> = {};

  if (limit !== undefined) {
    queryParams.limit = String(limit);
  }

  try {
    return await apiClient.get<DevTransitionsResponse>(
      `/dev/fathers/${id}/transitions`,
      queryParams,
      { signal }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
}
