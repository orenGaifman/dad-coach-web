'use client';

import Image from 'next/image';

import type { SupportedLanguage } from '@/src/types/onboarding';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

interface LanguageSelectorProps {
  selected: SupportedLanguage | null;
  onSelect: (language: SupportedLanguage) => void;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const LANGUAGES: readonly LanguageOption[] = [
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', flag: '🇮🇱' },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * LanguageSelector — presents language options as selectable cards.
 *
 * Requirements:
 * - Req 3: Language Selection (first wizard step after welcome)
 * - Supports Hebrew (RTL) and English (LTR)
 * - Selected language determines UI direction for subsequent steps
 */
export function LanguageSelector({ selected, onSelect }: LanguageSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Illustration */}
      <div className="w-48 h-48 relative mb-2">
        <Image
          src="/illustrations/onboarding-language-selection.webp"
          alt="Choose your language"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Choose Your Language</h1>
        <p className="text-gray-400">Select the language for your coaching experience</p>
      </div>

      {/* Language Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSelect(lang.code)}
            aria-pressed={selected === lang.code}
            className={`
              flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all
              ${
                selected === lang.code
                  ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
              }
            `}
          >
            <span className="text-4xl" role="img" aria-label={lang.label}>
              {lang.flag}
            </span>
            <span className="text-lg font-semibold text-white">{lang.nativeLabel}</span>
            <span className="text-sm text-gray-400">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
