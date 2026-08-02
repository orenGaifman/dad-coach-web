'use client';

/**
 * Profile Overview Page — Screen P1
 *
 * Read-only display of the father's profile information including:
 * - Name, phone (masked), email
 * - Timezone, language
 * - Coaching style and preferred coaching time
 * - Coaching phase and days since activation
 *
 * @see Requirement 13.1: Profile view displays name, phone, timezone, etc.
 * @see design.md - Screen P1: Profile Overview
 */

import Link from 'next/link';
import { useProfile } from '@/src/hooks/useProfile';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';
import type {
  CoachingStyle,
  CoachingPhase,
  NotificationFrequency,
  SupportedLanguage,
} from '@/src/types/workspace';

/**
 * Mask phone number for display (show only last 4 digits).
 * Format: +1****1234
 */
function maskPhoneNumber(phone: string): string {
  if (phone.length <= 4) return phone;
  const lastFour = phone.slice(-4);
  const prefix = phone.slice(0, phone.length - 4);
  // Replace all digits in prefix with asterisks
  const masked = prefix.replace(/\d/g, '*');
  return masked + lastFour;
}

/**
 * Format coaching style for display.
 */
function formatCoachingStyle(style: CoachingStyle): string {
  const styleLabels: Record<CoachingStyle, string> = {
    GENTLE: 'Gentle',
    BALANCED: 'Balanced',
    DIRECT: 'Direct',
    MOTIVATIONAL: 'Motivational',
  };
  return styleLabels[style] ?? style;
}

/**
 * Format coaching phase for display.
 */
function formatCoachingPhase(phase: CoachingPhase): string {
  const phaseLabels: Record<CoachingPhase, string> = {
    ONBOARDING: 'Getting Started',
    EARLY_ENGAGEMENT: 'Early Engagement',
    ACTIVE_COACHING: 'Active Coaching',
    ESTABLISHED: 'Established',
    MASTERY: 'Mastery',
  };
  return phaseLabels[phase] ?? phase;
}

/**
 * Format notification frequency for display.
 */
function formatNotificationFrequency(freq: NotificationFrequency): string {
  const freqLabels: Record<NotificationFrequency, string> = {
    DAILY: 'Daily',
    EVERY_OTHER_DAY: 'Every Other Day',
    TWICE_WEEKLY: 'Twice Weekly',
  };
  return freqLabels[freq] ?? freq;
}

/**
 * Format language for display.
 */
function formatLanguage(lang: SupportedLanguage): string {
  const langLabels: Record<SupportedLanguage, string> = {
    he: 'עברית (Hebrew)',
    en: 'English',
  };
  return langLabels[lang] ?? lang;
}

/**
 * Format time string for display.
 * Converts "HH:MM:SS" to "HH:MM AM/PM"
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Format timezone for display.
 * Converts "Asia/Jerusalem" to "Asia/Jerusalem (UTC+2)"
 */
function formatTimezone(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    return `${tz} (${tzName})`;
  } catch {
    return tz;
  }
}

/**
 * Profile field row component.
 */
function ProfileField({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center py-3 ${className}`}>
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}

/**
 * Profile section card component.
 */
function ProfileSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-white font-semibold">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-teal-400 text-sm hover:text-teal-300 transition-colors"
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="px-4 divide-y divide-white/5">{children}</div>
    </div>
  );
}

/**
 * Loading skeleton for Profile page.
 */
function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonCard className="h-48" />
      <SkeletonCard className="h-36" />
      <SkeletonCard className="h-36" />
    </div>
  );
}

export default function ProfilePage() {
  const { data, isLoading, error, refetch } = useProfile();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </header>
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </header>
          <ErrorState
            type="error"
            title="Couldn't load your profile"
            description="Something went wrong while fetching your profile data."
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] pb-24">
      <div className="max-w-[512px] mx-auto px-4">
        {/* Header */}
        <header className="py-4">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            {data.days_since_activation} days since you started
          </p>
        </header>

        <div className="space-y-4">
          {/* Personal Information */}
          <ProfileSection
            title="Personal Information"
            action={{ label: 'Edit', href: '/profile/edit' }}
          >
            <ProfileField label="Name" value={data.display_name} />
            <ProfileField label="Phone" value={maskPhoneNumber(data.phone_number)} />
            {data.email && <ProfileField label="Email" value={data.email} />}
            <ProfileField label="Timezone" value={formatTimezone(data.timezone)} />
            <ProfileField label="Language" value={formatLanguage(data.language)} />
          </ProfileSection>

          {/* Coaching Settings */}
          <ProfileSection
            title="Coaching Settings"
            action={{ label: 'Edit', href: '/profile/preferences' }}
          >
            <ProfileField label="Style" value={formatCoachingStyle(data.coaching_style)} />
            <ProfileField
              label="Preferred Time"
              value={formatTime(data.preferred_coaching_time)}
            />
            <ProfileField
              label="Notifications"
              value={formatNotificationFrequency(data.notification_frequency)}
            />
            <ProfileField
              label="Quiet Hours"
              value={`${formatTime(data.quiet_hours_start)} - ${formatTime(data.quiet_hours_end)}`}
            />
          </ProfileSection>

          {/* Journey Status */}
          <ProfileSection title="Your Journey">
            <ProfileField label="Phase" value={formatCoachingPhase(data.coaching_phase)} />
            <ProfileField
              label="Started"
              value={new Date(data.activated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
            <ProfileField
              label="Days Active"
              value={`${data.days_since_activation} days`}
            />
          </ProfileSection>

          {/* Quick Links */}
          <div className="space-y-2 pt-2">
            <Link
              href="/profile/children"
              className="block bg-[#1E293B] rounded-xl border border-white/5 px-4 py-3 text-white hover:bg-[#2D3B4D] transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>Manage Children</span>
                <span className="text-gray-400">→</span>
              </div>
            </Link>
            <Link
              href="/profile/account"
              className="block bg-[#1E293B] rounded-xl border border-white/5 px-4 py-3 text-white hover:bg-[#2D3B4D] transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>Account Settings</span>
                <span className="text-gray-400">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
