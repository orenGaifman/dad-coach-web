'use client';

/**
 * WeeklyGoalProgressCard — Shows progress toward the current week's quality time goal.
 *
 * Displays:
 * - Progress bar showing hours completed vs target
 * - Current/target hours
 * - Belt level and program progress countdown
 * - Motivational message based on progress
 * - What user needs to do to reach next level
 * - First week indicator for new users
 * - Weekly goals history table
 *
 * Hebrew language throughout. Gamification focus.
 *
 * @see Backend: WeeklyGoalController.getCurrentWeeklyGoal()
 */

import { useState } from 'react';
import { useCurrentWeeklyGoal, useWeeklyGoalHistory } from '@/src/hooks/useWeeklyGoal';
import { useBeltProgression } from '@/src/hooks/useBeltProgression';
import type { BeltLevel } from '@/src/types/growth';
import type { WeeklyGoal } from '@/src/types/weeklyGoal';
import { classNames } from '@/src/utils/classNames';

/**
 * Belt display configuration with Hebrew names and colors.
 */
const BELT_CONFIG: Record<BeltLevel, { name: string; color: string; bgColor: string; textColor: string }> = {
  WHITE: { name: 'חגורה לבנה', color: 'text-gray-100', bgColor: 'bg-gray-100', textColor: 'text-gray-900' },
  YELLOW: { name: 'חגורה צהובה', color: 'text-yellow-400', bgColor: 'bg-yellow-400', textColor: 'text-gray-900' },
  ORANGE: { name: 'חגורה כתומה', color: 'text-orange-400', bgColor: 'bg-orange-400', textColor: 'text-gray-900' },
  GREEN: { name: 'חגורה ירוקה', color: 'text-green-400', bgColor: 'bg-green-400', textColor: 'text-gray-900' },
  BLUE: { name: 'חגורה כחולה', color: 'text-blue-400', bgColor: 'bg-blue-400', textColor: 'text-white' },
  PURPLE: { name: 'חגורה סגולה', color: 'text-purple-400', bgColor: 'bg-purple-400', textColor: 'text-white' },
  BROWN: { name: 'חגורה חומה', color: 'text-amber-700', bgColor: 'bg-amber-700', textColor: 'text-white' },
  BLACK: { name: 'חגורה שחורה', color: 'text-gray-900', bgColor: 'bg-gray-900', textColor: 'text-white' },
};

/**
 * Belt order for progression display.
 */
const BELT_ORDER: BeltLevel[] = ['WHITE', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'];

/**
 * Get the next belt level after the current one.
 */
function getNextBelt(currentBelt: BeltLevel): BeltLevel | null {
  const currentIndex = BELT_ORDER.indexOf(currentBelt);
  if (currentIndex === -1 || currentIndex >= BELT_ORDER.length - 1) {
    return null;
  }
  return BELT_ORDER[currentIndex + 1];
}

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
 * Get message explaining what user needs to do to reach next belt level.
 */
function getNextLevelMessage(
  currentBelt: BeltLevel,
  goalMet: boolean,
  progressPercentage: number,
  targetHours: number,
  actualHours: number
): string {
  const nextBelt = getNextBelt(currentBelt);
  
  if (!nextBelt) {
    return 'הגעת לדרגה הגבוהה ביותר! 🏆 אתה אבא מאסטר!';
  }
  
  const nextBeltConfig = BELT_CONFIG[nextBelt];
  const remainingHours = Math.max(0, targetHours - actualHours);
  
  if (goalMet) {
    return `🎯 השגת את היעד! בסוף השבוע תקבל ${nextBeltConfig.name}!`;
  }
  
  if (progressPercentage >= 80) {
    return `עוד ${remainingHours.toFixed(1)} שעות והשגת את היעד! ${nextBeltConfig.name} ממתינה לך! 🔥`;
  }
  
  return `כדי להגיע ל${nextBeltConfig.name} - סיים ${targetHours} שעות זמן איכות השבוע. נשארו ${remainingHours.toFixed(1)} שעות.`;
}

/**
 * Format date for display in Hebrew format.
 */
function formatWeekDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
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
  const { data: historyData, isLoading: historyLoading } = useWeeklyGoalHistory(10);
  const [showHistory, setShowHistory] = useState(false);

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
  const nextLevelMessage = getNextLevelMessage(startingBelt, goalMet, progressPercentage, targetHours, actualHours);

  // Determine if this is the first week (no history except current)
  const isFirstWeek = !historyData || historyData.length === 0 || 
    (historyData.length === 1 && historyData[0].status === 'ACTIVE');
  
  // Filter out current active goal from history for display
  const completedHistory = historyData?.filter(
    (goal: WeeklyGoal) => goal.status !== 'ACTIVE' && goal.status !== 'PENDING'
  ) ?? [];

  // Cap progress bar at 100% visually
  const progressBarWidth = Math.min(progressPercentage, 100);

  return (
    <div className={classNames('bg-[#1E293B] rounded-2xl p-6 border border-white/5', className)} dir="rtl">
      {/* First Week Badge */}
      {isFirstWeek && (
        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-lg p-3 mb-4 border border-blue-500/30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <div>
              <p className="text-white font-medium text-sm">ברוך הבא לשבוע הראשון!</p>
              <p className="text-gray-300 text-xs">זו תחילת המסע שלך ל-7 שבועות לחגורה שחורה</p>
            </div>
          </div>
        </div>
      )}

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
        <div className={classNames('px-3 py-1 rounded-full text-xs font-medium', beltConfig.bgColor, beltConfig.textColor)}>
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

      {/* Next Level Message */}
      <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-3 mb-4 border border-amber-500/20">
        <div className="flex items-start gap-2">
          <span className="text-lg">🥋</span>
          <p className="text-sm text-amber-200">{nextLevelMessage}</p>
        </div>
      </div>

      {/* Program Progress */}
      {!programCompleted && weeksToBlack > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
          <span>🥋</span>
          <span>עוד {weeksToBlack} שבועות לחגורה שחורה!</span>
        </div>
      )}
      
      {programCompleted && (
        <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 font-medium mb-4">
          <span>🏆</span>
          <span>מזל טוב! הגעת לחגורה שחורה!</span>
        </div>
      )}

      {/* History Toggle Button */}
      {completedHistory.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full py-2 px-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
          aria-expanded={showHistory}
          aria-controls="weekly-goals-history"
        >
          <span>📊</span>
          <span>{showHistory ? 'הסתר היסטוריה' : 'הצג היסטוריית יעדים'}</span>
          <span className={classNames('transition-transform', showHistory ? 'rotate-180' : '')}>▼</span>
        </button>
      )}

      {/* Weekly Goals History Table */}
      {showHistory && completedHistory.length > 0 && (
        <div id="weekly-goals-history" className="mt-4">
          <WeeklyGoalsHistoryTable history={completedHistory} isLoading={historyLoading} />
        </div>
      )}
    </div>
  );
}

/**
 * Props for WeeklyGoalsHistoryTable.
 */
interface WeeklyGoalsHistoryTableProps {
  history: WeeklyGoal[];
  isLoading: boolean;
}

/**
 * WeeklyGoalsHistoryTable component.
 * 
 * Displays a table of past weekly goals showing date, target, actual hours,
 * completion status, and belt earned.
 */
function WeeklyGoalsHistoryTable({ history, isLoading }: WeeklyGoalsHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-2" />
        <div className="h-8 bg-gray-700 rounded mb-2" />
        <div className="h-8 bg-gray-700 rounded" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        <p>אין היסטוריה עדיין</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800/70">
            <th scope="col" className="px-3 py-2 text-right text-gray-300 font-medium">שבוע</th>
            <th scope="col" className="px-3 py-2 text-center text-gray-300 font-medium">יעד</th>
            <th scope="col" className="px-3 py-2 text-center text-gray-300 font-medium">בוצע</th>
            <th scope="col" className="px-3 py-2 text-center text-gray-300 font-medium">סטטוס</th>
            <th scope="col" className="px-3 py-2 text-center text-gray-300 font-medium">חגורה</th>
          </tr>
        </thead>
        <tbody>
          {history.map((goal, index) => {
            const beltConfig = BELT_CONFIG[goal.endingBelt];
            const statusIcon = goal.goalMet ? '✅' : goal.status === 'MISSED' ? '❌' : '⏸️';
            const statusText = goal.goalMet ? 'הושלם' : goal.status === 'MISSED' ? 'לא הושלם' : 'בוטל';
            
            return (
              <tr 
                key={goal.id} 
                className={classNames(
                  'border-t border-gray-700/50',
                  index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
                )}
              >
                <td className="px-3 py-2 text-gray-300">
                  {formatWeekDate(goal.weekStartDate)}
                </td>
                <td className="px-3 py-2 text-center text-gray-300">
                  {goal.targetHours}ש׳
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={classNames(
                    goal.goalMet ? 'text-green-400' : 'text-gray-400'
                  )}>
                    {goal.actualHours.toFixed(1)}ש׳
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span 
                    className="flex items-center justify-center gap-1"
                    title={statusText}
                    aria-label={statusText}
                  >
                    {statusIcon}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span 
                    className={classNames(
                      'inline-block px-2 py-0.5 rounded-full text-xs',
                      beltConfig.bgColor,
                      beltConfig.textColor
                    )}
                    title={beltConfig.name}
                  >
                    {goal.beltPromoted ? '⬆️' : ''}
                    {beltConfig.name.replace('חגורה ', '')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
