'use client';

/**
 * Account Page — Screen P5
 *
 * MVP implementation showing account status only.
 * Pause and delete features are documented as future enhancements.
 *
 * @see Task 6.7: Account page (MVP display status only)
 */

import Link from 'next/link';
import { useProfile } from '@/src/hooks/useProfile';
import { SkeletonCard } from '@/src/components/common/SkeletonScreen';
import { ErrorState } from '@/src/components/common/ErrorState';

/**
 * Format date to readable string.
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Status badge component.
 */
function StatusBadge({ status }: { status: 'active' | 'paused' }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
      <span className="w-2 h-2 rounded-full bg-amber-400" />
      Paused
    </span>
  );
}

/**
 * Info row component for displaying key-value pairs.
 */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-b-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const { data: profile, isLoading, error, refetch } = useProfile();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4 flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Back to Profile</span>
              ←
            </Link>
            <h1 className="text-xl font-semibold text-white">Account</h1>
          </header>
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0F172A] pb-24">
        <div className="max-w-[512px] mx-auto px-4">
          <header className="py-4 flex items-center gap-3">
            <Link
              href="/profile"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Back to Profile</span>
              ←
            </Link>
            <h1 className="text-xl font-semibold text-white">Account</h1>
          </header>
          <ErrorState
            type="error"
            title="Couldn't load account"
            description="Something went wrong while fetching your account information."
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
        <header className="py-4 flex items-center gap-3">
          <Link
            href="/profile"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
          >
            <span className="sr-only">Back to Profile</span>
            ←
          </Link>
          <h1 className="text-xl font-semibold text-white">Account</h1>
        </header>

        {/* Account Status Card */}
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Account Status</h2>
            <StatusBadge status="active" />
          </div>

          <div className="space-y-0">
            <InfoRow label="Member since" value={formatDate(profile.activated_at)} />
            <InfoRow
              label="Days with Dad Coach"
              value={`${profile.days_since_activation} days`}
            />
            <InfoRow label="Coaching phase" value={formatPhase(profile.coaching_phase)} />
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-6 bg-[#1E293B]/50 rounded-2xl p-5 border border-white/5">
          <h3 className="text-gray-400 font-medium mb-3">Coming Soon</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
                ⏸
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pause Coaching</p>
                <p className="text-gray-600 text-xs">
                  Take a break without losing progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
                📦
              </div>
              <div>
                <p className="text-gray-400 text-sm">Export Data</p>
                <p className="text-gray-600 text-xs">
                  Download your coaching history
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center">
                🗑
              </div>
              <div>
                <p className="text-gray-400 text-sm">Delete Account</p>
                <p className="text-gray-600 text-xs">
                  Permanently remove your data
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help with your account?{' '}
            <a
              href="https://wa.me/your-support-number"
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Contact support via WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Format coaching phase for display.
 */
function formatPhase(phase: string): string {
  const phaseNames: Record<string, string> = {
    ONBOARDING: 'Onboarding',
    EARLY_ENGAGEMENT: 'Early Engagement',
    ACTIVE_COACHING: 'Active Coaching',
    ESTABLISHED: 'Established',
    MASTERY: 'Mastery',
  };
  return phaseNames[phase] || phase;
}
