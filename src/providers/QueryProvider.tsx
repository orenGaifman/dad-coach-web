'use client';

/**
 * QueryProvider — TanStack Query provider for the Dad Coach application.
 *
 * This provider wraps the entire application to enable data fetching
 * with caching, background refetching, and optimistic updates.
 *
 * Requirements covered:
 * - 1.2: Dashboard renders within 2 seconds (stale-while-revalidate)
 * - 17.1: Graceful loading state handling via cached data
 *
 * Provider Hierarchy (from design.md):
 * ```
 * app/layout.tsx (RootLayout)
 * └── QueryProvider (TanStack Query context) <-- This component
 *     └── AuthProvider (authentication context + redirect logic)
 *         └── app/(workspace)/layout.tsx (WorkspaceLayout)
 * ```
 *
 * QueryProvider wraps AuthProvider because auth hooks may need query cache
 * access (e.g., clearing cache on logout).
 */

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/src/lib/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider component.
 *
 * Uses useState to ensure a stable QueryClient instance across re-renders
 * while still creating a new instance per server render (for SSR safety).
 *
 * Features:
 * - Creates QueryClient once per component mount
 * - Provides query context to all descendants
 * - React Query Devtools included in development only
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient once and reuse across re-renders
  // Using useState ensures the client is created only once per component lifecycle
  // and is stable across re-renders
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
