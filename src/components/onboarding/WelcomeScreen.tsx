'use client';

import Image from 'next/image';

import { useTranslations } from '@/src/i18n/useTranslations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WelcomeScreenProps {
  inviterName?: string;
  onGetStarted: () => void;
  isLoading?: boolean;
}

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
  const { t, isRTL } = useTranslations();

  // Feature icons data with translation keys
  const FEATURE_ICONS = [
    { emoji: '🔗', labelKey: 'onboarding.welcome.feature.relationships' as const },
    { emoji: '🌱', labelKey: 'onboarding.welcome.feature.growth' as const },
    { emoji: '🏆', labelKey: 'onboarding.welcome.feature.achievements' as const },
    { emoji: '💛', labelKey: 'onboarding.welcome.feature.memories' as const },
  ];

  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
        {t('onboarding.welcome.title')}
      </h1>

      {/* Tagline */}
      <p className="text-lg text-gray-300">
        {t('onboarding.welcome.tagline')}
      </p>

      {/* Feature icons grid */}
      <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
        {FEATURE_ICONS.map(({ emoji, labelKey }) => (
          <div key={labelKey} className="flex flex-col items-center gap-1">
            <span className="text-2xl" role="img" aria-label={t(labelKey)}>
              {emoji}
            </span>
            <span className="text-xs text-gray-400">{t(labelKey)}</span>
          </div>
        ))}
      </div>

      {/* Inviter attribution */}
      {inviterName && (
        <p className="text-sm text-gray-400">
          {t('onboarding.welcome.invitedBy')} {inviterName}
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
            {t('onboarding.welcome.starting')}
          </>
        ) : (
          t('onboarding.welcome.startButton')
        )}
      </button>
    </div>
  );
}
