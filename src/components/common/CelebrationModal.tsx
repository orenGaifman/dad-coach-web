'use client';

/**
 * CelebrationModal — Celebration overlay component
 *
 * Displays celebration events (belt level ups, achievements, milestones, streaks)
 * one at a time with a dignified animation. User can dismiss by clicking
 * the button or tapping the overlay. Marks celebrations as displayed via API.
 *
 * Accessibility features:
 * - Focus trapped within modal
 * - Focus restored to previous element on close
 * - Escape key dismisses modal
 * - Enter/Space activates buttons
 * - ARIA attributes for screen readers
 *
 * @see Requirements 16.1-16.7: Celebration Events
 * @see Task 8.3: Keyboard navigation and focus management
 * @see design.md - Celebration Modal (Overlay) layout
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query-client';
import { markCelebrationsDisplayed } from '@/src/services/growth';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';
import { analytics } from '@/src/services/analytics';
import type { Celebration, CelebrationType } from '@/src/types/growth';

interface CelebrationModalProps {
  /** Queue of celebration events to display */
  celebrations: Celebration[];
  /** Callback when all celebrations have been dismissed */
  onComplete: () => void;
}

/**
 * Get celebration title based on event type.
 */
function getCelebrationTitle(type: CelebrationType): string {
  const titles: Record<CelebrationType, string> = {
    BELT_LEVEL_UP: 'Belt Level Up!',
    ACHIEVEMENT_EARNED: 'Achievement Earned!',
    MILESTONE_REACHED: 'Milestone Reached!',
    STREAK_MILESTONE: 'Streak Milestone!',
  };
  return titles[type] ?? 'Congratulations!';
}

/**
 * Get belt image path based on belt level.
 */
function getBeltImagePath(beltLevel: string): string {
  return `/belts/${beltLevel.toLowerCase()}-belt.webp`;
}

export function CelebrationModal({ celebrations, onComplete }: CelebrationModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const queryClient = useQueryClient();
  const dismissButtonRef = useRef<HTMLButtonElement>(null);

  const currentCelebration = celebrations[currentIndex];
  const hasMore = currentIndex < celebrations.length - 1;

  // Focus trap for accessibility
  const { containerRef } = useFocusTrap({
    isActive: !!currentCelebration,
    restoreFocus: true,
    autoFocus: true,
    initialFocus: 'button', // Focus the dismiss button initially
  });

  // Mutation to mark celebration as displayed
  const markDisplayedMutation = useMutation({
    mutationFn: (celebrationId: string) =>
      markCelebrationsDisplayed({ celebration_ids: [celebrationId] }),
    onSuccess: () => {
      // Invalidate celebrations cache to reflect the displayed status
      queryClient.invalidateQueries({ queryKey: queryKeys.celebrations() });
    },
  });

  // Handle dismissing the current celebration
  const handleDismiss = useCallback(() => {
    if (!currentCelebration || isAnimating) return;

    setIsAnimating(true);

    // Track celebration dismissed
    analytics.celebrationDismissed({
      celebration_id: currentCelebration.celebration_id,
      celebration_type: currentCelebration.event_type,
      queue_position: currentIndex,
      total_in_queue: celebrations.length,
    });

    // Mark as displayed
    markDisplayedMutation.mutate(currentCelebration.celebration_id);

    // Animate out
    setIsVisible(false);

    setTimeout(() => {
      if (hasMore) {
        // Show next celebration
        setCurrentIndex((prev) => prev + 1);
        setIsVisible(true);
        // Focus will be handled by the focus trap
      } else {
        // All celebrations dismissed - focus will be restored by useFocusTrap
        onComplete();
      }
      setIsAnimating(false);
    }, 300); // Match animation duration
  }, [currentCelebration, currentIndex, celebrations.length, hasMore, isAnimating, markDisplayedMutation, onComplete]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key dismisses modal
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  // Handle swipe gesture for mobile
  useEffect(() => {
    let startY = 0;
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const diffY = startY - endY;
      const diffX = Math.abs(startX - endX);

      // Swipe up to dismiss (threshold: 50px vertical, less than 50px horizontal)
      if (diffY > 50 && diffX < 50) {
        handleDismiss();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleDismiss]);

  // Focus the dismiss button when transitioning to next celebration
  useEffect(() => {
    if (isVisible && !isAnimating && dismissButtonRef.current) {
      // Small delay to ensure animation is complete
      const timeoutId = setTimeout(() => {
        dismissButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, isVisible, isAnimating]);

  // Track celebration viewed when it becomes visible
  useEffect(() => {
    if (currentCelebration && isVisible && !isAnimating) {
      analytics.celebrationViewed({
        celebration_id: currentCelebration.celebration_id,
        celebration_type: currentCelebration.event_type,
        points_awarded: currentCelebration.points_awarded,
      });
    }
  }, [currentCelebration, isVisible, isAnimating]);

  if (!currentCelebration) return null;

  // Determine which image to show based on celebration type
  const achievementIcon =
    currentCelebration.event_type === 'ACHIEVEMENT_EARNED' &&
    currentCelebration.achievement?.icon_key
      ? `/achievements/${currentCelebration.achievement.icon_key}.webp`
      : null;

  const beltImage =
    currentCelebration.event_type === 'BELT_LEVEL_UP' && currentCelebration.belt?.new_belt
      ? getBeltImagePath(currentCelebration.belt.new_belt)
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      ref={containerRef}
    >
      {/* Overlay backdrop - clicking dismisses */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Background confetti illustration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <Image
          src="/illustrations/celebration-confetti.webp"
          alt=""
          width={400}
          height={400}
          className="object-contain"
          priority
        />
      </div>

      {/* Modal card */}
      <div
        className={`relative bg-[#1E293B] rounded-3xl p-6 max-w-sm w-full mx-auto shadow-2xl border border-white/10 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        role="document"
      >
        {/* Coach celebrating illustration */}
        <div className="flex justify-center mb-4">
          <Image
            src="/dashboard/coach-celebrating.webp"
            alt="Coach celebrating"
            width={100}
            height={100}
            className="rounded-full"
            priority
          />
        </div>

        {/* Title */}
        <h2
          id="celebration-title"
          className="text-xl font-bold text-white text-center mb-2"
        >
          {getCelebrationTitle(currentCelebration.event_type)}
        </h2>

        {/* Celebration message */}
        <p id="celebration-description" className="text-gray-300 text-center mb-4">
          {currentCelebration.title}
        </p>

        {/* Achievement or Belt badge */}
        {achievementIcon && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src={achievementIcon}
                alt={currentCelebration.achievement?.name ?? 'Achievement'}
                width={80}
                height={80}
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        {beltImage && (
          <div className="flex justify-center mb-4">
            <Image
              src={beltImage}
              alt={`${currentCelebration.belt?.new_belt} belt`}
              width={100}
              height={100}
              className="rounded-xl"
            />
          </div>
        )}

        {/* Streak milestone visual */}
        {currentCelebration.event_type === 'STREAK_MILESTONE' && (
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-3xl">🔥</span>
            </div>
          </div>
        )}

        {/* Generic milestone visual */}
        {currentCelebration.event_type === 'MILESTONE_REACHED' && !achievementIcon && !beltImage && (
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <span className="text-3xl">⭐</span>
            </div>
          </div>
        )}

        {/* Encouragement message */}
        <p className="text-gray-400 text-sm text-center mb-4 italic">
          &ldquo;{currentCelebration.encouragement_message}&rdquo;
        </p>

        {/* Points awarded */}
        {currentCelebration.points_awarded && currentCelebration.points_awarded > 0 && (
          <div className="text-center mb-4">
            <span className="text-amber-400 font-bold text-lg" aria-label={`${currentCelebration.points_awarded} experience points awarded`}>
              +{currentCelebration.points_awarded} XP
            </span>
          </div>
        )}

        {/* Dismiss button */}
        <button
          ref={dismissButtonRef}
          onClick={handleDismiss}
          disabled={isAnimating}
          type="button"
          className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]"
          aria-label={hasMore ? 'Next celebration' : 'Close celebration modal'}
        >
          {hasMore ? 'Next →' : 'Awesome! →'}
        </button>

        {/* Progress indicator for multiple celebrations */}
        {celebrations.length > 1 && (
          <div 
            className="flex justify-center gap-1 mt-4"
            role="group"
            aria-label={`Celebration ${currentIndex + 1} of ${celebrations.length}`}
          >
            {celebrations.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-teal-500'
                    : index < currentIndex
                    ? 'bg-teal-500/50'
                    : 'bg-gray-600'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Screen reader announcement for progress */}
        {celebrations.length > 1 && (
          <span className="sr-only" aria-live="polite">
            Showing celebration {currentIndex + 1} of {celebrations.length}
          </span>
        )}
      </div>
    </div>
  );
}

export default CelebrationModal;
