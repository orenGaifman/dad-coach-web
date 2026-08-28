'use client';

import Image from 'next/image';

import { useTranslations } from '@/src/i18n/useTranslations';

export interface SessionExpiredProps {
  onStartAgain: () => void;
}

export default function SessionExpired({ onStartAgain }: SessionExpiredProps) {
  const { t, isRTL } = useTranslations();

  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Image
        src="/illustrations/session-expired.webp"
        alt="Session expired"
        width={150}
        height={150}
        priority
      />
      <h1 className="text-xl font-semibold text-white">{t('onboarding.session.expired.title')}</h1>
      <p className="text-gray-300">
        {t('onboarding.session.expired.description')}
      </p>
      <button
        onClick={onStartAgain}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors"
      >
        {t('onboarding.session.expired.startAgain')}
      </button>
    </div>
  );
}
