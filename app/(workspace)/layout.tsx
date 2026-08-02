'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TabNavigation from '@/src/components/layout/TabNavigation';
import WhatsAppBridge from '@/src/components/layout/WhatsAppBridge';
import { AUTH_TOKEN_KEY } from '@/src/config/auth';

/**
 * Authentication state for the workspace.
 * Checks for a valid authentication token in cookies or localStorage.
 */
function useAuthCheck(): { isAuthenticated: boolean | null; isChecking: boolean } {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check for auth token in localStorage (token-based auth approach)
        // This supports the architecture's token-based authentication pattern
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem(AUTH_TOKEN_KEY) 
          : null;
        
        if (!token) {
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // Optionally validate token with the server
        // For now, presence of token indicates authentication
        // Full validation happens on API calls via the api-client
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []);

  return { isAuthenticated, isChecking };
}

/**
 * Skeleton loading screen for the workspace.
 * Matches final layout structure per Requirement 17.1.
 */
function WorkspaceSkeleton() {
  return (
    <div 
      className="min-h-screen bg-[#0F172A]"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      {/* Desktop sidebar skeleton (hidden on mobile) */}
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-white/10 bg-[#0F172A] lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
      </aside>

      {/* Content area skeleton */}
      <main className="mx-auto min-h-screen max-w-lg px-4 py-6 lg:ml-64 lg:max-w-2xl">
        {/* Greeting skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-5 w-64 animate-pulse rounded bg-white/10" />
        </div>

        {/* Belt summary card skeleton */}
        <div className="mb-4 rounded-2xl border border-white/5 bg-[#1E293B] p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Stats row skeleton */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="rounded-xl border border-white/5 bg-[#1E293B] p-3"
            >
              <div className="h-8 w-full animate-pulse rounded bg-white/10" />
              <div className="mt-1 h-3 w-12 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Mission card skeleton */}
        <div className="mb-4 rounded-2xl border border-white/5 bg-[#1E293B] p-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 animate-pulse rounded bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
              <div className="h-2 w-full animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="rounded-xl border border-white/5 bg-[#1E293B] p-3"
            >
              <div className="mx-auto h-10 w-10 animate-pulse rounded bg-white/10" />
              <div className="mx-auto mt-2 h-4 w-16 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </main>

      {/* Mobile tab bar skeleton (hidden on desktop) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 h-16 border-t border-white/10 bg-[#0F172A]/95 backdrop-blur lg:hidden"
        aria-label="Main navigation loading"
      >
        <div className="mx-auto flex h-full max-w-lg items-center justify-around px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-6 w-6 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-10 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

/**
 * WorkspaceLayout — authenticated layout for the father workspace.
 *
 * This layout wraps all workspace routes ((workspace)/*) and provides:
 * - Authentication guard: redirects unauthenticated users to /join
 * - Shell layout with dark navy background
 * - Responsive navigation:
 *   - Mobile (< 1024px): Bottom tab bar + FAB WhatsApp button
 *   - Desktop (>= 1024px): Left sidebar with WhatsApp link
 * - Content area with max-width constraint
 *
 * Requirements covered:
 * - 1.1: Dashboard for authenticated father
 * - 1.5: Persistent WhatsApp bridge
 * - 8.1: Responsive navigation
 * - 17.1: Skeleton screens matching final layout during load
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isChecking } = useAuthCheck();

  // Redirect unauthenticated users to onboarding/login
  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.replace('/join');
    }
  }, [isChecking, isAuthenticated, router]);

  // Show skeleton during authentication check (Requirement 17.1)
  if (isChecking) {
    return <WorkspaceSkeleton />;
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Navigation with WhatsApp link for desktop sidebar */}
      <TabNavigation 
        whatsAppLink={<WhatsAppBridge variant="link" />} 
      />

      {/* Content area with responsive layout */}
      {/* Mobile: full width with padding, bottom padding for tab bar */}
      {/* Desktop: offset for sidebar, wider max-width */}
      <main 
        className="mx-auto min-h-screen max-w-lg px-4 pb-20 lg:ml-64 lg:max-w-2xl lg:pb-6"
        role="main"
      >
        {children}
      </main>

      {/* Mobile WhatsApp FAB (hidden on desktop) */}
      <div className="lg:hidden">
        <WhatsAppBridge variant="fab" />
      </div>
    </div>
  );
}
