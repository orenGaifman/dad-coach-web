/**
 * API configuration.
 *
 * Base URL for the backend API. Reads from NEXT_PUBLIC_API_BASE_URL env var,
 * falling back to '/api/v1' for local development (proxied by Next.js).
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';
