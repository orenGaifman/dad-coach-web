'use client';

/**
 * DevWarningBanner — displays a prominent "Development Only" warning banner.
 *
 * This component provides a clearly visible warning at the top of the dev dashboard
 * to remind developers that they are working with debug tools not intended for production.
 *
 * Styling:
 * - Uses amber/orange color scheme to indicate warning
 * - Dark theme compatible (darker yellow/amber tones)
 * - Full-width banner with fixed height (non-blocking)
 * - Sticky positioning to stay at the top of the viewport
 *
 * Accessibility:
 * - Uses role="alert" for screen reader announcement
 * - Includes aria-label for warning context
 * - Warning emoji is marked aria-hidden
 *
 * @see Requirement 14.4: Display a clear "Development Only" warning banner at the top
 */

export function DevWarningBanner() {
  return (
    <div
      className="sticky top-0 z-50 bg-amber-600/90 border-b border-amber-700 px-4 py-2"
      role="alert"
      aria-label="Development environment warning"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-medium text-white">
        <span className="text-lg" aria-hidden="true">
          ⚠️
        </span>
        <span>
          Development Only — This dashboard is for debugging and testing purposes only
        </span>
      </div>
    </div>
  );
}

export default DevWarningBanner;
