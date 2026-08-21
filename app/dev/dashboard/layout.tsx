'use client';

import { ReactNode } from 'react';
import { DevWarningBanner } from './components/DevWarningBanner';

/**
 * DevDashboardLayout — layout wrapper for the Dev Dashboard.
 * 
 * This layout provides:
 * - A persistent "Development Only" warning banner at the top
 * - Dark theme consistent with the rest of the application
 * - Full-height layout for the dashboard content
 * 
 * Requirements covered:
 * - 14.1: Dev Dashboard accessible at /dev/dashboard route
 * - 14.3: Not linked from main application navigation (separate layout)
 * - 14.4: Display a clear "Development Only" warning banner at the top
 */
export default function DevDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex flex-col">
      <DevWarningBanner />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
