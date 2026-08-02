'use client';

/**
 * usePageView — Hook for tracking page views
 *
 * Automatically tracks page views when a component mounts.
 * Uses the analytics service abstraction.
 *
 * @see Task 8.4: Analytics event tracking
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/src/services/analytics';

interface UsePageViewOptions {
  /** Human-readable page name */
  pageName: string;
  /** Whether tracking is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to track page views automatically on mount.
 *
 * @example
 * // In a page component
 * usePageView({ pageName: 'Dashboard' });
 */
export function usePageView({ pageName, enabled = true }: UsePageViewOptions): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    analytics.pageView({
      page_name: pageName,
      page_path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    });
  }, [pageName, pathname, enabled]);
}

export default usePageView;
