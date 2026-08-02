'use client';

import {
  WHATSAPP_PHONE_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
  getWhatsAppDeepLink,
} from '@/src/config/whatsapp';
import { analytics } from '@/src/services/analytics';

/**
 * Props for the WhatsAppBridge component.
 */
interface WhatsAppBridgeProps {
  /**
   * Override the default phone number from config.
   */
  phoneNumber?: string;
  /**
   * Pre-filled message to include in the WhatsApp chat.
   */
  message?: string;
  /**
   * Visual variant of the component.
   * - 'fab': Floating Action Button for mobile (default for now)
   * - 'link': Inline link style for sidebar (Phase 8 responsive implementation)
   */
  variant?: 'fab' | 'link';
  /**
   * Custom CSS class for additional styling.
   */
  className?: string;
}

/**
 * WhatsApp icon component.
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
 * WhatsAppBridge — persistent WhatsApp deep link component.
 *
 * Opens WhatsApp with the Dad Coach number. Designed to be subtle
 * and never compete with main content.
 *
 * Features:
 * - Configurable phone number via environment variable or prop
 * - Optional pre-filled message
 * - FAB variant (mobile) - currently implemented
 * - Link variant (desktop sidebar) - for Phase 8 responsive implementation
 * - Accessible with proper ARIA labels
 * - Subtle hover animation
 *
 * Per design.md:
 * - Renders as FAB on mobile, sidebar link on desktop (full responsive in Phase 8)
 * - Uses WhatsApp deep link format: https://wa.me/{phone_number}?text={pre_filled_message}
 *
 * Requirements covered:
 * - 1.5: Dashboard SHALL include a persistent, subtle WhatsApp bridge link
 */
export default function WhatsAppBridge({
  phoneNumber = WHATSAPP_PHONE_NUMBER,
  message = WHATSAPP_DEFAULT_MESSAGE,
  variant = 'fab',
  className = '',
}: WhatsAppBridgeProps) {
  // Don't render if no phone number is configured
  if (!phoneNumber) {
    return null;
  }

  const whatsappUrl = getWhatsAppDeepLink(phoneNumber, message);

  const handleClick = () => {
    analytics.whatsAppBridgeClicked({
      source: variant === 'link' ? 'sidebar' : 'fab',
    });
  };

  if (variant === 'link') {
    // Link variant for desktop sidebar (Phase 8)
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 rounded-lg px-3 py-2
          text-sm text-gray-400 transition-colors duration-150
          hover:bg-white/5 hover:text-white
          ${className}
        `}
        aria-label="Chat with Coach on WhatsApp"
      >
        <WhatsAppIcon className="h-5 w-5" />
        <span>Chat with Coach</span>
      </a>
    );
  }

  // FAB variant (default) - mobile floating action button
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`
        fixed bottom-20 right-4 z-40
        flex h-12 w-12 items-center justify-center
        rounded-full bg-[#25D366] shadow-lg
        transition-all duration-200 ease-out
        hover:scale-105 hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#0F172A]
        active:scale-95
        ${className}
      `}
      aria-label="Chat with Coach on WhatsApp"
    >
      <WhatsAppIcon className="h-6 w-6 text-white" />
    </a>
  );
}
