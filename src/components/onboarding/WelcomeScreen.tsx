'use client';

import Image from 'next/image';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WelcomeScreenProps {
  inviterName?: string;
  onGetStarted: () => void;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Feature icons data
// ---------------------------------------------------------------------------

const FEATURE_ICONS = [
  { emoji: '🔗', label: 'Relationships' },
  { emoji: '🌱', label: 'Growth' },
  { emoji: '🏆', label: 'Achievements' },
  { emoji: '💛', label: 'Memories' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * WelcomeScreen — the first screen in the onboarding wizard (O2).
 *
 * Displays product value proposition, inviter name (if available),
 * feature icons, and a "Get Started" CTA button.
 *
 * @see Requirements 2.1, 2.2, 2.3
 */
export default function WelcomeScreen({
  inviterName,
  onGetStarted,
  isLoading = false,
}: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-4">
      {/* Hero illustration */}
      <div className="w-full">
        <Image
          src="/illustrations/onboarding-welcome.webp"
          alt="Father and child walking together on a starlit path"
          width={400}
          height={300}
          className="w-full aspect-[4/3] object-cover rounded-2xl"
          priority
        />
      </div>

      {/* Value proposition heading */}
      <h1 className="text-3xl font-bold text-white">
        Become the Father You Want to Be
      </h1>

      {/* Tagline */}
      <p className="text-lg text-gray-300">
        Small daily actions. Big lifelong impact.
      </p>

      {/* Feature icons grid */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {FEATURE_ICONS.map(({ emoji, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl" role="img" aria-label={label}>
              {emoji}
            </span>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Inviter attribution */}
      {inviterName && (
        <p className="text-sm text-gray-400">
          Invited by {inviterName}
        </p>
      )}

      {/* CTA button */}
      <button
        onClick={onGetStarted}
        disabled={isLoading}
        className="w-full max-w-xs px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
              aria-hidden="true"
            />
            Starting…
          </>
        ) : (
          'Start Your Journey →'
        )}
      </button>
    </div>
  );
}
