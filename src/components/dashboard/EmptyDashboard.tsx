'use client';

/**
 * EmptyDashboard — First-visit empty state for the Dashboard.
 *
 * Displays a warm, inviting welcome message explaining that coaching happens
 * on WhatsApp and this dashboard tracks progress. Shown when a father has
 * never completed a coaching session.
 *
 * Features:
 * - Coach greeting image for personal connection
 * - Main illustration for visual appeal
 * - Warm, supportive headline and copy
 * - Primary CTA to open WhatsApp
 * - Optional secondary "Learn how it works" link
 * - Full localization support (Hebrew/English)
 *
 * Requirements: 1.4 - IF the father has never completed a coaching session,
 * THEN the dashboard SHALL show a warm empty state explaining the coaching
 * model rather than displaying zeros.
 *
 * @see design.md - Screen D1: Empty Dashboard (first visit)
 */

import Image from 'next/image';
import {
  WHATSAPP_PHONE_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
  getWhatsAppDeepLink,
} from '@/src/config/whatsapp';
import { useTranslations } from '@/src/i18n';
import { classNames } from '@/src/utils/classNames';

/**
 * Props for the EmptyDashboard component.
 */
export interface EmptyDashboardProps {
  /** Optional callback for the WhatsApp button click */
  onOpenWhatsApp?: () => void;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * WhatsApp icon component for the CTA button.
 */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * EmptyDashboard component.
 *
 * A warm, inviting empty state shown to first-time visitors who haven't
 * logged any coaching activities yet. Guides them to start their journey
 * on WhatsApp.
 *
 * Design layout (centered, vertical):
 * - Coach greeting image (100px) - personal touch
 * - Empty state illustration (200px) - visual context
 * - Headline: "Your journey begins on WhatsApp"
 * - Supporting text: Explains dashboard purpose
 * - Primary CTA: "Open WhatsApp" button (teal accent)
 * - Optional: "Learn how it works" link
 *
 * Tone of Voice: Warm, supportive, encouraging. Like a trusted coach
 * who has their back.
 *
 * @example
 * // Basic usage
 * <EmptyDashboard />
 *
 * @example
 * // With WhatsApp callback
 * <EmptyDashboard
 *   onOpenWhatsApp={() => {
 *     analytics.track('whatsapp_opened_from_empty_dashboard');
 *   }}
 * />
 *
 * @example
 * // With custom styling
 * <EmptyDashboard className="min-h-[70vh]" />
 */
export function EmptyDashboard({ onOpenWhatsApp, className }: EmptyDashboardProps) {
  const whatsappUrl = getWhatsAppDeepLink(
    WHATSAPP_PHONE_NUMBER,
    WHATSAPP_DEFAULT_MESSAGE
  );
  const { t, isRTL } = useTranslations();

  /**
   * Handle WhatsApp button click.
   * Calls the onOpenWhatsApp callback if provided, then opens WhatsApp.
   */
  const handleWhatsAppClick = () => {
    // Call the optional callback for analytics/tracking
    if (onOpenWhatsApp) {
      onOpenWhatsApp();
    }

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center text-center',
        'min-h-[60vh] px-4 py-8',
        className
      )}
      role="region"
      aria-label={t('dashboard.empty.aria.welcome')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Coach greeting image - personal connection */}
      <div className="mb-4">
        <Image
          src="/dashboard/coach-greeting.webp"
          alt="Your coach welcoming you"
          width={100}
          height={100}
          className="mx-auto"
          priority
        />
      </div>

      {/* Main empty state illustration */}
      <div className="mb-6">
        <Image
          src="/dashboard/dashboard-empty.webp"
          alt=""
          width={200}
          height={200}
          className="mx-auto"
          priority={false}
        />
      </div>

      {/* Headline - warm, inviting */}
      <h2 className="text-lg font-semibold text-white mb-2">
        {t('dashboard.empty.title')}
      </h2>

      {/* Supporting text - explains the model */}
      <p className="text-gray-400 text-sm max-w-xs mb-8">
        {t('dashboard.empty.description')}
      </p>

      {/* Primary CTA - Open WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className={classNames(
          'inline-flex items-center justify-center gap-2',
          'px-6 py-3 rounded-xl',
          'bg-teal-500 hover:bg-teal-600',
          'text-white font-medium',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]'
        )}
        aria-label={t('dashboard.empty.aria.cta')}
      >
        <WhatsAppIcon className="h-5 w-5" />
        {t('dashboard.empty.cta')}
        <span aria-hidden="true">{isRTL ? '←' : '→'}</span>
      </button>

      {/* Secondary link - Learn how it works */}
      <p className="mt-4 text-xs text-gray-500">
        <a
          href="/how-it-works"
          className={classNames(
            'text-gray-400 hover:text-white',
            'underline underline-offset-2',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0F172A] rounded'
          )}
        >
          {t('dashboard.empty.howItWorks')}
        </a>
      </p>
    </div>
  );
}
