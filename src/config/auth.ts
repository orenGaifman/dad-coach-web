/**
 * Authentication Configuration
 *
 * Central location for auth-related constants and configuration.
 * Used across the application for consistent token management.
 */

/**
 * LocalStorage key for storing the JWT access token.
 * Used for API authentication after login or magic link auth.
 */
export const AUTH_TOKEN_KEY = 'dadcoach_auth_token';

/**
 * LocalStorage key for storing the refresh token (if applicable).
 */
export const REFRESH_TOKEN_KEY = 'dadcoach_refresh_token';

/**
 * LocalStorage key for the CSRF token.
 */
export const CSRF_TOKEN_KEY = 'dadcoach_csrf_token';

/**
 * Session storage key.
 */
export const SESSION_ID_KEY = 'dadcoach_session_id';

/**
 * Magic link token expiration time (in minutes).
 * Links sent via WhatsApp expire after this duration.
 */
export const MAGIC_LINK_EXPIRY_MINUTES = 60;

/**
 * Routes that don't require authentication.
 */
export const PUBLIC_ROUTES = [
  '/',
  '/join',
  '/auth/magic',
  '/privacy',
  '/terms',
  '/data-deletion',
] as const;

/**
 * Default redirect path after successful authentication.
 */
export const DEFAULT_AUTH_REDIRECT = '/dashboard';

/**
 * Helper to check if a route is public (doesn't require auth).
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
