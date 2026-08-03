'use client';

/**
 * ConfirmationModal — Generic confirmation modal for Quality Time scheduling
 *
 * Displays a confirmation dialog with optional child name and slot date/time
 * information. Used for confirming Quality Time scheduling before API submission.
 *
 * Accessibility features:
 * - Focus trapped within modal
 * - Focus restored to previous element on close
 * - Escape key dismisses modal
 * - Enter/Space activates buttons
 * - ARIA attributes for screen readers
 *
 * @see Requirements: 13.4
 * @see Task 22.3: Create ConfirmationModal component
 */

import { useEffect, useCallback } from 'react';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

export interface ConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed (cancel or backdrop click) */
  onClose: () => void;
  /** Callback when the user confirms the action */
  onConfirm: () => void;
  /** Modal title text */
  title: string;
  /** Modal message/description text */
  message: string;
  /** Optional child name to display in the modal */
  childName?: string;
  /** Optional formatted date/time string for the slot */
  slotDateTime?: string;
  /** Whether the confirm action is in progress */
  isLoading?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Generic confirmation modal component for Quality Time scheduling.
 * Shows confirmation details and allows the user to confirm or cancel.
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  childName,
  slotDateTime,
  isLoading = false,
  className = '',
}: ConfirmationModalProps) {
  // Focus trap for accessibility
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    restoreFocus: true,
    autoFocus: true,
    initialFocus: 'button[data-confirm]', // Focus the confirm button initially
  });

  // Handle ESC key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onClose();
      }
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  // Handle confirm with loading state check
  const handleConfirm = useCallback(() => {
    if (!isLoading) {
      onConfirm();
    }
  }, [onConfirm, isLoading]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      ref={containerRef}
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className="relative bg-[#1E293B] rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl border border-white/10"
        role="document"
      >
        {/* Title */}
        <h2
          id="confirmation-modal-title"
          className="text-xl font-bold text-white text-center mb-3"
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirmation-modal-description"
          className="text-gray-300 text-center mb-4"
        >
          {message}
        </p>

        {/* Confirmation details */}
        {(childName || slotDateTime) && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-white/5">
            {childName && (
              <div className="flex items-center justify-between mb-2 last:mb-0">
                <span className="text-gray-400 text-sm">Child</span>
                <span className="text-white font-medium">{childName}</span>
              </div>
            )}
            {slotDateTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Date & Time</span>
                <span className="text-white font-medium">{slotDateTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Cancel button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]"
            aria-label="Cancel and close modal"
          >
            Cancel
          </button>

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            data-confirm
            className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]"
            aria-label={isLoading ? 'Scheduling in progress' : 'Confirm and schedule'}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Scheduling...</span>
              </span>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
