'use client';

/**
 * AvailableSlotPicker — Displays available time slots for scheduling Quality Time.
 *
 * Shows a scrollable list of available time slots from the API, allowing
 * the father to select a slot for scheduling Quality Time with their child.
 * Each slot shows the date (Today/Tomorrow/day name), time range, and duration.
 *
 * Features:
 * - Scrollable list of available slots
 * - User-friendly date/time formatting (Today, Tomorrow, weekday names)
 * - Selected slot highlighting with teal accent
 * - Loading state with skeleton
 * - Empty state when no slots available
 *
 * Requirements: 13.4 - THE frontend SHALL display available slots from backend
 * @see design.md - Screen D2: Schedule Quality Time
 */

import type { AvailableSlot } from '@/src/types/qualityTime';
import { classNames } from '@/src/utils/classNames';

/**
 * Format a date relative to today (Today, Tomorrow, or day name).
 */
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Reset time components for date comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  }
  
  if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Tomorrow';
  }
  
  // Return day name and date (e.g., "Wed, Jan 15")
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a time string for display (e.g., "5:00 PM").
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format the time range for a slot.
 */
function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Format duration for display.
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Check if two slots are the same (for selection comparison).
 */
function isSameSlot(slot1: AvailableSlot | null, slot2: AvailableSlot): boolean {
  if (!slot1) return false;
  return slot1.start_time === slot2.start_time && slot1.end_time === slot2.end_time;
}

/**
 * Clock icon component.
 */
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

/**
 * Calendar icon component.
 */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/**
 * Loading skeleton for slot items.
 */
function SlotSkeleton() {
  return (
    <div className="animate-pulse p-3 rounded-lg bg-[#2D3B4F]/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-600/50" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-600/50 rounded" />
            <div className="h-3 w-32 bg-gray-600/50 rounded" />
          </div>
        </div>
        <div className="h-5 w-12 bg-gray-600/50 rounded" />
      </div>
    </div>
  );
}

/**
 * Props for the AvailableSlotPicker component.
 */
export interface AvailableSlotPickerProps {
  /** Array of available time slots from the API */
  slots: AvailableSlot[];
  /** Currently selected slot, or null if none selected */
  selectedSlot: AvailableSlot | null;
  /** Callback when a slot is selected */
  onSelectSlot: (slot: AvailableSlot) => void;
  /** Whether the slots are currently loading */
  isLoading?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * AvailableSlotPicker component.
 *
 * Displays a scrollable list of available time slots for scheduling
 * Quality Time. Supports selection, loading states, and empty states.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAvailableSlots();
 * const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
 *
 * <AvailableSlotPicker
 *   slots={data?.slots ?? []}
 *   selectedSlot={selectedSlot}
 *   onSelectSlot={setSelectedSlot}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function AvailableSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  className,
}: AvailableSlotPickerProps) {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={classNames(
          'bg-[#1E293B] rounded-xl p-4 border border-white/5',
          className
        )}
        role="region"
        aria-label="Available time slots"
        aria-busy="true"
      >
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Available Time Slots
          </h3>
        </div>
        <div className="space-y-2">
          <SlotSkeleton />
          <SlotSkeleton />
          <SlotSkeleton />
        </div>
      </div>
    );
  }

  // Empty state
  if (slots.length === 0) {
    return (
      <div
        className={classNames(
          'bg-[#1E293B] rounded-xl p-4 border border-white/5',
          className
        )}
        role="region"
        aria-label="Available time slots"
      >
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Available Time Slots
          </h3>
        </div>
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block" aria-hidden="true">📅</span>
          <p className="text-gray-400 text-sm font-medium">
            No available slots found
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Try checking a different time range
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'bg-[#1E293B] rounded-xl p-4 border border-white/5',
        className
      )}
      role="region"
      aria-label="Available time slots"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-teal-400" />
        <h3 className="text-sm font-medium text-gray-300">
          Available Time Slots
        </h3>
        <span className="text-xs text-gray-500 ml-auto">
          {slots.length} slot{slots.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Scrollable slot list */}
      <div
        className="space-y-2 max-h-80 overflow-y-auto pr-1"
        role="listbox"
        aria-label="Select a time slot"
      >
        {slots.map((slot, index) => {
          const isSelected = isSameSlot(selectedSlot, slot);
          const relativeDate = formatRelativeDate(slot.start_time);
          const timeRange = formatTimeRange(slot.start_time, slot.end_time);
          const duration = formatDuration(slot.duration_minutes);

          return (
            <button
              key={`${slot.start_time}-${slot.end_time}`}
              type="button"
              onClick={() => onSelectSlot(slot)}
              role="option"
              aria-selected={isSelected}
              className={classNames(
                'w-full p-3 rounded-lg transition-all duration-200',
                'text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]',
                isSelected
                  ? 'border-2 border-teal-500 bg-teal-500/10'
                  : 'border border-white/5 bg-[#0F172A] hover:bg-[#2D3B4F]'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Date badge */}
                  <div
                    className={classNames(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-teal-500/20' : 'bg-gray-700/50'
                    )}
                  >
                    <ClockIcon
                      className={classNames(
                        'w-5 h-5',
                        isSelected ? 'text-teal-400' : 'text-gray-400'
                      )}
                    />
                  </div>

                  {/* Slot details */}
                  <div>
                    <p
                      className={classNames(
                        'text-sm font-medium',
                        isSelected ? 'text-white' : 'text-gray-200'
                      )}
                    >
                      {relativeDate}
                    </p>
                    <p className="text-xs text-gray-400">
                      {timeRange}
                    </p>
                  </div>
                </div>

                {/* Duration badge */}
                <span
                  className={classNames(
                    'text-xs px-2 py-1 rounded-full',
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'bg-gray-700/50 text-gray-400'
                  )}
                >
                  {duration}
                </span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-xs text-teal-400">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
