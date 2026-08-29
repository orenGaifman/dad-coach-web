'use client';

/**
 * BeltProgressDisplay — Full belt view for the Growth section.
 *
 * Displays the father's current belt with a large visual, score details,
 * progress toward the next belt, and points remaining. For BLACK belt holders,
 * shows a mastery state with special messaging.
 *
 * Features:
 * - Large belt image (150x150) from /belts/{color}-belt.webp
 * - Belt name with color-coded styling
 * - Belt description (e.g., "Committed", "Expert")
 * - Progress bar for non-BLACK belts
 * - Score display with current/target XP
 * - Points remaining to next belt
 * - Special mastery state for BLACK belt
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4 (Belt Progression Display)
 * @see design.md - Screen G1: Growth / Belt Progression - current belt detail card
 */

import Image from 'next/image';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { BeltLevel } from '@/src/types/growth';
import { classNames } from '@/src/utils/classNames';

/**
 * Belt metadata for display purposes.
 * Includes name, description, text color, and progress bar color.
 */
const BELT_INFO: Record<BeltLevel, { 
  name: string; 
  description: string; 
  color: string; 
  progressColor: string;
}> = {
  WHITE: { 
    name: 'White Belt', 
    description: 'Beginner', 
    color: 'text-gray-200', 
    progressColor: 'bg-gray-400' 
  },
  YELLOW: { 
    name: 'Yellow Belt', 
    description: 'Learner', 
    color: 'text-yellow-400', 
    progressColor: 'bg-yellow-500' 
  },
  ORANGE: { 
    name: 'Orange Belt', 
    description: 'Improving', 
    color: 'text-orange-400', 
    progressColor: 'bg-orange-500' 
  },
  GREEN: { 
    name: 'Green Belt', 
    description: 'Committed', 
    color: 'text-emerald-400', 
    progressColor: 'bg-emerald-500' 
  },
  BLUE: { 
    name: 'Blue Belt', 
    description: 'Advanced', 
    color: 'text-blue-400', 
    progressColor: 'bg-blue-500' 
  },
  PURPLE: { 
    name: 'Purple Belt', 
    description: 'Expert', 
    color: 'text-purple-400', 
    progressColor: 'bg-purple-500' 
  },
  BROWN: { 
    name: 'Brown Belt', 
    description: 'Master', 
    color: 'text-amber-700', 
    progressColor: 'bg-amber-700' 
  },
  BLACK: { 
    name: 'Black Belt', 
    description: 'Dad Sensei', 
    color: 'text-gray-100', 
    progressColor: 'bg-gray-200' 
  },
};

/**
 * Belt thresholds for calculating target XP.
 * Used to display the maximum XP for each belt level.
 */
const BELT_THRESHOLDS: Record<BeltLevel, number> = {
  WHITE: 500,
  YELLOW: 1000,
  ORANGE: 1500,
  GREEN: 2000,
  BLUE: 3000,
  PURPLE: 4000,
  BROWN: 5000,
  BLACK: 5000, // Max level
};

/**
 * Props for the BeltProgressDisplay component.
 */
export interface BeltProgressDisplayProps {
  /** Current belt level */
  currentBelt: BeltLevel;
  /** Current XP/score */
  currentScore: number;
  /** Next belt level (null if BLACK belt) */
  nextBelt: BeltLevel | null;
  /** Points remaining to next belt (null if BLACK belt) */
  pointsToNextBelt: number | null;
  /** Progress percentage to next belt 0-100 (null if BLACK belt) */
  progressPercentage: number | null;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * BeltProgressDisplay component.
 *
 * A full-sized belt display card showing current belt, progress,
 * and points remaining to the next belt. For BLACK belt, displays
 * a mastery completion state.
 *
 * @example
 * // Non-BLACK belt with progress
 * <BeltProgressDisplay
 *   currentBelt="GREEN"
 *   currentScore={1750}
 *   nextBelt="BLUE"
 *   pointsToNextBelt={250}
 *   progressPercentage={62.5}
 * />
 *
 * @example
 * // BLACK belt mastery state
 * <BeltProgressDisplay
 *   currentBelt="BLACK"
 *   currentScore={6200}
 *   nextBelt={null}
 *   pointsToNextBelt={null}
 *   progressPercentage={null}
 * />
 */
export function BeltProgressDisplay({
  currentBelt,
  currentScore,
  nextBelt,
  pointsToNextBelt,
  progressPercentage,
  className,
}: BeltProgressDisplayProps) {
  const safeBelt = currentBelt ?? 'WHITE';
  const beltInfo = BELT_INFO[safeBelt];
  const isBlackBelt = safeBelt === 'BLACK';
  const nextBeltThreshold = nextBelt ? BELT_THRESHOLDS[nextBelt] : null;

  return (
    <div
      className={classNames(
        'bg-[#1E293B] rounded-2xl p-6 border border-white/5',
        className
      )}
      role="region"
      aria-label={`Current belt: ${beltInfo.name}`}
    >
      {/* Large belt image - centered */}
      <div className="flex justify-center mb-4">
        <Image
          src={`/belts/${safeBelt.toLowerCase()}-belt.webp`}
          alt={beltInfo.name}
          width={150}
          height={150}
          className="object-contain"
          priority
        />
      </div>

      {/* Belt name and description */}
      <div className="text-center mb-4">
        <h2 className={classNames('text-2xl font-bold', beltInfo.color)}>
          {beltInfo.name}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {beltInfo.description}
        </p>
      </div>

      {/* Progress section */}
      {isBlackBelt ? (
        // BLACK belt mastery state
        <div className="text-center">
          {/* Trophy/mastery badge */}
          <div 
            className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-5 py-3 rounded-full mb-4"
            aria-label="Dad Sensei achievement"
          >
            <span className="text-2xl" aria-hidden="true">🏆</span>
            <span className="font-semibold text-lg">Dad Sensei</span>
          </div>
          
          {/* Mastery message */}
          <p className="text-gray-300 font-medium">
            You&apos;ve reached the highest level!
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Your dedication to fatherhood is truly inspiring. Keep leading by example.
          </p>
          
          {/* Score display for mastery */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-gray-500 text-sm">Total XP Earned</p>
            <p className="text-white text-2xl font-bold">
              {(currentScore ?? 0).toLocaleString()} XP
            </p>
          </div>
        </div>
      ) : (
        // Progress to next belt (non-BLACK belt)
        <div className="space-y-4">
          {/* Score display */}
          <div className="text-center">
            <p className="text-white text-3xl font-bold">
              {(currentScore ?? 0).toLocaleString()}
              <span className="text-gray-500 text-lg font-normal">
                {' / '}
                {(nextBeltThreshold ?? 0).toLocaleString()} XP
              </span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <ProgressBar
              value={progressPercentage ?? 0}
              color={beltInfo.progressColor}
              height="lg"
              animated
              label={`Progress to ${nextBelt ? BELT_INFO[nextBelt].name : 'next belt'}: ${Math.round(progressPercentage ?? 0)}%`}
            />
            
            {/* Progress percentage text */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="text-gray-300 font-medium">
                {Math.round(progressPercentage ?? 0)}%
              </span>
            </div>
          </div>

          {/* Points remaining */}
          <div className="text-center pt-2">
            <p className="text-gray-400">
              <span className="text-white font-semibold">
                {(pointsToNextBelt ?? 0).toLocaleString()}
              </span>
              {' points to '}
              <span className={nextBelt ? BELT_INFO[nextBelt].color : 'text-white'}>
                {nextBelt ? BELT_INFO[nextBelt].name : 'next belt'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
