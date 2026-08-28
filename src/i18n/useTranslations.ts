/**
 * Hook for accessing translations based on current language.
 *
 * Uses the LanguageProvider context to determine the current language
 * and returns a translation function.
 *
 * @example
 * const { t } = useTranslations();
 * return <button>{t('common.save')}</button>;
 *
 * @example
 * // With interpolation
 * const { t } = useTranslations();
 * return <span>{t('time.hours').replace('{count}', '5')}</span>;
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useLanguage } from '@/src/providers/LanguageProvider';
import {
  translations,
  type TranslationKey,
  type TranslationStrings,
} from './translations';

/**
 * Return type for the useTranslations hook.
 */
export interface UseTranslationsReturn {
  /**
   * Get a translated string by key.
   * Returns the key itself if translation is not found (with console warning in dev).
   */
  t: (key: TranslationKey) => string;

  /**
   * Current language code.
   */
  language: 'en' | 'he';

  /**
   * Whether the current language is RTL.
   */
  isRTL: boolean;

  /**
   * All translations for the current language (for advanced use cases).
   */
  strings: TranslationStrings;
}

/**
 * Hook to access translations based on the current language.
 *
 * @returns Translation function and language utilities
 *
 * @example
 * function MyComponent() {
 *   const { t, isRTL } = useTranslations();
 *
 *   return (
 *     <div dir={isRTL ? 'rtl' : 'ltr'}>
 *       <h1>{t('nav.home')}</h1>
 *       <button>{t('common.save')}</button>
 *     </div>
 *   );
 * }
 */
export function useTranslations(): UseTranslationsReturn {
  const { language, isRTL } = useLanguage();

  // Get the translation strings for the current language
  const strings = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  // Translation function
  const t = useCallback(
    (key: TranslationKey): string => {
      const translation = strings[key];

      if (translation === undefined) {
        // In development, warn about missing translations
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation for key: "${key}" in language: "${language}"`);
        }
        // Return the key as fallback
        return key;
      }

      return translation;
    },
    [strings, language]
  );

  return {
    t,
    language,
    isRTL,
    strings,
  };
}

export default useTranslations;
