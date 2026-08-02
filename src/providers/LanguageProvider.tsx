'use client';

/**
 * Language Provider — context for language and RTL support.
 *
 * Provides:
 * - Current language setting
 * - RTL/LTR direction
 * - Language change functionality
 *
 * @see Requirement 8.2: RTL support
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { SupportedLanguage } from '@/src/types/workspace';
import {
  getStoredLanguage,
  setStoredLanguage,
  getDirection,
  isRTL,
  DEFAULT_LANGUAGE,
} from '@/src/utils/rtl';

interface LanguageContextValue {
  /** Current language code */
  language: SupportedLanguage;
  /** Document direction (ltr or rtl) */
  direction: 'ltr' | 'rtl';
  /** Whether current language is RTL */
  isRTL: boolean;
  /** Change the language */
  setLanguage: (language: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  /** Initial language (optional, overrides storage) */
  initialLanguage?: SupportedLanguage;
}

/**
 * LanguageProvider component.
 *
 * Wraps the application to provide language context.
 * Also updates the document's dir attribute when language changes.
 */
export function LanguageProvider({
  children,
  initialLanguage,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    initialLanguage ?? DEFAULT_LANGUAGE
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from storage on client
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialLanguage) {
      const stored = getStoredLanguage();
      setLanguageState(stored);
    }
    setIsInitialized(true);
  }, [initialLanguage]);

  // Update document dir attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const dir = getDirection(language);
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language]);

  // Language change handler
  const setLanguage = useCallback((newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    setStoredLanguage(newLanguage);
  }, []);

  const value: LanguageContextValue = {
    language,
    direction: getDirection(language),
    isRTL: isRTL(language),
    setLanguage,
  };

  // Render children immediately but context value may update after hydration
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context.
 *
 * @throws Error if used outside LanguageProvider
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Hook to get just the direction, for components that only need direction.
 */
export function useDirection(): 'ltr' | 'rtl' {
  const { direction } = useLanguage();
  return direction;
}

export default LanguageProvider;
