'use client';

/**
 * BeltProgressHero — A prominent belt progression display for the dashboard.
 *
 * Shows the father's current belt with a large image, progress towards the next belt,
 * and motivational messaging about how many hours of quality time are needed to level up.
 *
 * Key features:
 * - Large belt image (mascot/animal)
 * - Progress bar towards next belt
 * - Hours/sessions remaining to next belt
 * - Motivational messaging in Hebrew
 *
 * Requirements: Belt Progression System
 */

import Image from 'next/image';
import { useBeltProgression } from '@/src/hooks/useBeltProgression';
import { useWorkspaceSummary } from '@/src/hooks/useWorkspaceSummary';
import type { BeltLevel } from '@/src/types/growth';

/**
 * Belt metadata including colors, names, and image paths.
 */
const BELT_CONFIG: Record<BeltLevel, {
  name: string;
  hebrewName: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  progressColor: string;
  imagePath: string;
  description: string;
}> = {
  WHITE: {
    name: 'White Belt',
    hebrewName: 'חגורה לבנה',
    color: 'text-gray-200',
    bgGradient: 'from-gray-800/40 to-gray-900/40',
    borderColor: 'border-gray-400/30',
    progressColor: 'bg-gray-400',
    imagePath: '/belts/white-belt.webp',
    description: 'מתחילים',
  },
  YELLOW: {
    name: 'Yellow Belt',
    hebrewName: 'חגורה צהובה',
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-900/30 to-amber-900/30',
    borderColor: 'border-yellow-500/30',
    progressColor: 'bg-yellow-500',
    imagePath: '/belts/yellow-belt.webp',
    description: 'לומדים',
  },
  ORANGE: {
    name: 'Orange Belt',
    hebrewName: 'חגורה כתומה',
    color: 'text-orange-400',
    bgGradient: 'from-orange-900/30 to-red-900/30',
    borderColor: 'border-orange-500/30',
    progressColor: 'bg-orange-500',
    imagePath: '/belts/orange-belt.webp',
    description: 'מתקדמים',
  },
  GREEN: {
    name: 'Green Belt',
    hebrewName: 'חגורה ירוקה',
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-900/30 to-green-900/30',
    borderColor: 'border-emerald-500/30',
    progressColor: 'bg-emerald-500',
    imagePath: '/belts/green-belt.webp',
    description: 'מחויבים',
  },
  BLUE: {
    name: 'Blue Belt',
    hebrewName: 'חגורה כחולה',
    color: 'text-blue-400',
    bgGradient: 'from-blue-900/30 to-indigo-900/30',
    borderColor: 'border-blue-500/30',
    progressColor: 'bg-blue-500',
    imagePath: '/belts/blue-belt.webp',
    description: 'מתקדמים',
  },
  PURPLE: {
    name: 'Purple Belt',
    hebrewName: 'חגורה סגולה',
    color: 'text-purple-400',
    bgGradient: 'from-purple-900/30 to-violet-900/30',
    borderColor: 'border-purple-500/30',
    progressColor: 'bg-purple-500',
    imagePath: '/belts/purple-belt.webp',
    description: 'מומחים',
  },
  BROWN: {
    name: 'Brown Belt',
    hebrewName: 'חגורה חומה',
    color: 'text-amber-600',
    bgGradient: 'from-amber-900/40 to-yellow-900/30',
    borderColor: 'border-amber-600/30',
    progressColor: 'bg-amber-700',
    imagePath: '/belts/brown-belt.webp',
    description: 'אמנים',
  },
  BLACK: {
    name: 'Black Belt',
    hebrewName: 'חגורה שחורה',
    color: 'text-gray-100',
    bgGradient: 'from-gray-900/50 to-black/50',
    borderColor: 'border-gray-300/30',
    progressColor: 'bg-gray-200',
    imagePath: '/belts/black-belt.webp',
    description: 'סנסאי אבא',
  },
};

/**
 * Belt order for determining next belt.
 */
const BELT_ORDER: BeltLevel[] = [
  'WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'
];

/**
 * Get the next belt level.
 */
function getNextBelt(currentBelt: BeltLevel): BeltLevel | null {
  const currentIndex = BELT_ORDER.indexOf(currentBelt);
  if (currentIndex === -1 || currentIndex >= BELT_ORDER.length - 1) {
    return null;
  }
  return BELT_ORDER[currentIndex + 1];
}

/**
 * Props for the BeltProgressHero component.
 */
export interface BeltProgressHeroProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * BeltProgressHero component.
 *
 * A prominent hero section showing belt progress and motivation.
 */
export function BeltProgressHero({ className }: BeltProgressHeroProps) {
  const { data: beltData, isLoading: beltLoading } = useBeltProgression();
  const { data: summaryData, isLoading: summaryLoading } = useWorkspaceSummary();

  const isLoading = beltLoading || summaryLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-[#1E293B] rounded-2xl p-6 border border-white/5 ${className}`}>
        <div className="animate-pulse flex items-center gap-6">
          <div className="w-28 h-28 bg-gray-700 rounded-2xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get current belt from either source
  const currentBelt = beltData?.current_belt ?? summaryData?.current_belt ?? 'WHITE';
  const beltConfig = BELT_CONFIG[currentBelt];
  const nextBelt = beltData?.next_belt ?? getNextBelt(currentBelt);
  const nextBeltConfig = nextBelt ? BELT_CONFIG[nextBelt] : null;
  
  // Progress calculation
  const progressPercentage = beltData?.progress_percentage_to_next_belt ?? 0;
  const pointsToNextBelt = beltData?.points_to_next_belt ?? 0;
  
  // Calculate hours/sessions remaining (assuming ~1 hour per quality time session)
  // In the system, points are roughly tied to quality time completions
  const hoursRemaining = Math.max(0, pointsToNextBelt);
  const weeksToBlackBelt = beltData?.weeks_to_black_belt ?? 0;
  const programCompleted = beltData?.program_completed ?? currentBelt === 'BLACK';

  return (
    <div
      className={`bg-gradient-to-br ${beltConfig.bgGradient} rounded-2xl p-5 border ${beltConfig.borderColor} ${className}`}
      role="region"
      aria-label="התקדמות החגורה"
      dir="rtl"
    >
      <div className="flex items-center gap-5">
        {/* Belt Image - Large and prominent */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${beltConfig.bgGradient} border-2 ${beltConfig.borderColor}`}>
            <Image
              src={beltConfig.imagePath}
              alt={beltConfig.hebrewName}
              fill
              className="object-contain p-2"
              priority
            />
          </div>
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-2xl ${beltConfig.progressColor} opacity-10 blur-xl`}></div>
        </div>

        {/* Belt Info & Progress */}
        <div className="flex-1 min-w-0">
          {/* Current Belt Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" aria-hidden="true">🥋</span>
            <h3 className={`text-xl font-bold ${beltConfig.color}`}>
              {beltConfig.hebrewName}
            </h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">{beltConfig.description}</p>

          {/* Progress to next belt */}
          {!programCompleted && nextBeltConfig ? (
            <>
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{beltConfig.hebrewName}</span>
                  <span>{nextBeltConfig.hebrewName}</span>
                </div>
                <div className="h-3 bg-[#0F172A] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${beltConfig.progressColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, progressPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Motivation Message */}
              <div className="bg-[#0F172A]/60 rounded-lg p-3">
                <p className="text-sm text-gray-300">
                  {hoursRemaining > 0 ? (
                    <>
                      <span className="text-teal-400 font-bold">עוד {hoursRemaining} זמני איכות</span>
                      {' '}עד ל{nextBeltConfig.hebrewName}! 💪
                    </>
                  ) : (
                    <>
                      <span className="text-teal-400 font-bold">כמעט שם!</span>
                      {' '}עוד קצת ותגיע ל{nextBeltConfig.hebrewName}! 🔥
                    </>
                  )}
                </p>
                {weeksToBlackBelt > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    🎯 {weeksToBlackBelt} שבועות עד להפיכה לסנסאי אבא
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Black belt achieved */
            <div className="bg-[#0F172A]/60 rounded-lg p-3">
              <p className="text-sm text-gray-300">
                <span className="text-yellow-400 font-bold">🏆 מזל טוב!</span>
                {' '}הגעת לדרגת סנסאי אבא - הדרגה הגבוהה ביותר!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                המשך לשמור על זמני איכות עם הילדים ✨
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next Belt Preview - Small teaser */}
      {!programCompleted && nextBeltConfig && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0 opacity-60">
              <Image
                src={nextBeltConfig.imagePath}
                alt={nextBeltConfig.hebrewName}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">החגורה הבאה שלך:</p>
              <p className={`text-sm font-medium ${nextBeltConfig.color}`}>
                {nextBeltConfig.hebrewName} - {nextBeltConfig.description}
              </p>
            </div>
            <div className="text-2xl opacity-50" aria-hidden="true">→</div>
          </div>
        </div>
      )}
    </div>
  );
}
