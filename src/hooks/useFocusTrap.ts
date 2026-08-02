'use client';

/**
 * useFocusTrap — Hook for trapping focus within a container
 *
 * Implements keyboard navigation requirements:
 * - Focus trapped within container
 * - Tab cycles through focusable elements
 * - Shift+Tab cycles backwards
 * - Focus restored to previously focused element on unmount
 *
 * @see Task 8.3: Keyboard navigation and focus management
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isActive?: boolean;
  /** Whether to restore focus on deactivation */
  restoreFocus?: boolean;
  /** Whether to auto-focus first element on activation */
  autoFocus?: boolean;
  /** Initial element to focus (selector or element) */
  initialFocus?: string | HTMLElement | null;
}

interface UseFocusTrapReturn {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook to trap focus within a container element.
 * Useful for modals, dialogs, and other overlay components.
 */
export function useFocusTrap(options: UseFocusTrapOptions = {}): UseFocusTrapReturn {
  const {
    isActive = true,
    restoreFocus = true,
    autoFocus = true,
    initialFocus = null,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => {
      // Filter out hidden elements
      return el.offsetParent !== null && !el.hasAttribute('hidden');
    });
  }, []);

  // Handle Tab key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift+Tab on first element: move to last
      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab on last element: move to first
      if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
        return;
      }

      // If focus is outside the container, bring it back
      if (!containerRef.current?.contains(activeElement)) {
        e.preventDefault();
        if (e.shiftKey) {
          lastElement.focus();
        } else {
          firstElement.focus();
        }
      }
    },
    [isActive, getFocusableElements]
  );

  // Store previously focused element and set initial focus
  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Set initial focus
    if (autoFocus) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (!containerRef.current) return;

        let elementToFocus: HTMLElement | null = null;

        // Check for initial focus option
        if (initialFocus) {
          if (typeof initialFocus === 'string') {
            elementToFocus = containerRef.current.querySelector(initialFocus);
          } else if (initialFocus instanceof HTMLElement) {
            elementToFocus = initialFocus;
          }
        }

        // Fall back to first focusable element
        if (!elementToFocus) {
          const focusableElements = getFocusableElements();
          elementToFocus = focusableElements[0] ?? null;
        }

        elementToFocus?.focus();
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [isActive, autoFocus, initialFocus, getFocusableElements]);

  // Restore focus on deactivation
  useEffect(() => {
    if (!isActive) return;

    return () => {
      if (restoreFocus && previouslyFocusedRef.current) {
        // Small delay to ensure modal is closed before restoring focus
        setTimeout(() => {
          previouslyFocusedRef.current?.focus();
        }, 10);
      }
    };
  }, [isActive, restoreFocus]);

  // Add keydown listener
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleKeyDown]);

  return { containerRef };
}

export default useFocusTrap;
