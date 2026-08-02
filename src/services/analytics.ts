/**
 * Analytics Service — Event tracking abstraction
 *
 * Thin abstraction layer for analytics events. Currently logs to console
 * in development and can be extended to integrate with:
 * - Google Analytics 4
 * - Mixpanel
 * - Amplitude
 * - Custom backend analytics
 *
 * @see Task 8.4: Analytics event tracking
 */

// Analytics event types for the Father Workspace
export type AnalyticsEventType =
  | 'page_view'
  | 'activity_logged'
  | 'celebration_viewed'
  | 'celebration_dismissed'
  | 'whatsapp_bridge_clicked'
  | 'notification_opened'
  | 'notification_mark_read'
  | 'notification_mark_all_read'
  | 'profile_updated'
  | 'child_added'
  | 'child_updated'
  | 'child_archived'
  | 'preferences_updated';

// Event properties for each event type
export interface PageViewProperties {
  page_name: string;
  page_path: string;
  referrer?: string;
}

export interface ActivityLoggedProperties {
  activity_type: 'quality_time' | 'positive_activity';
  child_id?: string;
  points_awarded: number;
  duration_minutes?: number;
}

export interface CelebrationViewedProperties {
  celebration_id: string;
  celebration_type: string;
  points_awarded?: number;
}

export interface CelebrationDismissedProperties {
  celebration_id: string;
  celebration_type: string;
  queue_position: number;
  total_in_queue: number;
}

export interface WhatsAppBridgeClickedProperties {
  source: 'fab' | 'sidebar' | 'empty_state' | 'coaching_page';
}

export interface NotificationOpenedProperties {
  notification_id: string;
  notification_type: string;
  priority: string;
}

export interface NotificationMarkReadProperties {
  notification_ids: string[];
  count: number;
}

export interface ProfileUpdatedProperties {
  fields_updated: string[];
}

export interface ChildAddedProperties {
  child_id: string;
  total_children: number;
}

export interface ChildUpdatedProperties {
  child_id: string;
  fields_updated: string[];
}

export interface ChildArchivedProperties {
  child_id: string;
  remaining_children: number;
}

export interface PreferencesUpdatedProperties {
  preferences_updated: string[];
}

// Union type for all event properties
export type AnalyticsEventProperties =
  | PageViewProperties
  | ActivityLoggedProperties
  | CelebrationViewedProperties
  | CelebrationDismissedProperties
  | WhatsAppBridgeClickedProperties
  | NotificationOpenedProperties
  | NotificationMarkReadProperties
  | ProfileUpdatedProperties
  | ChildAddedProperties
  | ChildUpdatedProperties
  | ChildArchivedProperties
  | PreferencesUpdatedProperties
  | Record<string, unknown>;

// Analytics adapter interface for future integrations
interface AnalyticsAdapter {
  track(eventName: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(pageName: string, properties?: Record<string, unknown>): void;
}

// Console adapter for development
class ConsoleAnalyticsAdapter implements AnalyticsAdapter {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  track(eventName: string, properties?: Record<string, unknown>): void {
    if (this.isEnabled) {
      console.log('[Analytics] Track:', eventName, properties);
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (this.isEnabled) {
      console.log('[Analytics] Identify:', userId, traits);
    }
  }

  page(pageName: string, properties?: Record<string, unknown>): void {
    if (this.isEnabled) {
      console.log('[Analytics] Page:', pageName, properties);
    }
  }
}

// Noop adapter for production until real analytics is configured
class NoopAnalyticsAdapter implements AnalyticsAdapter {
  track(): void {
    // No-op in production until analytics provider is configured
  }

  identify(): void {
    // No-op
  }

  page(): void {
    // No-op
  }
}

// Analytics service class
class AnalyticsService {
  private adapter: AnalyticsAdapter;
  private userId: string | null = null;

  constructor() {
    // Use console adapter in development, noop in production
    this.adapter =
      process.env.NODE_ENV === 'development'
        ? new ConsoleAnalyticsAdapter()
        : new NoopAnalyticsAdapter();
  }

  /**
   * Identify the current user for analytics tracking.
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    this.userId = userId;
    this.adapter.identify(userId, traits);
  }

  /**
   * Track a page view event.
   */
  pageView(properties: PageViewProperties): void {
    this.adapter.page(properties.page_name, {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when an activity is logged.
   */
  activityLogged(properties: ActivityLoggedProperties): void {
    this.adapter.track('activity_logged', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when a celebration is viewed.
   */
  celebrationViewed(properties: CelebrationViewedProperties): void {
    this.adapter.track('celebration_viewed', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when a celebration is dismissed.
   */
  celebrationDismissed(properties: CelebrationDismissedProperties): void {
    this.adapter.track('celebration_dismissed', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when WhatsApp bridge is clicked.
   */
  whatsAppBridgeClicked(properties: WhatsAppBridgeClickedProperties): void {
    this.adapter.track('whatsapp_bridge_clicked', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when a notification is opened.
   */
  notificationOpened(properties: NotificationOpenedProperties): void {
    this.adapter.track('notification_opened', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when notifications are marked as read.
   */
  notificationMarkRead(properties: NotificationMarkReadProperties): void {
    this.adapter.track('notification_mark_read', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when profile is updated.
   */
  profileUpdated(properties: ProfileUpdatedProperties): void {
    this.adapter.track('profile_updated', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when a child is added.
   */
  childAdded(properties: ChildAddedProperties): void {
    this.adapter.track('child_added', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when a child is updated.
   */
  childUpdated(properties: ChildUpdatedProperties): void {
    this.adapter.track('child_updated', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when a child is archived.
   */
  childArchived(properties: ChildArchivedProperties): void {
    this.adapter.track('child_archived', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when preferences are updated.
   */
  preferencesUpdated(properties: PreferencesUpdatedProperties): void {
    this.adapter.track('preferences_updated', {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generic track method for custom events.
   */
  track(eventName: AnalyticsEventType, properties?: AnalyticsEventProperties): void {
    this.adapter.track(eventName, {
      ...properties,
      user_id: this.userId,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export for testing
export { AnalyticsService, ConsoleAnalyticsAdapter, NoopAnalyticsAdapter };
export type { AnalyticsAdapter };
