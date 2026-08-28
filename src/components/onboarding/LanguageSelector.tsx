'use client';

import { useState } from 'react';
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
  /** When true, shows loading state on the selected language */
  isSubmitting?: boolean;
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
 * UX: Clicking a language immediately triggers navigation (no separate Continue button).
 * Shows a loading spinner on the clicked language while submitting.
 *
 * Requirements:
 * - Req 3: Language Selection (first wizard step after welcome)
 * - Supports Hebrew (RTL) and English (LTR)
 * - Selected language determines UI direction for subsequent steps
 */
export function LanguageSelector({ selected, onSelect, isSubmitting = false }: LanguageSelectorProps) {
  // Track which language was clicked to show loading on that specific button
  const [clickedLang, setClickedLang] = useState<SupportedLanguage | null>(null);

  const handleClick = (lang: SupportedLanguage) => {
    if (isSubmitting) return;
    setClickedLang(lang);
    onSelect(lang);
  };

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

      {/* Title - bilingual */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">
          Choose Your Language
        </h1>
        <p className="text-lg text-gray-300 mb-1">בחר את השפה שלך</p>
        <p className="text-gray-400 text-sm">Select the language for your coaching experience</p>
      </div>

      {/* Language Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
        {LANGUAGES.map((lang) => {
          const isLoading = isSubmitting && clickedLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleClick(lang.code)}
              disabled={isSubmitting}
              aria-pressed={selected === lang.code}
              className={`
                flex flex-col items-center gap-2 p-6 rounded-2xl border-2 transition-all
                ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${
                  isLoading
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <span className="text-lg font-semibold text-white">{lang.nativeLabel}</span>
                  <span className="text-sm text-gray-400">
                    {lang.code === 'he' ? 'טוען...' : 'Loading...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl" role="img" aria-label={lang.label}>
                    {lang.flag}
                  </span>
                  <span className="text-lg font-semibold text-white">{lang.nativeLabel}</span>
                  <span className="text-sm text-gray-400">{lang.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
