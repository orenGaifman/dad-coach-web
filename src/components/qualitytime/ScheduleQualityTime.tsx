'use client';

/**
 * ScheduleQualityTime — Modal component for scheduling Quality Time with children.
 *
 * This modal integrates AvailableSlotPicker, ChildSelector, and ConfirmationModal
 * to provide a complete scheduling flow for Quality Time sessions.
 *
 * Features:
 * - Loading state while fetching available slots
 * - Time slot selection via AvailableSlotPicker
 * - Child selection via ChildSelector (skipped if only one child)
 * - Confirmation step before scheduling
 * - Success/error state feedback
 * - Automatic modal close on successful scheduling
 *
 * Requirements: 13.4 - Quality Time scheduling from web dashboard
 * @see design.md - Screen D2: Schedule Quality Time
 */

import { useState, useCallback, useEffect } from 'react';
import { AvailableSlotPicker } from './AvailableSlotPicker';
import { ChildSelector, type Child } from './ChildSelector';
import { ConfirmationModal } from './ConfirmationModal';
import { useAvailableSlots } from '@/src/hooks/useAvailableSlots';
import { useScheduleQualityTime } from '@/src/hooks/useScheduleQualityTime';
import { useChildren } from '@/src/hooks/useChildren';
import type { AvailableSlot } from '@/src/types/qualityTime';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduleQualityTimeProps {
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Additional CSS classes for the modal container */
  className?: string;
}

type SchedulingStep = 'select-slot' | 'confirm' | 'success' | 'error';

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a slot's date and time for display.
 */
function formatSlotDateTime(slot: AvailableSlot): string {
  const startDate = new Date(slot.start_time);
  const endDate = new Date(slot.end_time);
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  
  const dateStr = startDate.toLocaleDateString('en-US', dateOptions);
  const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
  const endTime = endDate.toLocaleTimeString('en-US', timeOptions);
  
  return `${dateStr}, ${startTime} - ${endTime}`;
}

/**
 * Map ChildOverview to Child interface for ChildSelector.
 */
function mapToSelectorChild(childOverview: {
  child_id: number;
  name: string;
  age_years?: number;
}): Child {
  return {
    id: String(childOverview.child_id),
    name: childOverview.name,
    age: childOverview.age_years,
  };
}

/**
 * X close icon component.
 */
function CloseIcon({ className }: { className?: string }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Success checkmark icon.
 */
function SuccessIcon({ className }: { className?: string }) {
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
      <polyline points="9,12 12,15 16,10" />
    </svg>
  );
}

/**
 * Error icon.
 */
function ErrorIcon({ className }: { className?: string }) {
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
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ScheduleQualityTime Component
// ---------------------------------------------------------------------------

/**
 * Modal component for scheduling Quality Time.
 *
 * Provides a multi-step flow:
 * 1. Select a time slot from available slots
 * 2. Select a child (if multiple children exist)
 * 3. Confirm the selection
 * 4. Show success or error feedback
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * {isOpen && (
 *   <ScheduleQualityTime onClose={() => setIsOpen(false)} />
 * )}
 * ```
 */
export function ScheduleQualityTime({
  onClose,
  className,
}: ScheduleQualityTimeProps) {
  // State
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [step, setStep] = useState<SchedulingStep>('select-slot');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Hooks
  const { data: slotsData, isLoading: isSlotsLoading, error: slotsError } = useAvailableSlots();
  const { data: childrenData, isLoading: isChildrenLoading } = useChildren();
  const scheduleMutation = useScheduleQualityTime();

  // Derived state
  const slots = slotsData?.slots ?? [];
  const children: Child[] = (childrenData?.children ?? []).map(mapToSelectorChild);
  const isLoading = isSlotsLoading || isChildrenLoading;
  const hasMultipleChildren = children.length > 1;

  // Auto-select child if only one exists
  useEffect(() => {
    if (children.length === 1 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Get selected child name for confirmation
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const selectedChildName = selectedChild?.name ?? '';

  // Handle slot selection
  const handleSlotSelect = useCallback((slot: AvailableSlot) => {
    setSelectedSlot(slot);
  }, []);

  // Handle child selection
  const handleChildSelect = useCallback((childId: string) => {
    setSelectedChildId(childId);
  }, []);

  // Handle proceed to confirmation
  const handleProceedToConfirm = useCallback(() => {
    if (selectedSlot && selectedChildId) {
      setStep('confirm');
    }
  }, [selectedSlot, selectedChildId]);

  // Handle cancel confirmation
  const handleCancelConfirm = useCallback(() => {
    setStep('select-slot');
  }, []);

  // Handle scheduling confirmation
  const handleConfirmSchedule = useCallback(() => {
    if (!selectedSlot || !selectedChildId) return;

    scheduleMutation.mutate(
      {
        child_id: parseInt(selectedChildId, 10),
        start_time: selectedSlot.start_time,
        duration_minutes: selectedSlot.duration_minutes,
      },
      {
        onSuccess: () => {
          setStep('success');
          // Auto-close after success animation
          setTimeout(() => {
            onClose();
          }, 2000);
        },
        onError: (error) => {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Failed to schedule Quality Time. Please try again.'
          );
          setStep('error');
        },
      }
    );
  }, [selectedSlot, selectedChildId, scheduleMutation, onClose]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    setErrorMessage('');
    setStep('select-slot');
  }, []);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && step !== 'success') {
        onClose();
      }
    },
    [onClose, step]
  );

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'success') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, step]);

  // Can proceed to confirmation?
  const canProceed = selectedSlot !== null && selectedChildId !== null;

  // Render confirmation modal step
  if (step === 'confirm' && selectedSlot) {
    return (
      <ConfirmationModal
        isOpen={true}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmSchedule}
        title="Schedule Quality Time"
        message="Ready to schedule Quality Time?"
        childName={selectedChildName}
        slotDateTime={formatSlotDateTime(selectedSlot)}
        isLoading={scheduleMutation.isPending}
        className={className}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      className={classNames(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        className
      )}
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className="relative bg-[#0F172A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-white/10"
        role="document"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2
            id="schedule-modal-title"
            className="text-lg font-semibold text-white"
          >
            Schedule Quality Time
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Success State */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
                <SuccessIcon className="w-10 h-10 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Quality Time Scheduled!
              </h3>
              <p className="text-gray-400">
                {selectedChildName && `Quality Time with ${selectedChildName} has been added to your calendar.`}
              </p>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <ErrorIcon className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Scheduling Failed
              </h3>
              <p className="text-gray-400 mb-4">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Slot Selection State */}
          {step === 'select-slot' && (
            <div className="space-y-6">
              {/* Error loading slots */}
              {slotsError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-red-400">
                    Failed to load available time slots. Please try again.
                  </p>
                </div>
              )}

              {/* Child selector (only if multiple children) */}
              {!isChildrenLoading && hasMultipleChildren && (
                <ChildSelector
                  children={children}
                  selectedChildId={selectedChildId}
                  onSelectChild={handleChildSelect}
                />
              )}

              {/* Single child display */}
              {!isChildrenLoading && children.length === 1 && (
                <ChildSelector
                  children={children}
                  selectedChildId={selectedChildId}
                  onSelectChild={handleChildSelect}
                />
              )}

              {/* Available slots picker */}
              <AvailableSlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSlotSelect}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Footer - only show for slot selection step */}
        {step === 'select-slot' && (
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToConfirm}
                disabled={!canProceed}
                className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleQualityTime;
