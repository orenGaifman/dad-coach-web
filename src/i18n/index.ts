/**
 * Internationalization (i18n) module for Dad Coach Web.
 *
 * Provides translations and localization utilities for Hebrew and English.
 *
 * @example
 * import { useTranslations } from '@/src/i18n';
 *
 * function MyComponent() {
 *   const { t, isRTL } = useTranslations();
 *   return <button>{t('common.save')}</button>;
 * }
 */

export { useTranslations } from './useTranslations';
export type { UseTranslationsReturn } from './useTranslations';

export {
  translations,
  en,
  he,
  getTranslations,
  type TranslationStrings,
  type TranslationKey,
} from './translations';
