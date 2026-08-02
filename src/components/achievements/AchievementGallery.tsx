'use client';

/**
 * AchievementGallery — Full achievements display grid.
 *
 * Renders all achievements grouped by category in a 3-column grid.
 * Earned achievements show with full opacity and a checkmark.
 * Unearned achievements are shown as available (opacity-40), NOT locked.
 * Highlights the "next achievable" achievement.
 *
 * Features:
 * - Achievements grouped by category
 * - 3-column grid layout
 * - Earned achievements at full opacity with checkmark
 * - Unearned achievements at reduced opacity (available, not locked)
 * - "Next achievable" highlight
 * - Summary stats (earned/total)
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5 (Achievements Gallery)
 * @see design.md - Screen G2: Achievements
 */

import type { Achievement, AchievementCategory, NextAchievable } from '@/src/types/growth';
import { AchievementCard } from './AchievementCard';

/**
 * Category display metadata.
 */
const CATEGORY_INFO: Record<AchievementCategory, { 
  name: string; 
  icon: string;
}> = {
  MISSIONS: { name: 'Missions', icon: '🎯' },
  CONSISTENCY: { name: 'Consistency', icon: '🔥' },
  GROWTH: { name: 'Growth', icon: '🌱' },
  CONVERSATIONS: { name: 'Conversations', icon: '💬' },
  GOALS: { name: 'Goals', icon: '📈' },
  SPECIAL: { name: 'Special', icon: '⭐' },
};

/**
 * Category display order.
 */
const CATEGORY_ORDER: AchievementCategory[] = [
  'MISSIONS',
  'CONSISTENCY',
  'GROWTH',
  'CONVERSATIONS',
  'GOALS',
  'SPECIAL',
];

/**
 * Helper function to combine class names, filtering out falsy values.
 */
function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Props for the AchievementGallery component.
 */
export interface AchievementGalleryProps {
  /** All achievements (earned and unearned) */
  achievements: Achievement[];
  /** Total achievements available */
  totalAvailable: number;
  /** Total achievements earned */
  totalEarned: number;
  /** The next achievement closest to earning (optional) */
  nextAchievable?: NextAchievable | null;
  /** Whether to show grouped by category (default: true) */
  groupByCategory?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Click handler for individual achievements */
  onAchievementClick?: (achievement: Achievement) => void;
}

/**
 * AchievementGallery component.
 *
 * Displays all achievements in a grid, grouped by category.
 * Shows earned/total count and highlights the next achievable.
 *
 * @example
 * <AchievementGallery
 *   achievements={achievements}
 *   totalAvailable={15}
 *   totalEarned={8}
 *   nextAchievable={nextAchievable}
 * />
 */
export function AchievementGallery({
  achievements,
  totalAvailable,
  totalEarned,
  nextAchievable,
  groupByCategory = true,
  className,
  onAchievementClick,
}: AchievementGalleryProps) {
  // Group achievements by category
  const achievementsByCategory = achievements.reduce<Record<AchievementCategory, Achievement[]>>(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<AchievementCategory, Achievement[]>
  );

  // Calculate completion percentage
  const completionPercentage = totalAvailable > 0 
    ? Math.round((totalEarned / totalAvailable) * 100) 
    : 0;

  return (
    <div
      className={classNames('space-y-6', className)}
      role="region"
      aria-label={`Achievements gallery: ${totalEarned} of ${totalAvailable} earned`}
    >
      {/* Summary header */}
      <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-lg">
            Your Achievements
          </h2>
          <span className="text-emerald-400 font-bold">
            {totalEarned}/{totalAvailable}
          </span>
        </div>
        
        {/* Progress bar */}
        <div 
          className="h-2 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Achievement progress: ${completionPercentage}%`}
        >
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        <p className="text-gray-400 text-sm mt-2">
          {completionPercentage}% complete
        </p>
      </div>

      {/* Next Achievable highlight */}
      {nextAchievable && (
        <div className="bg-[#1E293B] rounded-2xl p-4 border border-amber-400/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400" aria-hidden="true">⭐</span>
            <h3 className="text-amber-400 font-semibold text-sm uppercase tracking-wide">
              Next Up
            </h3>
          </div>
          
          {/* Find the full achievement data */}
          {(() => {
            const fullAchievement = achievements.find(
              a => a.achievement_id === nextAchievable.achievement_id
            );
            
            if (fullAchievement) {
              return (
                <AchievementCard
                  achievement={fullAchievement}
                  isNextAchievable
                  onClick={onAchievementClick ? () => onAchievementClick(fullAchievement) : undefined}
                />
              );
            }
            
            // Fallback if full achievement not found
            return (
              <div className="flex items-center gap-4">
                <div className="text-3xl">{CATEGORY_INFO[achievements[0]?.category || 'SPECIAL'].icon}</div>
                <div>
                  <h4 className="text-white font-semibold">{nextAchievable.name}</h4>
                  <p className="text-gray-400 text-sm">{nextAchievable.description}</p>
                  <p className="text-amber-400 text-sm mt-1">
                    {nextAchievable.progress_percentage}% complete
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Achievements grid */}
      {groupByCategory ? (
        // Grouped by category
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const categoryAchievements = achievementsByCategory[category];
            if (!categoryAchievements || categoryAchievements.length === 0) {
              return null;
            }

            const earnedCount = categoryAchievements.filter(a => a.earned_at !== null).length;
            const categoryInfo = CATEGORY_INFO[category];

            return (
              <div key={category}>
                {/* Category header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">{categoryInfo.icon}</span>
                    <h3 className="text-white font-semibold">
                      {categoryInfo.name}
                    </h3>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {earnedCount}/{categoryAchievements.length}
                  </span>
                </div>
                
                {/* Achievement grid */}
                <div 
                  className="grid grid-cols-3 gap-3"
                  role="list"
                  aria-label={`${categoryInfo.name} achievements`}
                >
                  {categoryAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.achievement_id}
                      achievement={achievement}
                      isNextAchievable={nextAchievable?.achievement_id === achievement.achievement_id}
                      compact
                      onClick={onAchievementClick ? () => onAchievementClick(achievement) : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Flat grid (no grouping)
        <div 
          className="grid grid-cols-3 gap-3"
          role="list"
          aria-label="All achievements"
        >
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.achievement_id}
              achievement={achievement}
              isNextAchievable={nextAchievable?.achievement_id === achievement.achievement_id}
              compact
              onClick={onAchievementClick ? () => onAchievementClick(achievement) : undefined}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {achievements.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            No achievements available yet. Keep engaging to unlock achievements!
          </p>
        </div>
      )}
    </div>
  );
}
