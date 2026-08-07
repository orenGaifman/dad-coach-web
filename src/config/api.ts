/**
 * API configuration.
 *
 * Base URL for the backend API. Reads from NEXT_PUBLIC_API_BASE_URL env var,
 * falling back to production URL.
 */

/** Base URL for all API requests */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dad-coach.onrender.com/api/v1';

/** Request timeout in milliseconds (30 seconds) */
export const REQUEST_TIMEOUT = 30_000;
