'use client';

/**
 * ActiveMissionCard — Displays the father's current active mission on the Dashboard.
 *
 * Shows mission details including:
 * - Mission illustration (category-based from /dashboard/mission-{type}.webp)
 * - Mission title
 * - Child name
 * - Days remaining badge (if applicable)
 * - Progress bar showing completed/total steps
 *
 * When no mission is active, displays an encouraging null state with
 * a call-to-action to check the Coaching section.
 *
 * The entire card is read-only and links to /coaching for mission details.
 *
 * Requirements: 1.1 (dashboard display)
 * @see design.md - Screen D1: Dashboard Home - Active Mission card section
 */

import Link from 'next/link';
import Image from 'next/image';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import type { ActiveMissionSummary, MissionCategory } from '@/src/types/workspace';
import { classNames } from '@/src/utils/classNames';

/**
 * Map mission category to image path.
 * Some categories fallback to similar category images.
 */
function getMissionImagePath(category: MissionCategory): string {
  const categoryToImage: Record<MissionCategory, string> = {
    QUALITY_TIME: '/dashboard/mission-quality-time.webp',
    LISTENING: '/dashboard/mission-listening.webp',
    PLAY: '/dashboard/mission-play.webp',
    CONVERSATION: '/dashboard/mission-conversation.webp',
    ROUTINE: '/dashboard/mission-routine.webp',
    TEACHING: '/dashboard/mission-routine.webp', // Fallback to routine
    BONDING: '/dashboard/mission-quality-time.webp', // Fallback to quality-time
  };
  return categoryToImage[category];
}

/**
 * Get a human-readable category label for accessibility.
 */
function getCategoryLabel(category: MissionCategory): string {
  const labels: Record<MissionCategory, string> = {
    QUALITY_TIME: 'Quality Time',
    LISTENING: 'Listening',
    PLAY: 'Play',
    CONVERSATION: 'Conversation',
    ROUTINE: 'Routine',
    TEACHING: 'Teaching',
    BONDING: 'Bonding',
  };
  return labels[category];
}

/**
 * Props for the ActiveMissionCard component.
 */
export interface ActiveMissionCardProps {
  /** The active mission (null shows empty state) */
  mission: ActiveMissionSummary | null;
  /** Additional CSS classes for the card container */
  className?: string;
}

/**
 * ActiveMissionCard component.
 *
 * A card showing the father's current active mission with progress tracking.
 * Clicking the card navigates to the Coaching tab (/coaching) for more details.
 *
 * When no mission is active, displays an encouraging empty state prompting
 * the father to check the Coaching section for their next adventure.
 *
 * @example
 * // With active mission
 * <ActiveMissionCard
 *   mission={{
 *     mission_id: '123',
 *     title: 'Quality Time Challenge',
 *     category: 'QUALITY_TIME',
 *     child_name: 'Noah',
 *     days_remaining: 2,
 *     completed_steps: 2,
 *     total_steps: 5
 *   }}
 * />
 *
 * @example
 * // No active mission (null state)
 * <ActiveMissionCard mission={null} />
 *
 * @example
 * // With custom styling
 * <ActiveMissionCard mission={mission} className="mt-4" />
 */
export function ActiveMissionCard({ mission, className }: ActiveMissionCardProps) {
  // Null state - no active mission
  if (!mission) {
    return (
      <Link
        href="/coaching"
        className={classNames(
          'block bg-[#1E293B] rounded-2xl p-4 border border-white/5',
          'hover:bg-[#2D3B4F] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
          className
        )}
        aria-label="No active mission. Go to Coaching for your next adventure"
      >
        <div className="text-center py-4">
          <span className="text-4xl mb-3 block" aria-hidden="true">
            🎯
          </span>
          <p className="text-white font-medium">No active mission</p>
          <p className="text-sm text-gray-400 mt-1">
            Check Coaching for your next adventure
          </p>
        </div>
      </Link>
    );
  }

  // Calculate progress percentage
  const progress =
    mission.total_steps > 0
      ? (mission.completed_steps / mission.total_steps) * 100
      : 0;

  return (
    <Link
      href="/coaching"
      className={classNames(
        'block bg-[#1E293B] rounded-2xl p-4 border border-white/5',
        'hover:bg-[#2D3B4F] transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
        className
      )}
      aria-label={`Active mission: ${mission.title} with ${mission.child_name}. ${mission.completed_steps} of ${mission.total_steps} steps completed.${mission.days_remaining !== null ? ` ${mission.days_remaining} days remaining.` : ''}`}
    >
      {/* Header row: label + days remaining badge */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">Active Mission</p>
        {mission.days_remaining !== null && (
          <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-1 rounded-full">
            {mission.days_remaining} {mission.days_remaining === 1 ? 'day' : 'days'} left
          </span>
        )}
      </div>

      {/* Mission content row */}
      <div className="flex items-start gap-4">
        {/* Mission illustration */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={getMissionImagePath(mission.category)}
            alt={`${getCategoryLabel(mission.category)} mission`}
            width={64}
            height={64}
            className="object-contain rounded-lg"
          />
        </div>

        {/* Mission details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="font-semibold text-white truncate">{mission.title}</p>

          {/* Child name */}
          <p className="text-sm text-gray-400 mt-0.5">with {mission.child_name}</p>

          {/* Progress bar */}
          <div className="mt-3">
            <ProgressBar
              value={progress}
              color="bg-teal-500"
              height="sm"
              label={`Mission progress: ${mission.completed_steps} of ${mission.total_steps} steps`}
            />
          </div>

          {/* Progress text */}
          <p className="text-xs text-gray-500 mt-1">
            {mission.completed_steps}/{mission.total_steps} completed
          </p>
        </div>
      </div>
    </Link>
  );
}
