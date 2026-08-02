/**
 * Dashboard Link Configuration
 *
 * Utilities for generating and handling dashboard links that can be
 * sent via WhatsApp coaching messages. These links allow fathers to
 * quickly access their dashboard from the coaching conversation.
 *
 * Flow:
 * 1. Backend generates a short-lived token for the father
 * 2. Token is included in a dashboard link sent via WhatsApp
 * 3. Father clicks link and is authenticated automatically
 * 4. Father lands on the dashboard or specific page
 *
 * @see Requirements: Seamless WhatsApp-to-Dashboard navigation
 */

/**
 * Base URL for the web application.
 * Set via environment variable or defaults to localhost in development.
 */
export const WEB_APP_BASE_URL =
  process.env.NEXT_PUBLIC_WEB_APP_URL ?? 'http://localhost:3000';

/**
 * Dashboard route paths for deep linking.
 */
export const DASHBOARD_ROUTES = {
  /** Main dashboard home */
  home: '/dashboard',
  /** Growth section - belt and achievements */
  growth: '/growth',
  /** Growth - achievements gallery */
  achievements: '/growth/achievements',
  /** Growth - streak display */
  streak: '/growth/streak',
  /** Family - children overview */
  family: '/family',
  /** Coaching - activity log */
  logActivity: '/coaching/log',
  /** Coaching - conversation history */
  coaching: '/coaching',
  /** Profile settings */
  profile: '/profile',
  /** Notifications */
  notifications: '/notifications',
} as const;

export type DashboardRoute = keyof typeof DASHBOARD_ROUTES;

/**
 * Parameters for generating a dashboard link.
 */
export interface DashboardLinkParams {
  /** The route to navigate to (defaults to 'home') */
  route?: DashboardRoute;
  /** Optional magic link token for auto-authentication */
  token?: string;
  /** Optional UTM parameters for analytics */
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

/**
 * Generates a dashboard URL with optional authentication token and analytics params.
 *
 * @example
 * // Basic dashboard link
 * getDashboardLink({ route: 'home' })
 * // => "https://app.dadcoach.com/dashboard"
 *
 * @example
 * // Link with magic auth token
 * getDashboardLink({ route: 'growth', token: 'abc123' })
 * // => "https://app.dadcoach.com/growth?token=abc123"
 *
 * @example
 * // Link with UTM tracking
 * getDashboardLink({
 *   route: 'achievements',
 *   utm: { source: 'whatsapp', medium: 'coach', campaign: 'weekly-checkin' }
 * })
 * // => "https://app.dadcoach.com/growth/achievements?utm_source=whatsapp&utm_medium=coach&utm_campaign=weekly-checkin"
 */
export function getDashboardLink(params: DashboardLinkParams = {}): string {
  const { route = 'home', token, utm } = params;
  const path = DASHBOARD_ROUTES[route];
  
  const url = new URL(path, WEB_APP_BASE_URL);
  
  // Add authentication token if provided
  if (token) {
    url.searchParams.set('token', token);
  }
  
  // Add UTM parameters if provided
  if (utm) {
    if (utm.source) url.searchParams.set('utm_source', utm.source);
    if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
    if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  }
  
  return url.toString();
}

/**
 * Pre-defined link templates for common WhatsApp coaching scenarios.
 * These are used by the backend when composing messages.
 */
export const LINK_TEMPLATES = {
  /** After logging quality time - show achievements */
  afterQualityTime: (token?: string) =>
    getDashboardLink({
      route: 'achievements',
      token,
      utm: { source: 'whatsapp', medium: 'coach', campaign: 'quality-time-logged' },
    }),
  
  /** After earning an achievement - show achievements gallery */
  afterAchievement: (token?: string) =>
    getDashboardLink({
      route: 'achievements',
      token,
      utm: { source: 'whatsapp', medium: 'coach', campaign: 'achievement-earned' },
    }),
  
  /** After belt level up - show growth/belt page */
  afterBeltLevelUp: (token?: string) =>
    getDashboardLink({
      route: 'growth',
      token,
      utm: { source: 'whatsapp', medium: 'coach', campaign: 'belt-level-up' },
    }),
  
  /** Weekly check-in - show dashboard home */
  weeklyCheckin: (token?: string) =>
    getDashboardLink({
      route: 'home',
      token,
      utm: { source: 'whatsapp', medium: 'coach', campaign: 'weekly-checkin' },
    }),
  
  /** Streak milestone - show streak page */
  streakMilestone: (token?: string) =>
    getDashboardLink({
      route: 'streak',
      token,
      utm: { source: 'whatsapp', medium: 'coach', campaign: 'streak-milestone' },
    }),
  
  /** Prompt to log activity - show activity log form */
  promptLogActivity: (token?: string) =>
    getDashboardLink({
      route: 'logActivity',
      token,
      utm: { source: 'whatsapp', medium: 'coach', campaign: 'log-activity-prompt' },
    }),
} as const;

/**
 * Shortens a dashboard link for WhatsApp messages.
 * In production, this would call a URL shortener service.
 * For now, returns the full URL.
 *
 * @param url - The full dashboard URL
 * @returns Shortened URL (or original if shortening fails)
 */
export async function shortenDashboardLink(url: string): Promise<string> {
  // TODO: Integrate with URL shortener service (e.g., Bitly, short.io)
  // For MVP, return the original URL
  return url;
}

/**
 * Extracts dashboard link parameters from the current URL.
 * Used on the frontend to handle incoming dashboard links.
 *
 * @param searchParams - URLSearchParams from the current URL
 * @returns Extracted parameters
 */
export function parseDashboardLinkParams(searchParams: URLSearchParams): {
  token?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  return {
    token: searchParams.get('token') ?? undefined,
    utmSource: searchParams.get('utm_source') ?? undefined,
    utmMedium: searchParams.get('utm_medium') ?? undefined,
    utmCampaign: searchParams.get('utm_campaign') ?? undefined,
  };
}
