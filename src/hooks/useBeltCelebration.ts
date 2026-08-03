'use client';

/**
 * Hook for detecting and managing belt level-up celebrations.
 *
 * Tracks the previous belt level and detects when the father earns a new belt.
 * When a belt progression is detected (new belt > old belt), activates
 * celebration state for the UI to display a celebration modal.
 *
 * @see Requirement 13.3: Display celebration modal when new belt is earned
 * @see Requirement 13.6: Poll for workspace updates to detect belt changes
 */

import { useState, useRef, useEffect } from 'react';
import { useWorkspaceSummary } from './useWorkspaceSummary';
import type { BeltLevel } from '@/src/types/growth';

/**
 * Belt rank mapping for comparison.
 * Lower index = lower rank. Used to detect belt progression.
 *
 * SACRED Belt Thresholds (do NOT change order):
 * - WHITE: 0-2 completions
 * - YELLOW: 3-9
 * - ORANGE: 10-24
 * - GREEN: 25-49
 * - BLUE: 50-99
 * - PURPLE: (intermediate belt)
 * - BROWN: 100-199
 * - BLACK: 200+
 */
const BELT_RANKS: Record<BeltLevel, number> = {
  WHITE: 0,
  YELLOW: 1,
  ORANGE: 2,
  GREEN: 3,
  BLUE: 4,
  PURPLE: 5,
  BROWN: 6,
  BLACK: 7,
};

/**
 * Get the numeric rank for a belt level.
 * Higher rank means higher belt level.
 */
function getBeltRank(belt: BeltLevel): number {
  return BELT_RANKS[belt];
}

/**
 * State shape for the celebration.
 */
interface CelebrationState {
  /** Whether a celebration is currently active */
  isActive: boolean;
  /** The newly earned belt level (null if no celebration) */
  newBelt: BeltLevel | null;
}

/**
 * Return type for the useBeltCelebration hook.
 */
interface UseBeltCelebrationReturn {
  /** Whether a belt celebration is currently active */
  isActive: boolean;
  /** The newly earned belt level (null if no celebration active) */
  newBelt: BeltLevel | null;
  /** Function to dismiss the celebration */
  dismiss: () => void;
}

/**
 * Hook to detect and manage belt level-up celebrations.
 *
 * Tracks the previous belt level using a ref and compares it with the
 * current belt from workspace summary. When a belt progression is detected
 * (current belt rank > previous belt rank), activates celebration state.
 *
 * @returns Object with isActive, newBelt, and dismiss function
 *
 * @example
 * ```tsx
 * const { isActive, newBelt, dismiss } = useBeltCelebration();
 *
 * if (isActive && newBelt) {
 *   return <BeltCelebrationModal belt={newBelt} onClose={dismiss} />;
 * }
 * ```
 */
export function useBeltCelebration(): UseBeltCelebrationReturn {
  const { data } = useWorkspaceSummary();

  // Track the previous belt level across renders
  const previousBeltRef = useRef<BeltLevel | null>(null);

  // Celebration state
  const [celebration, setCelebration] = useState<CelebrationState>({
    isActive: false,
    newBelt: null,
  });

  useEffect(() => {
    // Wait for data to load
    if (!data?.current_belt) {
      return;
    }

    const currentBelt = data.current_belt;
    const previousBelt = previousBeltRef.current;

    // On first load, just set the reference without triggering celebration
    if (previousBelt === null) {
      previousBeltRef.current = currentBelt;
      return;
    }

    // Check if belt has progressed (new belt rank > old belt rank)
    if (getBeltRank(currentBelt) > getBeltRank(previousBelt)) {
      setCelebration({
        isActive: true,
        newBelt: currentBelt,
      });
    }

    // Update the previous belt reference
    previousBeltRef.current = currentBelt;
  }, [data?.current_belt]);

  /**
   * Dismiss the celebration modal and reset state.
   */
  const dismiss = () => {
    setCelebration({
      isActive: false,
      newBelt: null,
    });
  };

  return {
    isActive: celebration.isActive,
    newBelt: celebration.newBelt,
    dismiss,
  };
}
