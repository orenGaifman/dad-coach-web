'use client';

import { useState } from 'react';
import Image from 'next/image';

import { useTranslations } from '@/src/i18n/useTranslations';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivationScreenProps {
  /** WhatsApp deep link (e.g. https://wa.me/{number}?text=🚀 START). */
  deepLink: string;
  /** Fallback message the user can manually copy and send. */
  activationMessage: string;
  /** Whether the polling loop is active (waiting for WhatsApp connection). */
  isPolling: boolean;
  /** Transient polling error message (connection issues). */
  pollingError: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ActivationScreen — the final onboarding screen (O8).
 *
 * Displays the WhatsApp deep link button, step-by-step instructions,
 * a "copy message" fallback, and a polling status indicator while waiting
 * for the father to send their first WhatsApp message.
 *
 * @see Requirements 9.1, 9.2, 9.9
 */
export default function ActivationScreen({
  deepLink,
  activationMessage,
  isPolling,
  pollingError,
}: ActivationScreenProps) {
  const { t, isRTL } = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activationMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text if clipboard API unavailable
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero illustration */}
      <div className="w-full max-w-[200px]">
        <Image
          src="/illustrations/onboarding-activation.webp"
          alt="Father connecting with coach on WhatsApp"
          width={200}
          height={200}
          className="w-full aspect-square object-cover rounded-2xl"
          priority
        />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-white">
        {t('onboarding.activation.welcome')}
      </h2>

      {/* Description */}
      <p className="text-gray-300">
        {t('onboarding.activation.description')}
      </p>

      {/* WhatsApp deep link button */}
      <a
        href={deepLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open WhatsApp to start coaching conversation"
        className="w-full max-w-xs px-6 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2"
      >
        <span aria-hidden="true">💬</span>
        {t('onboarding.activation.openWhatsApp')}
      </a>

      {/* Copy message fallback */}
      <div className="w-full max-w-xs space-y-2">
        <p className="text-sm text-gray-400">{t('onboarding.activation.copyMessage')}</p>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Message copied to clipboard' : 'Copy activation message to clipboard'}
          className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white text-sm flex items-center justify-between gap-2 transition-colors"
        >
          <span className="truncate">{activationMessage}</span>
          <span aria-hidden="true" className="flex-shrink-0">
            {copied ? '✓' : '📋'}
          </span>
        </button>
        {copied && (
          <p className="text-xs text-green-400" role="status" aria-live="polite">
            {t('onboarding.activation.copied')}
          </p>
        )}
      </div>

      {/* Polling status indicator */}
      {isPolling && (
        <div className="flex items-center gap-2 text-sm text-gray-400" role="status" aria-live="polite">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
          </span>
          {t('onboarding.activation.waiting')}
        </div>
      )}

      {/* Polling error */}
      {pollingError && (
        <p className="text-sm text-amber-400" role="alert">
          {pollingError}
        </p>
      )}

      {/* Footer text */}
      <p className="text-gray-500 italic text-sm">
        {t('onboarding.activation.journeyBegins')}
      </p>
    </div>
  );
}
