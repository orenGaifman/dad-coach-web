'use client';

/**
 * AutoRefreshToggle — toggle switch for enabling/disabling auto-refresh polling.
 *
 * Features:
 * - Controlled toggle component (enabled/onToggle props)
 * - Shows "Live" badge with green color and pulsing animation when enabled
 * - Shows "Paused" text when disabled
 * - Defaults to enabled on page load (controlled by parent)
 * - Uses proper ARIA attributes for accessibility
 * - Matches dark theme styling of other dashboard components
 *
 * @see Requirements 11.1, 11.2, 11.4
 */

import { useCallback, useId } from 'react';

interface AutoRefreshToggleProps {
  /** Whether auto-refresh is currently enabled */
  enabled: boolean;
  /** Callback when toggle state changes */
  onToggle: (enabled: boolean) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Animated pulsing dot indicator for live mode.
 */
function PulsingDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
  );
}

/**
 * AutoRefreshToggle component — provides a toggle to enable/disable auto-refresh polling.
 *
 * The component is controlled and expects the parent to manage the enabled state.
 * This allows the parent to provide shared state for polling components.
 *
 * Implements:
 * - Requirement 11.1: Toggle to enable/disable auto-refresh polling
 * - Requirement 11.2: Visual indicator when auto-refresh is enabled
 * - Requirement 11.4: Default to enabled (controlled by parent passing enabled={true})
 *
 * @see Requirements 11.1, 11.2, 11.4
 */
export function AutoRefreshToggle({
  enabled,
  onToggle,
  className = '',
}: AutoRefreshToggleProps) {
  const toggleId = useId();

  const handleToggle = useCallback(() => {
    onToggle(!enabled);
  }, [enabled, onToggle]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Toggle on Space or Enter key
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onToggle(!enabled);
      }
    },
    [enabled, onToggle]
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Toggle Switch */}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0F172A]
          ${enabled ? 'bg-green-600' : 'bg-white/10'}
        `}
      >
        {/* Toggle Knob */}
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-in-out
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>

      {/* Status Label with Badge */}
      <label
        htmlFor={toggleId}
        className="flex items-center gap-2 text-sm cursor-pointer select-none"
      >
        {enabled ? (
          <>
            <PulsingDot />
            <span className="text-green-400 font-medium">Live</span>
          </>
        ) : (
          <span className="text-gray-400">Paused</span>
        )}
      </label>
    </div>
  );
}

export default AutoRefreshToggle;
