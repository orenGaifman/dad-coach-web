/**
 * Analytics event tracking for onboarding.
 *
 * Provides a thin abstraction over the analytics provider.
 * Events are defined by the product spec (FR-7).
 *
 * @see Product Spec FR-7
 */

export type OnboardingAnalyticsEvent =
  | 'onboarding_started'
  | 'step_completed'
  | 'step_skipped'
  | 'validation_error'
  | 'onboarding_completed'
  | 'activation_started'
  | 'activation_succeeded'
  | 'activation_failed'
  | 'session_resumed';

interface EventProperties {
  step?: string;
  field?: string;
  error?: string;
  language?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an onboarding analytics event.
 * 
 * In production, this would integrate with the actual analytics provider
 * (e.g., Segment, Mixpanel, PostHog). For now, it logs to console in development.
 */
export function trackEvent(event: OnboardingAnalyticsEvent, properties?: EventProperties): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, properties);
  }
  
  // TODO: Integrate with actual analytics provider
  // Example: analytics.track(event, properties);
}
