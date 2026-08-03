'use client';

/**
 * ChildSelector — Selects a child for Quality Time scheduling.
 *
 * Displays a list of children for the father to select when scheduling
 * Quality Time. If only one child exists, the component auto-selects
 * that child and either hides or shows a simplified confirmation view.
 *
 * Features:
 * - Auto-selection when single child exists
 * - Grid/list layout for multiple children
 * - Selected child has highlighted styling (teal border/background)
 * - Hover states for interactivity
 * - Accessible with proper ARIA labels
 * - Supports avatar display when available
 *
 * Requirements: 13.4 - THE frontend SHALL allow selection of child
 * if multiple children exist.
 *
 * @see design.md - Screen D1: Dashboard Home
 */

import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Child data structure for the selector.
 * Uses existing child data from workspace summary or useChildren hook.
 */
export interface Child {
  /** Unique identifier for the child */
  id: string;
  /** Child's display name */
  name: string;
  /** Child's age (optional) */
  age?: number;
  /** URL for child's avatar image (optional) */
  avatarUrl?: string;
}

/**
 * Props for the ChildSelector component.
 */
export interface ChildSelectorProps {
  /** Array of children to display */
  children: Child[];
  /** Currently selected child ID (null if none selected) */
  selectedChildId: string | null;
  /** Callback when a child is selected */
  onSelectChild: (childId: string) => void;
  /** Additional CSS classes for the container */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Helper function to combine class names, filtering out undefined/null values.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Default avatar icon when no avatar URL is provided.
 */
function DefaultAvatar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    </svg>
  );
}

/**
 * Check icon for selected state.
 */
function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ChildSelector Component
// ---------------------------------------------------------------------------

/**
 * ChildSelector component for Quality Time scheduling.
 *
 * Renders a selectable list of children. When only one child exists,
 * automatically selects that child and shows a simplified confirmation.
 *
 * @example
 * // Multiple children
 * <ChildSelector
 *   children={[
 *     { id: '1', name: 'Maya', age: 5 },
 *     { id: '2', name: 'Noah', age: 8 }
 *   ]}
 *   selectedChildId={selectedChild}
 *   onSelectChild={setSelectedChild}
 * />
 *
 * @example
 * // Single child (auto-selects)
 * <ChildSelector
 *   children={[{ id: '1', name: 'Maya', age: 5 }]}
 *   selectedChildId={selectedChild}
 *   onSelectChild={setSelectedChild}
 * />
 */
export function ChildSelector({
  children,
  selectedChildId,
  onSelectChild,
  className,
}: ChildSelectorProps) {
  // Auto-select if only one child exists
  useEffect(() => {
    if (children.length === 1 && selectedChildId !== children[0].id) {
      onSelectChild(children[0].id);
    }
  }, [children, selectedChildId, onSelectChild]);

  // Don't render anything if no children
  if (children.length === 0) {
    return null;
  }

  // Single child: show simplified confirmation view
  if (children.length === 1) {
    const child = children[0];
    return (
      <div className={classNames('space-y-2', className)}>
        <p className="text-sm text-gray-400">Quality Time with:</p>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-500/10 border border-teal-500">
          {child.avatarUrl ? (
            <img
              src={child.avatarUrl}
              alt={`${child.name}'s avatar`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
              <DefaultAvatar className="w-6 h-6 text-teal-400" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-white font-medium">{child.name}</p>
            {child.age !== undefined && (
              <p className="text-sm text-gray-400">{child.age} years old</p>
            )}
          </div>
          <CheckIcon className="w-5 h-5 text-teal-500" />
        </div>
      </div>
    );
  }

  // Multiple children: show selectable grid
  return (
    <div className={classNames('space-y-3', className)}>
      <p className="text-sm text-gray-400">Select a child:</p>
      <div
        className="grid gap-3 sm:grid-cols-2"
        role="listbox"
        aria-label="Select child for Quality Time"
      >
        {children.map((child) => {
          const isSelected = selectedChildId === child.id;
          return (
            <button
              key={child.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelectChild(child.id)}
              className={classNames(
                'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
                'text-left',
                'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
                isSelected
                  ? 'bg-teal-500/10 border-2 border-teal-500'
                  : 'bg-white/5 border border-white/10 hover:bg-[#2D3B4F]'
              )}
            >
              {/* Avatar */}
              {child.avatarUrl ? (
                <img
                  src={child.avatarUrl}
                  alt={`${child.name}'s avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className={classNames(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-teal-500/20' : 'bg-white/10'
                  )}
                >
                  <DefaultAvatar
                    className={classNames(
                      'w-7 h-7',
                      isSelected ? 'text-teal-400' : 'text-gray-400'
                    )}
                  />
                </div>
              )}

              {/* Name and age */}
              <div className="flex-1 min-w-0">
                <p
                  className={classNames(
                    'font-medium truncate',
                    isSelected ? 'text-teal-300' : 'text-white'
                  )}
                >
                  {child.name}
                </p>
                {child.age !== undefined && (
                  <p className="text-sm text-gray-400">{child.age} years old</p>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
