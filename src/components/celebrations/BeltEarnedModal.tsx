'use client';

/**
 * BeltEarnedModal — Celebration modal for belt level advancement.
 *
 * Displays a congratulatory modal when the user earns a new belt level.
 * Features:
 * - Bilingual support (English and Hebrew)
 * - RTL support for Hebrew
 * - Belt-colored styling
 * - Celebratory confetti animation
 * - Accessible with ARIA attributes
 * - Focus management
 * - Escape key and button dismiss
 *
 * Belt System (SACRED):
 * - WHITE (לבנה): 0-2 Quality Times
 * - YELLOW (צהובה): 3-9 Quality Times
 * - ORANGE (כתומה): 10-24 Quality Times
 * - GREEN (ירוקה): 25-49 Quality Times
 * - BLUE (כחולה): 50-99 Quality Times
 * - BROWN (חומה): 100-199 Quality Times
 * - BLACK (שחורה): 200+ Quality Times
 *
 * @see Requirements 13.3, 13.6: Belt celebration events
 * @see Task 23.1: Create BeltEarnedModal component
 */

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useLanguage, useDirection } from '@/src/providers/LanguageProvider';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';
import type { BeltLevel } from '@/src/types/growth';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BeltEarnedModalProps {
  /** The new belt level earned */
  newBelt: BeltLevel;
  /** Callback when the modal is dismissed */
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Belt Display Configuration
// ---------------------------------------------------------------------------

/**
 * Belt display names in English and Hebrew.
 * Hebrew uses feminine form as "חגורה" (belt) is feminine.
 */
const BELT_NAMES: Record<BeltLevel, { en: string; he: string }> = {
  WHITE: { en: 'White Belt', he: 'חגורה לבנה' },
  YELLOW: { en: 'Yellow Belt', he: 'חגורה צהובה' },
  ORANGE: { en: 'Orange Belt', he: 'חגורה כתומה' },
  GREEN: { en: 'Green Belt', he: 'חגורה ירוקה' },
  BLUE: { en: 'Blue Belt', he: 'חגורה כחולה' },
  PURPLE: { en: 'Purple Belt', he: 'חגורה סגולה' },
  BROWN: { en: 'Brown Belt', he: 'חגורה חומה' },
  BLACK: { en: 'Black Belt', he: 'חגורה שחורה' },
};

/**
 * Congratulations message in English and Hebrew.
 */
const CONGRATULATIONS: { en: string; he: string } = {
  en: 'Congratulations!',
  he: 'כל הכבוד!',
};

/**
 * You earned message in English and Hebrew.
 */
const YOU_EARNED: { en: string; he: string } = {
  en: 'You earned the',
  he: 'זכית ב',
};

/**
 * Dismiss button text in English and Hebrew.
 */
const DISMISS_TEXT: { en: string; he: string } = {
  en: 'Awesome! →',
  he: '← מעולה!',
};

/**
 * Encouragement messages for each belt level.
 */
const ENCOURAGEMENT: Record<BeltLevel, { en: string; he: string }> = {
  WHITE: {
    en: 'Every journey begins with a single step. You\'re on your way!',
    he: 'כל מסע מתחיל בצעד אחד. אתה בדרך!',
  },
  YELLOW: {
    en: 'You\'re building great habits. Keep going!',
    he: 'אתה בונה הרגלים נהדרים. המשך כך!',
  },
  ORANGE: {
    en: 'Your dedication is inspiring. Your kids notice!',
    he: 'המסירות שלך מעוררת השראה. הילדים שלך שמים לב!',
  },
  GREEN: {
    en: 'Halfway to mastery! Your commitment is remarkable.',
    he: 'באמצע הדרך לשליטה! המחויבות שלך יוצאת מהכלל.',
  },
  BLUE: {
    en: 'You\'re becoming an expert dad. Amazing progress!',
    he: 'אתה הופך לאבא מומחה. התקדמות מדהימה!',
  },
  PURPLE: {
    en: 'Elite status achieved! Your family is lucky to have you.',
    he: 'השגת מעמד עילית! המשפחה שלך בת מזל שיש להם אותך.',
  },
  BROWN: {
    en: 'Master level approaching. You\'re an inspiration!',
    he: 'מתקרב לרמת מאסטר. אתה השראה!',
  },
  BLACK: {
    en: 'Dad Sensei! You\'ve reached the highest level. Legendary!',
    he: 'אבא סנסיי! הגעת לרמה הגבוהה ביותר. אגדי!',
  },
};

/**
 * Belt text colors for Tailwind CSS.
 */
const BELT_TEXT_COLORS: Record<BeltLevel, string> = {
  WHITE: 'text-gray-200',
  YELLOW: 'text-yellow-400',
  ORANGE: 'text-orange-400',
  GREEN: 'text-emerald-400',
  BLUE: 'text-blue-400',
  PURPLE: 'text-purple-400',
  BROWN: 'text-amber-700',
  BLACK: 'text-gray-100',
};

/**
 * Belt glow colors for celebration effect.
 */
const BELT_GLOW_COLORS: Record<BeltLevel, string> = {
  WHITE: 'shadow-gray-200/50',
  YELLOW: 'shadow-yellow-400/50',
  ORANGE: 'shadow-orange-400/50',
  GREEN: 'shadow-emerald-400/50',
  BLUE: 'shadow-blue-400/50',
  PURPLE: 'shadow-purple-400/50',
  BROWN: 'shadow-amber-700/50',
  BLACK: 'shadow-gray-400/50',
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get the belt image path.
 */
function getBeltImagePath(belt: BeltLevel): string {
  return `/belts/${belt.toLowerCase()}-belt.webp`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * BeltEarnedModal component.
 *
 * A celebration modal displayed when the user earns a new belt level.
 * Supports both English and Hebrew with proper RTL handling.
 *
 * @example
 * <BeltEarnedModal
 *   newBelt="GREEN"
 *   onDismiss={() => setBeltCelebration(null)}
 * />
 */
export function BeltEarnedModal({ newBelt, onDismiss }: BeltEarnedModalProps) {
  const { language } = useLanguage();
  const direction = useDirection();
  const dismissButtonRef = useRef<HTMLButtonElement>(null);

  // Get localized text based on current language
  const lang = language === 'he' ? 'he' : 'en';
  const beltName = BELT_NAMES[newBelt][lang];
  const congratulations = CONGRATULATIONS[lang];
  const youEarned = YOU_EARNED[lang];
  const dismissText = DISMISS_TEXT[lang];
  const encouragement = ENCOURAGEMENT[newBelt][lang];
  const textColor = BELT_TEXT_COLORS[newBelt];
  const glowColor = BELT_GLOW_COLORS[newBelt];

  // Focus trap for accessibility
  const { containerRef } = useFocusTrap({
    isActive: true,
    restoreFocus: true,
    autoFocus: true,
    initialFocus: 'button',
  });

  // Handle dismiss action
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  // Focus the dismiss button on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dismissButtonRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="belt-celebration-title"
      aria-describedby="belt-celebration-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={direction}
      ref={containerRef}
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Confetti animation background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Image
          src="/illustrations/celebration-confetti.webp"
          alt=""
          width={500}
          height={500}
          className="object-contain opacity-40 animate-pulse"
          priority
        />
      </div>

      {/* Modal card */}
      <div
        className="relative bg-gradient-to-b from-[#1E293B] to-[#0F172A] rounded-3xl p-8 max-w-sm w-full mx-auto shadow-2xl border border-white/10 animate-scale-in"
        role="document"
      >
        {/* Stars decoration */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <span className="text-4xl animate-bounce" aria-hidden="true">⭐</span>
        </div>

        {/* Congratulations title */}
        <h2
          id="belt-celebration-title"
          className="text-2xl font-bold text-white text-center mb-2 mt-4"
        >
          {congratulations}
        </h2>

        {/* You earned message */}
        <p className="text-gray-300 text-center mb-4">
          {youEarned}
        </p>

        {/* Belt image with glow effect */}
        <div className="flex justify-center mb-4">
          <div
            className={`relative rounded-full p-2 shadow-2xl ${glowColor} animate-glow`}
          >
            <Image
              src={getBeltImagePath(newBelt)}
              alt={beltName}
              width={120}
              height={120}
              className="rounded-full"
              priority
            />
          </div>
        </div>

        {/* Belt name */}
        <h3
          id="belt-celebration-description"
          className={`text-3xl font-bold text-center mb-4 ${textColor}`}
        >
          {beltName}
        </h3>

        {/* Encouragement message */}
        <p className="text-gray-400 text-sm text-center mb-6 italic px-4">
          &ldquo;{encouragement}&rdquo;
        </p>

        {/* Dismiss button */}
        <button
          ref={dismissButtonRef}
          onClick={handleDismiss}
          type="button"
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#1E293B]"
          aria-label={lang === 'he' ? 'סגור חגיגת חגורה' : 'Close belt celebration'}
        >
          {dismissText}
        </button>

        {/* Screen reader announcement */}
        <span className="sr-only" aria-live="polite">
          {lang === 'he'
            ? `כל הכבוד! זכית ב${beltName}`
            : `Congratulations! You earned the ${beltName}`}
        </span>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px currentColor;
          }
          50% {
            box-shadow: 0 0 40px currentColor;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out forwards;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default BeltEarnedModal;
