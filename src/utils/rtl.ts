/**
 * RTL (Right-to-Left) support utilities.
 *
 * This module provides utilities for:
 * - Detecting RTL languages
 * - Computing direction attributes
 * - Flipping directional CSS values
 *
 * @see Requirement 8.2: RTL support
 */

import type { SupportedLanguage } from '@/src/types/workspace';

/**
 * Languages that are written right-to-left.
 */
export const RTL_LANGUAGES: SupportedLanguage[] = ['he'];

/**
 * Determine if a language is RTL.
 */
export function isRTL(language: SupportedLanguage | string): boolean {
  return RTL_LANGUAGES.includes(language as SupportedLanguage);
}

/**
 * Get the direction attribute value for a language.
 */
export function getDirection(language: SupportedLanguage | string): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

/**
 * Get the text alignment class for a language.
 * Uses CSS logical properties for consistency.
 */
export function getTextAlignClass(language: SupportedLanguage | string): string {
  return isRTL(language) ? 'text-right' : 'text-left';
}

/**
 * Flip a directional icon class based on language.
 * Useful for arrows, chevrons, etc.
 *
 * @example
 * flipIcon('rotate-180', 'he') // Returns '' (flipped back to original)
 * flipIcon('', 'he') // Returns 'rotate-180' (flipped for RTL)
 */
export function flipIconClass(
  baseClass: string,
  language: SupportedLanguage | string,
  flipClass = 'scale-x-[-1]'
): string {
  if (!isRTL(language)) return baseClass;
  
  // If base class already has flip, remove it for RTL (double flip = original)
  if (baseClass.includes(flipClass)) {
    return baseClass.replace(flipClass, '').trim();
  }
  
  // Add flip class for RTL
  return `${baseClass} ${flipClass}`.trim();
}

/**
 * CSS logical property mapping.
 * These mappings help when writing inline styles that need RTL support.
 */
export const logicalProperties = {
  // Margin
  marginStart: 'margin-inline-start',
  marginEnd: 'margin-inline-end',
  // Padding
  paddingStart: 'padding-inline-start',
  paddingEnd: 'padding-inline-end',
  // Border
  borderStart: 'border-inline-start',
  borderEnd: 'border-inline-end',
  // Positioning
  insetStart: 'inset-inline-start',
  insetEnd: 'inset-inline-end',
} as const;

/**
 * Default language for the application.
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Get the user's preferred language from storage or defaults.
 * This is a client-side only function.
 */
export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const stored = localStorage.getItem('dadcoach_language');
  if (stored && (stored === 'en' || stored === 'he')) {
    return stored;
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Store the user's language preference.
 */
export function setStoredLanguage(language: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('dadcoach_language', language);
}
