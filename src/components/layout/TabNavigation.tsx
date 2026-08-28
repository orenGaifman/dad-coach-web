'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/src/i18n';
import type { TranslationKey } from '@/src/i18n';

/**
 * Navigation tab configuration.
 * Routes defined per task requirements.
 */
interface NavTab {
  nameKey: TranslationKey;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabelKey: TranslationKey;
}

/**
 * SVG Icons for navigation tabs.
 * Using inline SVGs since public/icons/*.svg don't exist yet.
 * These match common navigation icon patterns.
 */

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function GrowthIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

function FamilyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function CoachingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

/**
 * Navigation tabs configuration.
 * 5 tabs as specified in Task 1.2 requirements.
 * Uses translation keys instead of hardcoded strings.
 */
const navTabs: NavTab[] = [
  {
    nameKey: 'nav.home',
    href: '/dashboard',
    icon: HomeIcon,
    ariaLabelKey: 'nav.aria.home',
  },
  {
    nameKey: 'nav.growth',
    href: '/growth',
    icon: GrowthIcon,
    ariaLabelKey: 'nav.aria.growth',
  },
  {
    nameKey: 'nav.family',
    href: '/family',
    icon: FamilyIcon,
    ariaLabelKey: 'nav.aria.family',
  },
  {
    nameKey: 'nav.coaching',
    href: '/coaching',
    icon: CoachingIcon,
    ariaLabelKey: 'nav.aria.coaching',
  },
  {
    nameKey: 'nav.profile',
    href: '/profile',
    icon: ProfileIcon,
    ariaLabelKey: 'nav.aria.profile',
  },
];

/**
 * Determines if a navigation tab is active based on URL matching.
 * Home (/dashboard) is special - only active on exact match.
 * Other tabs are active if the pathname starts with their href.
 */
function isTabActive(pathname: string, tabHref: string): boolean {
  if (tabHref === '/dashboard') {
    // Home tab: active only on exact /dashboard match
    return pathname === '/dashboard' || pathname === '/dashboard/';
  }
  // Other tabs: active if pathname starts with the tab href
  return pathname.startsWith(tabHref);
}

interface TabNavigationProps {
  /** Optional WhatsApp link component for desktop sidebar */
  whatsAppLink?: React.ReactNode;
}

/**
 * TabNavigation — responsive navigation component for the workspace.
 *
 * Features:
 * - Mobile (< 768px): Fixed bottom tab bar
 * - Tablet (768–1024px): Adaptive - bottom bar with larger touch targets
 * - Desktop (> 1024px): Persistent left sidebar
 * - 5 navigation tabs: Home, Growth, Family, Coaching, Profile
 * - Active tab highlighted via URL matching (indigo-400)
 * - Inactive tabs in gray-500
 * - 44×44px minimum touch targets for accessibility
 * - Semantic navigation landmark with ARIA labels
 *
 * Requirements covered:
 * - 1.1: Workspace navigation with 5 tabs
 * - 8.1: Responsive navigation implementation
 */
export default function TabNavigation({ whatsAppLink }: TabNavigationProps) {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <>
      {/* Mobile/Tablet Bottom Tab Bar (< 1024px) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-white/10 bg-[#0F172A]/95 backdrop-blur lg:hidden"
        aria-label="Main workspace navigation"
        role="navigation"
      >
        <ul className="mx-auto flex h-full max-w-lg items-center justify-around px-2">
          {navTabs.map((tab) => {
            const isActive = isTabActive(pathname, tab.href);
            const Icon = tab.icon;

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`
                    flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 px-2 py-1
                    transition-colors duration-150
                    ${isActive ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-400'}
                  `}
                  aria-label={t(tab.ariaLabelKey)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{t(tab.nameKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Sidebar (>= 1024px) */}
      <nav
        className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-white/10 bg-[#0F172A] lg:flex"
        aria-label="Main workspace navigation"
        role="navigation"
      >
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <span className="text-xl font-bold text-white">{t('nav.brand')}</span>
        </div>

        {/* Navigation Links */}
        <ul className="flex-1 space-y-1 px-3 py-4">
          {navTabs.map((tab) => {
            const isActive = isTabActive(pathname, tab.href);
            const Icon = tab.icon;

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    transition-colors duration-150
                    ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }
                  `}
                  aria-label={t(tab.ariaLabelKey)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{t(tab.nameKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* WhatsApp Link (Desktop) */}
        {whatsAppLink && (
          <div className="border-t border-white/10 px-3 py-4">
            {whatsAppLink}
          </div>
        )}
      </nav>
    </>
  );
}
