'use client';

/**
 * WeeklyGoalProgressCard — Shows progress toward the current week's quality time goal.
 *
 * Displays:
 * - Progress bar showing hours completed vs target
 * - Current/target hours
 * - Belt level and program progress countdown
 * - Motivational message based on progress
 *
 * Hebrew language throughout. Gamification focus.
 *
 * @see Backend: WeeklyGoalController.getCurrentWeeklyGoal()
 */

import { useCurrentWeeklyGoal, useWeeklySummary } from '@/src/hooks/useWeeklyGoal';
import { useBeltProgression } from '@/src/hooks/useBeltProgression';
import type { BeltLevel } from '@/src/types/growth';

/**
 * Helper function to combine class names.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Belt display configuration with Hebrew names and colors.
 */
const BELT_CONFIG: Record<BeltLevel, { name: string; color: string; bgColor: string }> = {
  WHITE: { name: 'חגורה לבנה', color: 'text-gray-100', bgColor: 'bg-gray-100' },
  YELLOW: { name: 'חגורה צהובה', color: 'text-yellow-400', bgColor: 'bg-yellow-400' },
  ORANGE: { name: 'חגורה כתומה', color: 'text-orange-400', bgColor: 'bg-orange-400' },
  GREEN: { name: 'חגורה ירוקה', color: 'text-green-400', bgColor: 'bg-green-400' },
  BLUE: { name: 'חגורה כחולה', color: 'text-blue-400', bgColor: 'bg-blue-400' },
  PURPLE: { name: 'חגורה סגולה', color: 'text-purple-400', bgColor: 'bg-purple-400' },
  BROWN: { name: 'חגורה חומה', color: 'text-amber-700', bgColor: 'bg-amber-700' },
  BLACK: { name: 'חגורה שחורה', color: 'text-gray-900', bgColor: 'bg-gray-900' },
};

/**
 * Get motivational message based on progress.
 */
function getMotivationalMessage(progressPercent: number, goalMet: boolean): string {
  if (goalMet) {
    return 'כל הכבוד! 🎉 השגת את היעד השבועי!';
  }
  if (progressPercent >= 80) {
    return 'מעולה! קצת עוד ואתה שם! 💪';
  }
  if (progressPercent >= 50) {
    return 'אתה בדרך הנכונה! המשך כך! 🌟';
  }
  if (progressPercent >= 25) {
    return 'התחלה טובה! כל רגע עם הילדים נחשב! 👨‍👧';
  }
  if (progressPercent > 0) {
    return 'הצעד הראשון הוא הכי חשוב! ✨';
  }
  return 'הגיע הזמן להתחיל! הילדים מחכים! 🚀';
}

/**
 * Props for WeeklyGoalProgressCard.
 */
export interface WeeklyGoalProgressCardProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * WeeklyGoalProgressCard component.
 *
 * Shows the father's progress toward his weekly quality time goal,
 * including belt progression and motivational messages.
 */
export function WeeklyGoalProgressCard({ className }: WeeklyGoalProgressCardProps) {
  const { data: currentGoal, isLoading: goalLoading } = useCurrentWeeklyGoal();
  const { data: beltData, isLoading: beltLoading } = useBeltProgression();

  const isLoading = goalLoading || beltLoading;

  if (isLoading) {
    return (
      <div className={classNames('bg-[#1E293B] rounded-2xl p-6 border border-white/5 animate-pulse', className)}>
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-700 rounded w-full mb-2" />
        <div className="h-8 bg-gray-700 rounded w-full mb-4" />
        <div className="h-4 bg-gray-700 rounded w-2/3" />
      </div>
    );
  }

  // If no goal set yet
  if (!currentGoal) {
    return (
      <div className={classNames('bg-[#1E293B] rounded-2xl p-6 border border-white/5', className)}>
        <div className="text-center" dir="rtl">
          <span className="text-4xl mb-4 block">🎯</span>
          <h3 className="text-lg font-bold text-white mb-2">קבע יעד שבועי</h3>
          <p className="text-gray-400 text-sm mb-4">
            התחל את מסע 7 השבועות שלך לקראת חגורה שחורה!
          </p>
          <p className="text-gray-500 text-xs">
            דבר עם מאמן האבות בוואטסאפ כדי לקבוע את היעד השבועי שלך
          </p>
        </div>
      </div>
    );
  }

  const {
    targetHours,
    actualHours,
    progressPercentage,
    goalMet,
    startingBelt,
    scheduledCount,
    completedCount,
  } = currentGoal;

  const beltConfig = BELT_CONFIG[startingBelt];
  const weeksToBlack = beltData?.weeks_to_black_belt ?? 0;
  const programCompleted = beltData?.program_completed ?? false;
  const motivationalMessage = getMotivationalMessage(progressPercentage, goalMet);

  // Cap progress bar at 100% visually
  const progressBarWidth = Math.min(progressPercentage, 100);

  return (
    <div className={classNames('bg-[#1E293B] rounded-2xl p-6 border border-white/5', className)} dir="rtl">
      {/* Header with Belt */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="text-lg font-bold text-white">יעד השבוע</h3>
            <p className="text-xs text-gray-400">
              {targetHours} שעות זמן איכות
            </p>
          </div>
        </div>
        
        {/* Belt Badge */}
        <div className={classNames('px-3 py-1 rounded-full text-xs font-medium', beltConfig.bgColor, 'text-gray-900')}>
          {beltConfig.name}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        {/* Progress Text */}
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-2xl font-bold text-white">
            {actualHours.toFixed(1)}
            <span className="text-lg text-gray-400"> / {targetHours} שעות</span>
          </span>
          <span className={classNames(
            'text-sm font-medium',
            goalMet ? 'text-green-400' : progressPercentage >= 50 ? 'text-yellow-400' : 'text-gray-400'
          )}>
            {progressPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={classNames(
              'h-full rounded-full transition-all duration-500',
              goalMet ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            )}
            style={{ width: `${progressBarWidth}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{completedCount}</p>
          <p className="text-xs text-gray-400">פעילויות שהושלמו</p>
        </div>
        <div className="flex-1 bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{scheduledCount}</p>
          <p className="text-xs text-gray-400">פעילויות מתוכננות</p>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-3 mb-4">
        <p className="text-center text-white font-medium">{motivationalMessage}</p>
      </div>

      {/* Program Progress */}
      {!programCompleted && weeksToBlack > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <span>🥋</span>
          <span>עוד {weeksToBlack} שבועות לחגורה שחורה!</span>
        </div>
      )}
      
      {programCompleted && (
        <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 font-medium">
          <span>🏆</span>
          <span>מזל טוב! הגעת לחגורה שחורה!</span>
        </div>
      )}
    </div>
  );
}
