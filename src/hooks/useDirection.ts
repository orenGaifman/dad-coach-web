'use client';

import { useEffect } from 'react';
import { useOnboarding } from '@/src/components/onboarding/OnboardingProvider';

/**
 * useDirection — sets document dir attribute based on selected language.
 * Hebrew: dir="rtl", English: dir="ltr"
 *
 * @see Requirement 14.2, 14.3, 14.4
 */
export function useDirection() {
  const { language } = useOnboarding();

  useEffect(() => {
    if (!language) return;
    
    const dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);

    return () => {
      // Reset on unmount (when leaving onboarding)
      document.documentElement.removeAttribute('dir');
      document.documentElement.removeAttribute('lang');
    };
  }, [language]);
}
