'use client';

import Image from 'next/image';

import { useTranslations } from '@/src/i18n/useTranslations';

export default function InvitationRevoked() {
  const { t, isRTL } = useTranslations();

  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Image
        src="/illustrations/error-state.webp"
        alt="Invitation revoked"
        width={150}
        height={150}
        priority
      />
      <h1 className="text-xl font-semibold text-white">{t('onboarding.invitationRevoked.title')}</h1>
      <p className="text-gray-300">
        {t('onboarding.invitationRevoked.description')}
      </p>
    </div>
  );
}
