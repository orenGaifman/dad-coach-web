# Design: Father Workspace Frontend

## Overview

This document describes the frontend architecture for the Father Workspace — routing, state management, component hierarchy, data flow, API integration, caching, and error handling.

It aligns with the existing Next.js App Router architecture in `dad-coach-web` and the approved specifications in WEB-SPEC-008.

## Frontend Folder Structure

```
src/
├── components/
│   ├── ui/                  # Primitive UI atoms (buttons, inputs, cards)
│   ├── common/              # Shared feature-agnostic components
│   │   ├── SkeletonScreen.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── CelebrationModal.tsx
│   │   └── ProgressBar.tsx
│   ├── layout/              # Shell and navigation components
│   │   ├── WorkspaceLayout.tsx
│   │   ├── TabNavigation.tsx
│   │   ├── NavigationBadge.tsx
│   │   └── WhatsAppBridge.tsx
│   ├── dashboard/           # Dashboard-specific components
│   ├── belts/               # Belt and score display components
│   ├── achievements/        # Achievement gallery components
│   └── onboarding/          # (Future: onboarding wizard components)
├── hooks/                   # Custom React hooks (query + mutation wrappers)
├── services/                # API service modules (typed fetch functions)
├── lib/
│   ├── api-client.ts        # Central HTTP client (fetch wrapper)
│   └── query-client.ts      # TanStack Query client configuration
├── providers/
│   ├── QueryProvider.tsx     # TanStack Query provider
│   └── AuthProvider.tsx      # Authentication context provider
├── utils/
│   ├── date.ts              # Date formatting, age computation
│   ├── format.ts            # Number, phone masking utilities
│   └── validation.ts        # Shared validation helpers (Zod schemas)
├── config/
│   ├── api.ts               # API base URL, timeouts, retry config
│   └── routes.ts            # Route path constants
├── constants/
│   ├── belts.ts             # Belt names, thresholds, asset paths
│   ├── achievements.ts      # Achievement categories, icon keys
│   └── activity-types.ts    # Activity type enums
├── types/                   # TypeScript type definitions (DTOs, models)
│   ├── workspace.ts
│   ├── growth.ts
│   ├── family.ts
│   ├── coaching.ts
│   ├── notifications.ts
│   └── common.ts
└── styles/                  # Global styles, Tailwind extensions
```

### Folder Responsibilities

| Folder | Responsibility | May Import From |
|--------|---------------|-----------------|
| `types/` | DTO and model type definitions only | Nothing (leaf) |
| `constants/` | Static values, enums, asset paths | `types/` |
| `config/` | Environment-specific configuration | Nothing (leaf) |
| `utils/` | Pure utility functions | `types/`, `constants/` |
| `lib/` | Infrastructure singletons (api-client, query-client) | `config/`, `types/` |
| `services/` | API call functions (typed fetchers) | `lib/`, `types/`, `config/` |
| `hooks/` | React hooks wrapping services with caching | `services/`, `types/` |
| `providers/` | React context providers | `lib/` |
| `components/` | React components (UI rendering) | `hooks/`, `types/`, `constants/`, `utils/` |

---

## Provider Hierarchy

```
app/layout.tsx (RootLayout)
└── QueryProvider (TanStack Query context)
    └── AuthProvider (authentication context + redirect logic)
        └── app/(workspace)/layout.tsx (WorkspaceLayout)
            ├── TabNavigation
            ├── WhatsAppBridge
            └── {children} (Page components)
```

### Provider Details

| Provider | Location | Responsibility |
|----------|----------|----------------|
| **RootLayout** | `app/layout.tsx` | HTML shell, fonts, global CSS, meta |
| **QueryProvider** | `src/providers/QueryProvider.tsx` | TanStack Query client, devtools in dev |
| **AuthProvider** | `src/providers/AuthProvider.tsx` | Auth state, token refresh, redirect on 401 |
| **WorkspaceLayout** | `app/(workspace)/layout.tsx` | Tab navigation, WhatsApp bridge, page shell |

QueryProvider wraps AuthProvider because auth hooks may need query cache access (e.g., clearing cache on logout). AuthProvider wraps WorkspaceLayout because the layout renders only for authenticated users.

---

## Architecture Decisions

### Framework

- **Next.js App Router** — existing project framework
- **Server Components** by default; Client Components only where interactivity is required (forms, modals, tabs)
- **Route-level code splitting** — each tab is a separate route segment

### Routing Structure

```
app/
├── (workspace)/            # Route group for authenticated workspace
│   ├── layout.tsx          # Workspace layout with tab navigation
│   ├── dashboard/
│   │   └── page.tsx        # Screen D1: Dashboard Home
│   ├── growth/
│   │   ├── page.tsx        # Screen G1: Growth Overview (belt + score)
│   │   ├── achievements/
│   │   │   └── page.tsx    # Screen G2: Achievements
│   │   └── streak/
│   │       └── page.tsx    # Screen G3: Streak
│   ├── family/
│   │   ├── page.tsx        # Screen F1: Children Overview
│   │   ├── children/
│   │   │   └── [childId]/
│   │   │       └── page.tsx # Screen F2: Child Detail
│   │   ├── goals/
│   │   │   ├── page.tsx    # Screen F3: Goals Overview
│   │   │   └── [goalId]/
│   │   │       └── page.tsx # Screen F4: Goal Detail
│   ├── coaching/
│   │   ├── page.tsx        # Screen C1: Coaching History
│   │   ├── [conversationId]/
│   │   │   └── page.tsx    # Screen C2: Conversation Detail
│   │   └── log/
│   │       └── page.tsx    # Screens C3/C4: Activity Log + Confirmation
│   ├── profile/
│   │   ├── page.tsx        # Screen P1: Profile Overview
│   │   ├── edit/
│   │   │   └── page.tsx    # Screen P2: Edit Profile
│   │   ├── children/
│   │   │   └── page.tsx    # Screen P3: Children Management
│   │   ├── preferences/
│   │   │   └── page.tsx    # Screen P4: Preferences
│   │   └── account/
│   │       └── page.tsx    # Screen P5: Account
│   └── notifications/
│       └── page.tsx        # Screen U1: Notifications List
```

### Authentication Guard

- The `(workspace)` route group layout includes an auth check
- Unauthenticated requests redirect to login/onboarding
- Auth mechanism is implementation-specific (Open Question); the architecture supports any token-based approach

## State Management

### Server State (Primary)

All workspace data is owned by the backend. The frontend is a read-through cache.

**Strategy:** TanStack Query (React Query) pattern

- Each API endpoint maps to a query with a unique cache key
- Stale-while-revalidate: show cached data immediately, revalidate in background
- Configurable stale times aligned with backend cache TTLs

**Cache Keys:**

| Key | Endpoint | Stale Time |
|-----|----------|-----------|
| `['workspace-summary']` | `GET /api/v1/workspace/summary` | 60s |
| `['growth-belt']` | `GET /api/v1/workspace/growth/belt` | 300s |
| `['growth-score']` | `GET /api/v1/workspace/growth/score` | 300s |
| `['growth-streak']` | `GET /api/v1/workspace/growth/streak` | 120s |
| `['growth-achievements']` | `GET /api/v1/workspace/growth/achievements` | 600s |
| `['celebrations']` | `GET /api/v1/workspace/growth/celebrations` | 0 (always fresh) |
| `['children']` | `GET /api/v1/workspace/children` | 120s |
| `['child', childId]` | `GET /api/v1/workspace/children/{childId}/summary` | 120s |
| `['goals']` | `GET /api/v1/workspace/goals` | 120s |
| `['goal', goalId]` | `GET /api/v1/workspace/goals/{goalId}/progress` | 120s |
| `['missions-active']` | `GET /api/v1/workspace/missions/active` | 60s |
| `['conversations']` | `GET /api/v1/workspace/conversations` | 120s |
| `['notifications']` | `GET /api/v1/workspace/notifications` | 30s |
| `['profile']` | `GET /api/v1/workspace/profile` | 0 (fresh each view) |

### Client State (Minimal)

- Activity logging form values (before submission)
- Celebration modal queue (pending events)
- Active tab/segment state (if not URL-driven)

### Mutations & Cache Invalidation

| Mutation | Invalidates |
|----------|-------------|
| Log quality time | `workspace-summary`, `growth-score`, `growth-streak` |
| Log positive activity | `workspace-summary`, `growth-score`, `growth-streak` |
| Mark celebration displayed | `celebrations` |
| Mark notification read | `notifications`, `workspace-summary` |
| Mark all notifications read | `notifications`, `workspace-summary` |
| Edit profile | `profile`, `workspace-summary` |
| Add/edit/archive child | `children`, `workspace-summary` |

## Component Hierarchy

### Layout Components

```
src/components/layout/
├── WorkspaceLayout.tsx       # Shell: sidebar/tab bar + content area
├── TabNavigation.tsx         # 5-tab navigation (responsive: bottom bar / sidebar)
├── NavigationBadge.tsx       # Notification count badge
└── WhatsAppBridge.tsx        # Persistent WhatsApp link (FAB on mobile)
```

### Feature Components

```
src/components/dashboard/
├── DashboardSummary.tsx      # Full dashboard composition
├── BeltSummaryCard.tsx       # Belt + score mini-display
├── StreakSummaryCard.tsx     # Streak mini-display
├── ActiveMissionCard.tsx     # Current mission card
└── EmptyDashboard.tsx        # First-visit empty state

src/components/belts/
├── BeltProgressDisplay.tsx   # Full belt view with progress bar
├── BeltBadge.tsx             # Belt icon/visual
└── ScoreBreakdown.tsx        # Score by category

src/components/achievements/
├── AchievementGallery.tsx    # Full gallery grouped by category
├── AchievementCard.tsx       # Single achievement card
└── NextAchievable.tsx        # "Next up" highlight

src/components/common/
├── SkeletonScreen.tsx        # Loading skeleton primitives
├── EmptyState.tsx            # Reusable empty state with illustration slot
├── ErrorState.tsx            # Reusable error display
├── CelebrationModal.tsx      # Celebration overlay
└── ProgressBar.tsx           # Reusable progress fill bar
```

## Data Flow

### Complete Data Flow Architecture

```
Backend REST API
    ↑↓ (HTTP)
src/lib/api-client.ts (apiClient)
    ↑↓ (typed request/response)
src/services/*.ts (feature service modules)
    ↑↓ (typed DTOs)
src/hooks/*.ts (query/mutation hooks with caching)
    ↑↓ (cached data + loading/error states)
app/(workspace)/**/page.tsx (page components)
    ↑↓ (props)
src/components/**/*.tsx (feature components)
    ↑↓ (render)
src/components/ui/*.tsx (UI primitives)
```

### apiClient Abstraction

The `apiClient` is a thin HTTP abstraction that centralizes cross-cutting concerns. Feature services never call `fetch` directly.

**Location:** `src/lib/api-client.ts`

**Responsibilities:**
- Base URL resolution (from `src/config/api.ts`)
- Authentication header injection (reads token from AuthProvider context or cookie)
- Request/response JSON serialization
- HTTP error classification (network, 401, 403, 404, 429, 5xx)
- Typed error throwing (`ApiError` with code, message, retryable flag)
- Request timeout enforcement
- Content-Type headers

**Interface (conceptual):**
```typescript
interface ApiClient {
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete(path: string): Promise<void>;
}
```

**What it does NOT do:**
- Caching (owned by TanStack Query in hooks)
- Retry logic for queries (owned by TanStack Query)
- Business validation (owned by services)
- UI error display (owned by components)

### Service Layer

Each service module uses `apiClient` and returns typed DTOs:

```typescript
// src/services/growth.ts
import { apiClient } from '@/lib/api-client';
import type { BeltProgressionResponse } from '@/types/growth';

export async function getBeltProgression(): Promise<BeltProgressionResponse> {
  return apiClient.get<BeltProgressionResponse>('/api/v1/workspace/growth/belt');
}
```

### Hook Layer

Each hook wraps a service call with TanStack Query:

```typescript
// src/hooks/useBeltProgression.ts
import { useQuery } from '@tanstack/react-query';
import { getBeltProgression } from '@/services/growth';

export function useBeltProgression() {
  return useQuery({
    queryKey: ['growth-belt'],
    queryFn: getBeltProgression,
    staleTime: 300_000, // 5 minutes
  });
}
```

### API Service Layer

```
src/services/
├── workspace.ts        # Summary, profile endpoints
├── growth.ts           # Belt, score, streak, achievements, celebrations
├── family.ts           # Children, goals
├── coaching.ts         # Conversations, activity logging
└── notifications.ts    # Notifications, mark-read
```

Each service module:
- Exports typed fetch functions
- Handles base URL and auth headers
- Returns typed DTOs
- Throws typed errors (network, validation, rate-limit)

### Custom Hooks

```
src/hooks/
├── useWorkspaceSummary.ts
├── useBeltProgression.ts
├── useAchievements.ts
├── useStreak.ts
├── useChildren.ts
├── useChildDetail.ts
├── useGoals.ts
├── useGoalDetail.ts
├── useConversations.ts
├── useNotifications.ts
├── useCelebrations.ts
├── useLogActivity.ts       # Mutation hook for activity logging
├── useMarkRead.ts          # Mutation hook for notifications
└── useProfile.ts
```

## Error Handling Strategy

### Error Categories

| Category | HTTP Status | Frontend Behavior |
|----------|------------|-------------------|
| Network failure | N/A | Show offline state, preserve cached data |
| Server error | 5xx | Show error state with retry button |
| Not authenticated | 401 | Redirect to auth flow |
| Not found | 404 | Redirect to parent route |
| Rate limited | 429 | Show friendly "limit reached" message |
| Validation error | 400/422 | Inline field-level errors |
| Partial degradation | 200 + `degraded_sections` | Render available sections, placeholder for degraded |

### Error Boundaries

- Route-level error boundaries per tab (growth, family, coaching, profile)
- Dashboard has its own boundary that renders partial content on failure
- Forms have inline error handling (no boundary needed)

## Caching Strategy

### Client-Side Caching

- In-memory cache (TanStack Query default)
- Persists for session lifetime (cleared on logout)
- Stale-while-revalidate for all read queries
- Background refetch on window focus (dashboard summary only)
- Manual invalidation after mutations

### Revalidation Triggers

| Trigger | Queries Revalidated |
|---------|---------------------|
| Tab navigation (focus) | Stale queries for that tab |
| Window regain focus | `workspace-summary` only |
| After activity mutation | Summary + growth queries |
| Pull-to-refresh (mobile) | All queries for current tab |

## Dependencies

### Runtime Dependencies (existing)

- Next.js (App Router)
- React
- Tailwind CSS (existing in project via `@tailwindcss/postcss`)
- TypeScript

### Dependencies to Add

- Data fetching library with caching (TanStack Query or similar)
- Form validation library (lightweight — Zod for schemas, native form handling)

### Asset Dependencies

- Belt SVGs in `public/belts/` (8 files)
- Achievement SVGs in `public/achievements/` (15+ files)
- Illustration SVGs in `public/illustrations/` (empty states, celebrations)
- Nav icons in `public/icons/`

## Accessibility Architecture

- Semantic HTML structure: `nav`, `main`, `section`, `article`
- ARIA landmarks for screen reader navigation
- Focus management via React refs on route transitions
- RTL support: CSS logical properties (`margin-inline-start` vs `margin-left`)
- Language direction set at layout level based on user preference

## Performance Architecture

- Route-level code splitting (Next.js default with App Router)
- Lazy loading: celebration modal, activity forms, profile edit sections
- SVG assets loaded directly from `public/` (no bundling needed)
- Prefetch: Growth and Family data on dashboard mount
- No SSR for workspace pages (client-only after auth check)

## TypeScript Types

```
src/types/
├── workspace.ts       # WorkspaceSummary, DegradedSections
├── growth.ts          # Belt, Score, Streak, Achievement, Celebration
├── family.ts          # Child, Goal, Mission
├── coaching.ts        # Conversation, ActivityReport
├── notifications.ts   # Notification, NotificationPriority
└── common.ts          # Pagination, ApiError, ResponseStatus
```


---

## Frontend Asset Naming Conventions

All assets follow the conventions defined in [ASSET_STRATEGY.md](../../../docs/design/ASSET_STRATEGY.md). This section summarizes the naming rules relevant to workspace implementation.

### General Rules

- Lowercase only
- Hyphens as separators (no underscores, no camelCase)
- SVG format for all vector assets
- Descriptive slug (name describes what it is)

### Belt Assets

**Location:** `public/belts/`
**Pattern:** `belt-{level}.svg`

| File | Belt |
|------|------|
| `belt-white.svg` | WHITE |
| `belt-yellow.svg` | YELLOW |
| `belt-orange.svg` | ORANGE |
| `belt-green.svg` | GREEN |
| `belt-blue.svg` | BLUE |
| `belt-purple.svg` | PURPLE |
| `belt-brown.svg` | BROWN |
| `belt-black.svg` | BLACK |

**Usage in code:**
```typescript
const beltAssetPath = `/belts/belt-${beltLevel.toLowerCase()}.svg`;
```

### Achievement Assets

**Location:** `public/achievements/`
**Pattern:** `achievement-{slug}.svg`

Slug derived from achievement name: lowercase, spaces replaced with hyphens.

| Achievement Name | File |
|-----------------|------|
| First Steps | `achievement-first-steps.svg` |
| Mission Master 10 | `achievement-mission-master-10.svg` |
| Week Warrior | `achievement-week-warrior.svg` |
| Goal Getter | `achievement-goal-getter.svg` |
| Deep Talker | `achievement-deep-talker.svg` |
| Rising Star | `achievement-rising-star.svg` |
| Green Machine | `achievement-green-machine.svg` |
| Grandmaster | `achievement-grandmaster.svg` |

**Usage in code:**
```typescript
// icon_key from backend maps directly to filename
const achievementAssetPath = `/achievements/achievement-${iconKey}.svg`;
```

### Navigation Icons

**Location:** `public/icons/`
**Pattern:** `nav-{name}.svg`

| Icon | File |
|------|------|
| Home tab | `nav-home.svg` |
| Growth tab | `nav-growth.svg` |
| Family tab | `nav-family.svg` |
| Coaching tab | `nav-coaching.svg` |
| Profile tab | `nav-profile.svg` |

### Illustration Assets

**Location:** `public/illustrations/`
**Pattern:** `{context}-{descriptor}.svg`

| Context | File |
|---------|------|
| Empty dashboard | `empty-dashboard.svg` |
| Empty achievements | `empty-achievements.svg` |
| Celebration generic | `celebration-generic.svg` |
| Error state | `error-general.svg` |
| Offline state | `offline.svg` |

### Fallback Strategy

If an SVG asset is not yet available (assets are pending from design), components render a text-based fallback:

- Belts: display belt name in a styled badge
- Achievements: display achievement name with category icon
- Icons: use text labels without icons

This ensures implementation can proceed independently of asset delivery.
