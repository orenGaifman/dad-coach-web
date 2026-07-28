# WEB-SPEC-008: Father Workspace Frontend

## Overview

### Purpose

This specification defines the frontend implementation of the Father Workspace — the authenticated dashboard experience that fathers access after completing onboarding and activating WhatsApp coaching.

### Business Value

The Father Workspace is the primary web touchpoint for engaged fathers. It serves as:
- A progress mirror that reflects growth earned through WhatsApp coaching
- An activity logging surface that captures real-world parenting moments
- A management hub for profile, children, and preferences

Without this workspace, fathers have no visual representation of their coaching journey and no way to log offline parenting activities.

### Goals

1. Display the father's growth state clearly and encouragingly
2. Enable quick activity logging (quality time, positive activities)
3. Provide read-only access to coaching history and family context
4. Surface notifications and celebration events
5. Allow profile and preference management

### Success Metrics

- Dashboard load time under 2 seconds (perceived)
- Activity logging completion under 30 seconds
- Return visits: 2–3x per week average
- Celebration events viewed within 48 hours of earning

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Backend Workspace APIs (SPEC-008) | API | Partially implemented (Phases 1–3 complete) |
| Authentication system | Infrastructure | Open Question |
| Onboarding completion (WEB-SPEC-007) | Prerequisite | Not yet specified |
| WhatsApp activation | Prerequisite | Backend implemented |

### Assumptions

- The MVP is invitation-only (no public landing page)
- Authentication implementation details are outside this specification
- The dashboard is accessible only to activated fathers
- Notification updates use polling or refresh-on-navigation (no WebSocket/SSE)
- Dark mode is out of scope for MVP
- Real-time push is out of scope for MVP

### Out of Scope

- Onboarding wizard (separate specification)
- Landing/marketing page
- Dark mode
- Real-time WebSocket/SSE updates
- Statistics dashboard (marked FUTURE in backend)
- Activity feed timeline (marked FUTURE in backend)
- Quick actions (marked FUTURE in backend)
- Goal/mission creation from web
- In-web coaching conversations

---

## Business Context

### User Problem

Fathers coached via WhatsApp have no visual representation of their growth. They cannot see their belt progression, review achievements, or log real-world parenting activities. Without this visibility, the motivation loop that sustains habit formation is incomplete.

### Business Problem

Without a web dashboard, engagement relies entirely on WhatsApp push messages. Fathers who want to reflect on progress, manage their family context, or log activities have no self-service option. This limits retention and reduces the perceived value of the product.

### Expected Outcome

Fathers visit the workspace 2–3 times per week, feel encouraged by visible progress, log activities that feed the growth system, and maintain higher engagement with WhatsApp coaching as a result of the reinforcement loop.

---

## Scope

### Included (MVP)

- Dashboard home with workspace summary (Screen D1)
- Growth overview: belt, score, achievements, streak (Screens G1, G2, G3)
- Family: children overview, child detail, goals overview, goal detail (Screens F1–F4)
- Coaching: conversation history, conversation detail, activity logging (Screens C1–C4)
- Profile: view, edit, children management, preferences, account (Screens P1–P5)
- Notifications list (Screen U1)
- Celebration modal (Screen U2)
- Error, offline, loading states (Screens U3–U5)

### Excluded

- Statistics dashboard (Screen G4) — FUTURE
- Activity feed timeline — FUTURE
- Quick actions — FUTURE
- Goal creation from web
- Mission creation from web
- In-web coaching conversations
- Dark mode
- Real-time push notifications

### Future Enhancements

- Statistics screen with weekly/monthly trends
- Activity feed (chronological timeline with cursor pagination)
- Quick actions (contextual next-step suggestions)
- Birthday celebrations and reminders
- Account pause/delete flows
- Advanced notification preferences

---

## User Stories

### US-1: View Workspace Summary

**Priority:** P0 (Critical)

As a father, I want to see my key metrics at a glance when I open the dashboard, so that I feel acknowledged and know where I stand.

**Acceptance Criteria:**

1. Dashboard displays: current belt, growth score, current streak days, active mission (if any), last coaching conversation timestamp, unread notification count, and active children count
2. Data loads within 2 seconds of page render
3. If any section is unavailable (partial degradation), remaining sections render normally with unavailable sections showing a neutral placeholder
4. If the father has never completed a coaching session, the dashboard shows a warm empty state (Journey 6) rather than zeros

### US-2: View Belt Progression

**Priority:** P0 (Critical)

As a father, I want to see my current belt and progress toward the next belt, so that I feel motivated by visible forward momentum.

**Acceptance Criteria:**

1. Displays: current belt name and visual, current score, next belt name, points remaining to next belt, and percentage progress
2. Belt visual matches the 8-belt system: WHITE, YELLOW, ORANGE, GREEN, BLUE, PURPLE, BROWN, BLACK
3. BLACK belt (final) shows a completion/mastery state instead of "next belt"
4. Progress visualization fills, never depletes (Design Rule 22)
5. No comparison to other fathers

### US-3: View Achievements

**Priority:** P1 (High)

As a father, I want to browse my achievements, so that I feel recognized for my parenting efforts.

**Acceptance Criteria:**

1. Displays all available achievements grouped by category (MISSIONS, CONSISTENCY, GROWTH, CONVERSATIONS, GOALS, SPECIAL)
2. Earned achievements show earned_at date
3. Unearned achievements are shown as available (not locked, greyed, or hidden)
4. Shows "next achievable" — the closest unearned achievement with implied progress
5. No language implying failure for unearned achievements

### US-4: View Streak

**Priority:** P1 (High)

As a father, I want to see my consistency streak, so that I appreciate my sustained engagement.

**Acceptance Criteria:**

1. Displays: current streak days, longest streak ever, streak start date, last qualifying interaction date
2. Does NOT display "streak at risk" warnings — this would violate the Anti-Goal of never shaming (the backend tracks this internally for growth signals, but the frontend does not expose it as pressure)
3. Milestone markers shown at 7, 14, 21, 30, 60, 90, 180, 365 days
4. If streak is zero, shows encouraging message about starting fresh — never punitive language

### US-5: View Children Overview

**Priority:** P1 (High)

As a father, I want to see all my children at a glance, so that I know their coaching context.

**Acceptance Criteria:**

1. Displays per child: name, computed age, recent mission title, active goals count, and completed missions count
2. Ages computed dynamically from birth_date
3. If a birthday is within 7 days, shows a subtle indicator
4. Empty state (no children registered) invites adding children without pressure
5. Tapping a child navigates to child detail (Screen F2)

### US-6: View Child Detail

**Priority:** P1 (High)

As a father, I want to view detailed information about one child, so that I understand their coaching context fully.

**Acceptance Criteria:**

1. Displays: name, birth date, computed age, interests, challenges, active goals with progress, mission history summary, and upcoming birthday indicator
2. Read-only view — editing navigates to Children Management (Screen P3)
3. Back navigation returns to Children Overview (Screen F1)

### US-7: View Goals Overview

**Priority:** P1 (High)

As a father, I want to see all my parenting goals with progress, so that I track what I'm working toward.

**Acceptance Criteria:**

1. Displays per goal: description, category, priority, progress percentage, related child (if linked), and missions completed/remaining
2. Progress percentage calculated as: completed_missions / estimated_missions × 100, capped at 100%
3. Supports filtering by: status, category, child
4. Empty state (no goals) explains that goals are created through WhatsApp coaching

### US-8: View Goal Detail

**Priority:** P2 (Medium)

As a father, I want to see detailed progress for one goal, so that I understand how close I am to completion.

**Acceptance Criteria:**

1. Displays: description, category, priority, creation date, progress percentage, related missions list, milestones reached
2. Mission list shows recent missions related to this goal (read-only)
3. Back navigation returns to Goals Overview (Screen F3)

### US-9: View Coaching History

**Priority:** P1 (High)

As a father, I want to see my recent coaching conversations, so that I can reflect on my coaching journey.

**Acceptance Criteria:**

1. Displays recent conversations (default 10, max 50): type, date, message count, summary, status
2. Does NOT display full message transcripts — only metadata and summary
3. Does NOT expose system prompts, AI telemetry, or internal metadata
4. Tapping a conversation shows conversation detail (Screen C2) with summary view
5. Empty state (no conversations yet) explains that coaching happens on WhatsApp

### US-10: Log Quality Time

**Priority:** P0 (Critical)

As a father, I want to log quality time spent with my child, so that my growth score reflects real-world parenting.

**Acceptance Criteria:**

1. Form collects: child (required, from father's children), duration in minutes (optional, 15–480 range), description (optional, max 200 chars), activity date (optional, defaults to today)
2. Activity date cannot be in the future or more than 7 days in the past
3. On success: shows confirmation with points awarded (12 pts), updated streak status, and encouraging message
4. Rate limit: max 10 quality time reports per day. If exceeded, shows friendly message that today's limit is reached
5. Duplicate detection: same (child, duration, date) combination rejected with clear explanation
6. Child validation: only shows children belonging to the father
7. Total flow completion under 30 seconds

### US-11: Log Positive Activity

**Priority:** P0 (Critical)

As a father, I want to log positive parenting moments, so that I'm recognized for daily wins.

**Acceptance Criteria:**

1. Form collects: activity type (required: PRAISE, SHARED_ACTIVITY, TEACHING_MOMENT, QUALITY_CONVERSATION, OTHER), child (optional), description (optional, max 200 chars), activity date (optional, defaults to today)
2. Same date constraints as quality time (not future, not >7 days past)
3. On success: shows confirmation with points awarded (5 pts), updated streak, encouraging message
4. Rate limit: max 20 positive activity reports per day
5. No duplicate detection (multiple positive activities of same type on same day are valid)
6. Flow completion under 30 seconds

### US-12: View Notifications

**Priority:** P1 (High)

As a father, I want to see my notifications, so that I don't miss important coaching moments.

**Acceptance Criteria:**

1. Displays paginated notification list: type, title, body, created_at, read status, priority
2. Supports mark-as-read (individual and bulk)
3. Unread count visible in navigation badge (Home tab or persistent header)
4. Badge is a simple dot or count — never red, never aggressive
5. Empty state: "No notifications right now. That's fine."

### US-13: View and Edit Profile

**Priority:** P2 (Medium)

As a father, I want to view and edit my profile, so that my coaching context stays accurate.

**Acceptance Criteria:**

1. Profile view displays: name, phone (masked), timezone, coaching style, preferred coaching time, language, coaching phase, days since activation
2. Edit allows: name, timezone, email changes
3. Profile mutations go through existing Application API — workspace provides read view
4. Confirmation on save with no page reload required

### US-14: Manage Children

**Priority:** P2 (Medium)

As a father, I want to add, edit, or archive children, so that coaching adapts to my family.

**Acceptance Criteria:**

1. Lists all children with edit/archive actions
2. Add child form: name (required), birth date (required, 0–18 years past), gender, interests, challenges
3. Maximum 8 children enforced
4. Archive confirmation required (non-reversible in UI)
5. Changes reflect immediately in dashboard and coaching context

### US-15: Edit Preferences

**Priority:** P2 (Medium)

As a father, I want to adjust my coaching preferences, so that the experience adapts to my needs.

**Acceptance Criteria:**

1. Editable: coaching style (GENTLE/BALANCED/DIRECT/MOTIVATIONAL), preferred coaching time, notification frequency, quiet hours
2. Changes saved through existing Application API
3. Confirmation that changes take effect on next coaching session

### US-16: WhatsApp Bridge

**Priority:** P1 (High)

As a father, I want easy access to WhatsApp coaching from the dashboard, so that I can continue coaching when motivated.

**Acceptance Criteria:**

1. Persistent, subtle WhatsApp link available from dashboard
2. Mobile: floating action button or prominent CTA
3. Desktop: sidebar prompt or persistent link
4. Never competes with dashboard content for attention
5. Opens WhatsApp directly (deep link to Dad Coach number)

---

## Functional Requirements

### FR-1: Partial Degradation

When any backend section is unavailable, the workspace:

1. Renders all available sections normally
2. Shows a neutral, non-alarming placeholder for unavailable sections
3. Does NOT show error modals or alert banners for partial failures
4. Does NOT retry automatically (refresh-on-navigation is sufficient)
5. Indicates degraded status only if the entire workspace summary fails

### FR-2: Empty States

Every screen has a designed empty state that:

1. Uses warm, inviting language per [Tone of Voice](../brand/TONE_OF_VOICE.md)
2. Never implies the father has failed or is behind
3. Provides a clear, optional next step
4. Uses illustrations sparingly per [Illustration Style](../design/ILLUSTRATION_STYLE.md)

| Screen | Empty State Message Pattern |
|--------|-----------------------------|
| Dashboard (first visit) | Welcome + explain coaching model |
| Achievements (none earned) | "Your first achievement is closer than you think" |
| Streak (zero) | "Every journey starts with day one" |
| Children (none) | "Add your children when you're ready" |
| Goals (none) | "Goals emerge through coaching conversations" |
| Conversations (none) | "Your coaching journey starts on WhatsApp" |
| Notifications (none) | "No notifications right now" |

### FR-3: Loading States

1. Initial page load: full skeleton screen matching final layout shape
2. Tab navigation: content area skeleton while preserving navigation chrome
3. Detail views: skeleton matching expected content structure
4. Activity submission: inline loading indicator on submit button
5. No spinners — skeleton screens only (Design Rule 18)
6. Loading states are calm and unhurried

### FR-4: Error States

1. Network failure: "We can't connect right now. We'll be back shortly." with optional retry
2. Server error (5xx): "Something didn't work on our end. Your progress is safe." with retry
3. Not found: Redirect to dashboard
4. Rate limited (429): "You've reached today's limit. Come back tomorrow." — friendly, never punitive
5. Validation errors: Inline field-level feedback, never modal alerts
6. All error copy follows [Tone of Voice](../brand/TONE_OF_VOICE.md) — conversations, not alerts

### FR-5: Celebration Events

1. When undisplayed celebration events exist, show a modal/overlay on dashboard load
2. Celebration types: BELT_LEVEL_UP, ACHIEVEMENT_EARNED, MILESTONE_REACHED, STREAK_MILESTONE
3. Display: event type, title, encouragement message (from backend)
4. After viewing, mark as displayed via API
5. Multiple pending celebrations shown sequentially, not simultaneously
6. Celebration feels dignified — warm glow, not party (per [Motion Philosophy](../design/MOTION_PHILOSOPHY.md))
7. Father can dismiss without interaction

### FR-6: Activity Logging Flow

1. Entry points: Coaching tab, dashboard CTA (if no recent activity)
2. Two distinct paths: "Log Quality Time" and "Log Positive Activity"
3. Minimum fields to submit: child + type (positive activity) or child + duration (quality time)
4. Confirmation screen shows: points awarded, streak impact, encouraging copy
5. After confirmation, return to previous screen with updated data
6. No multi-step wizard — single form submission

---

## Screen Mapping

All screens reference the [Screen Inventory](../ux/SCREEN_INVENTORY.md).

| User Story | Primary Screen | Secondary Screens |
|-----------|----------------|-------------------|
| US-1 | D1 (Dashboard Home) | — |
| US-2 | G1 (Growth Overview) | D1 (summary card) |
| US-3 | G2 (Achievements) | — |
| US-4 | G3 (Streak) | D1 (summary) |
| US-5 | F1 (Children Overview) | D1 (summary) |
| US-6 | F2 (Child Detail) | — |
| US-7 | F3 (Goals Overview) | — |
| US-8 | F4 (Goal Detail) | — |
| US-9 | C1 (Coaching History) | C2 (Conversation Detail) |
| US-10 | C3 (Activity Log) | C4 (Confirmation) |
| US-11 | C3 (Activity Log) | C4 (Confirmation) |
| US-12 | U1 (Notifications) | — |
| US-13 | P1 (Profile Overview) | P2 (Edit Profile) |
| US-14 | P3 (Children Management) | — |
| US-15 | P4 (Preferences) | — |
| US-16 | D1 (Dashboard) | All screens (persistent) |

---

## Navigation Impact

Per [Navigation Model](../ux/NAVIGATION_MODEL.md):

- **Entry point:** Authenticated father lands on Dashboard (D1) by default
- **Tab structure:** Home | Growth | Family | Coaching | Profile
- **No new navigation patterns introduced** — all screens fit within existing 5-tab model
- **Deep links:** Every screen has a unique URL for bookmark and notification support
- **WhatsApp bridge:** Persistent on all screens (FAB on mobile, sidebar link on desktop)

---

## User Journey Mapping

Per [User Journeys](../ux/USER_JOURNEYS.md):

| Journey | Workspace Role |
|---------|---------------|
| J2: Daily Check-in | Primary journey. Father arrives, glances at D1, leaves satisfied. |
| J3: Logging Activity | Father navigates to C3, logs activity, sees C4 confirmation. |
| J4: Reviewing Growth | Father explores G1→G2→G3 within Growth tab. |
| J5: Managing Family | Father navigates P3 (children) or P4 (preferences). |
| J6: First Dashboard | Empty state experience on D1 post-onboarding. |

---

## API Mapping

All endpoints are read from the existing backend (SPEC-008). The workspace frontend is a consumer, not an owner.

### Read Endpoints

| Feature | Endpoint | Response TTL | Loading Strategy |
|---------|----------|-------------|------------------|
| Workspace summary | `GET /api/v1/workspace/summary` | 60s (server cache) | Fetch on mount + stale-while-revalidate |
| Belt progression | `GET /api/v1/workspace/growth/belt` | 300s | Fetch on Growth tab mount |
| Score breakdown | `GET /api/v1/workspace/growth/score` | 300s | Fetch on Growth tab mount |
| Streak data | `GET /api/v1/workspace/growth/streak` | 120s | Fetch on Growth tab mount |
| Achievements | `GET /api/v1/workspace/growth/achievements` | 600s | Fetch on Achievements view |
| Celebrations (undisplayed) | `GET /api/v1/workspace/growth/celebrations?undisplayed_only=true` | None | Fetch on dashboard load |
| Children overview | `GET /api/v1/workspace/children` | 120s | Fetch on Family tab mount |
| Child detail | `GET /api/v1/workspace/children/{childId}/summary` | 120s | Fetch on drill-in |
| Goals overview | `GET /api/v1/workspace/goals` | 120s | Fetch on Family tab mount |
| Goal detail | `GET /api/v1/workspace/goals/{goalId}/progress` | 120s | Fetch on drill-in |
| Active missions | `GET /api/v1/workspace/missions/active` | 60s | Fetch on dashboard mount |
| Conversations | `GET /api/v1/workspace/conversations?limit=10` | 120s | Fetch on Coaching tab mount |
| Notifications | `GET /api/v1/workspace/notifications` | 30s | Fetch on notification badge tap |
| Profile | `GET /api/v1/workspace/profile` | N/A | Fetch on Profile tab mount |

### Write Endpoints

| Feature | Endpoint | Method | Optimistic Update |
|---------|----------|--------|-------------------|
| Log quality time | `/api/v1/workspace/activities/quality-time` | POST | Yes — show confirmation immediately, revert on failure |
| Log positive activity | `/api/v1/workspace/activities/positive-activity` | POST | Yes — show confirmation immediately, revert on failure |
| Mark celebrations displayed | `/api/v1/workspace/growth/celebrations/mark-displayed` | POST | Yes — dismiss modal immediately |
| Mark notifications read | `/api/v1/workspace/notifications/mark-read` | POST | Yes — update badge immediately |
| Mark all notifications read | `/api/v1/workspace/notifications/mark-all-read` | POST | Yes — clear badge immediately |

### Refresh Strategy

| Trigger | Action |
|---------|--------|
| Tab navigation | Revalidate stale data for that tab |
| Activity logging success | Invalidate dashboard summary + growth data |
| Celebration dismissed | Remove from local state |
| Pull-to-refresh (mobile) | Full revalidate of current tab |
| Page focus (after background) | Revalidate dashboard summary only |

---

## State Management

### Server State

All workspace data is server-owned. The frontend is a read-through cache.

- **Fetching:** Use a data-fetching library with built-in caching (e.g., React Query / TanStack Query pattern)
- **Stale-while-revalidate:** Show cached data immediately, revalidate in background
- **Cache keys:** Match backend cache keys: `workspace-summary`, `growth-belt`, `growth-streak`, etc.
- **Invalidation:** After mutations (activity log, mark-read), invalidate affected cache keys

### Client State

Minimal client state:

- Current tab / navigation position
- Activity logging form state (before submission)
- Celebration modal queue (pending celebrations)
- Notification filter state (if implemented)

### Optimistic Updates

- Activity logging: Show confirmation screen immediately, revert to form with error on failure
- Mark-as-read: Update badge count immediately, re-fetch on failure
- Celebration dismiss: Remove modal immediately, fire-and-forget the mark-displayed call

---

## Data Requirements

### Key DTOs (from backend)

**WorkspaceSummaryResponse:**
```
father_display_name, coaching_phase, current_belt, growth_score,
active_children_count, active_goals_count, current_streak_days,
active_mission (nullable), last_conversation_timestamp,
unread_notifications_count, response_status, degraded_sections[]
```

**BeltProgressionResponse:**
```
current_belt, current_score, next_belt (nullable for BLACK),
points_to_next_belt, progress_percentage_to_next_belt, belt_earned_at
```

**StreakResponse:**
```
current_streak_days, longest_streak_days, streak_start_date,
last_qualifying_interaction_date, streak_at_risk (not exposed in UI)
```

**AchievementsResponse:**
```
total_available, total_earned,
achievements[]: { achievement_id, name, description, category, icon_key, earned_at (nullable) },
next_achievable: { achievement_id, name, description }
```

**ChildOverviewItem:**
```
child_id, name, computed_age, active_goals_count,
completed_missions_count, recent_mission (nullable), interests[]
```

**GoalOverviewItem:**
```
goal_id, description, category, priority, progress_percentage,
related_child (nullable), missions_completed_count, missions_remaining_estimate
```

**NotificationItem:**
```
notification_id, type, title, body, created_at, read_at (nullable),
action_url (nullable), priority (HIGH/MEDIUM/LOW)
```

### Pagination

- Conversations: offset-based, default 10, max 50
- Notifications: offset-based, default 20
- Goals: no pagination expected (small set per father)
- Children: no pagination (max 8)
- Achievements: no pagination (fixed set ~15)

---

## Accessibility

### Keyboard Navigation

- All interactive elements reachable via Tab
- Logical tab order follows visual layout (top-to-bottom, left-to-right in LTR; mirrored in RTL)
- Enter/Space activates buttons and links
- Escape closes modals (celebration, notifications panel)
- Arrow keys navigate within tab bars and segmented controls

### Screen Readers

- All images and icons have descriptive alt text or aria-labels
- Belt progression announces: "Current belt: Green. 250 points to Blue belt."
- Achievement status announces: "First Steps achievement. Earned on June 15, 2026."
- Notifications announce unread count on badge
- Loading states announce "Loading" to assistive technology
- Error states announce error message

### Focus Management

- On tab navigation, focus moves to first content element of new tab
- Modal open: focus trapped within modal
- Modal close: focus returns to trigger element
- Form submission error: focus moves to first invalid field

### RTL Support

- Hebrew (RTL) and English (LTR) both supported
- Layout mirrors: navigation, reading direction, form alignment
- Icons that imply direction (arrows, progress) flip in RTL
- Numbers and dates remain LTR even in RTL context
- Text alignment follows language direction

### Contrast

- All text meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
- Interactive elements meet 3:1 against adjacent colors
- Belt colors distinguishable for color-blind users (not relying on color alone — include label text)

---

## Responsive Behavior

### Desktop (> 1024px)

- Persistent left sidebar navigation
- Content area: max-width constrained, centered
- Growth section: belt + score side by side
- Children/goals: card grid (2–3 columns)
- Activity form: centered, narrow column

### Tablet (768–1024px)

- Bottom tab bar or collapsible sidebar
- Content fills viewport width with generous padding
- Cards stack to 2 columns or single column
- Same information density as mobile

### Mobile (< 768px)

- Bottom tab bar (persistent)
- Single column layout
- Touch targets: minimum 44×44px
- One-handed use assumed (Design Rule 24)
- Pull-to-refresh on scrollable content
- FAB for WhatsApp bridge

---

## Performance

### Loading Strategy

- **Critical path:** Dashboard summary (fetched immediately on auth)
- **Tab-level prefetch:** Growth and Family data prefetched on dashboard mount
- **Deferred:** Conversation history, notifications (fetched on tab activation)
- **On-demand:** Child detail, goal detail (fetched on drill-in)

### Caching

- Client-side: stale-while-revalidate pattern
- Background revalidation on tab focus
- Cache persists across session (in-memory, cleared on logout)

### Bundle Optimization

- Route-level code splitting (each tab is a separate chunk)
- Lazy-load: celebration modal, activity forms, profile edit
- Belt/achievement graphics: SVG loaded from `public/belts/` and `public/achievements/`
- No unnecessary third-party libraries for simple data display

### Expected Response Times

| Interaction | Target |
|------------|--------|
| Dashboard first load (cold) | < 2s perceived |
| Tab switch (cached) | < 300ms |
| Tab switch (stale, revalidating) | < 500ms |
| Activity form submit | < 1s to confirmation |
| Celebration modal appear | < 500ms after dashboard load |

---

## Security

### Authentication

- All workspace routes are protected (require authenticated father)
- Unauthenticated access redirects to login/onboarding entry
- Authentication mechanism is an implementation decision (JWT, session, etc.) — see Open Questions

### Protected Routes

- `/dashboard/**` — all workspace screens
- `/growth/**` — growth section
- `/family/**` — children and goals
- `/coaching/**` — history and activity log
- `/profile/**` — settings and management
- `/notifications` — notification list

### Authorization

- Workspace endpoints enforce father-owns-resource model
- Frontend does not need to enforce ownership (backend returns 404 for cross-father access)
- No admin views in this specification

### Session Handling

- Session timeout behavior: redirect to re-authentication
- No sensitive data stored in localStorage
- Auth tokens stored per security best practices (httpOnly cookies preferred)

---

## Analytics

### Page Views

- Dashboard viewed
- Growth tab viewed (belt / achievements / streak sub-views)
- Family tab viewed (children / goals sub-views)
- Coaching tab viewed
- Profile tab viewed

### Key Events

| Event | Properties | Purpose |
|-------|-----------|---------|
| `activity_logged` | type (quality_time / positive_activity), child_id, points_awarded | Measure activity logging adoption |
| `celebration_viewed` | event_type, belt_level (if applicable) | Measure celebration engagement |
| `celebration_dismissed` | event_type, time_viewed_ms | Understand celebration attention |
| `achievement_viewed` | achievement_id, earned (boolean) | Understand achievement engagement |
| `whatsapp_bridge_clicked` | source_screen | Measure web-to-WhatsApp handoff |
| `notification_opened` | notification_type, priority | Measure notification value |
| `profile_updated` | fields_changed[] | Track profile completeness |

### Funnels

1. **Activity Logging Funnel:** Open form → Select type → Select child → Submit → Confirmation
2. **Growth Exploration Funnel:** Dashboard → Growth tab → Achievements → Specific achievement

### KPIs

- Weekly Active Dashboard Users
- Activity logs per user per week
- Average session duration on dashboard
- Celebration view rate (celebrations viewed / celebrations earned)
- WhatsApp bridge click-through rate

---

## Testing Considerations

### Happy Paths

- Dashboard loads with all sections populated
- Belt progression shows current state and progress
- Achievements display earned and unearned correctly
- Activity logging submits successfully, shows points
- Celebrations display and dismiss correctly
- Navigation between all tabs works

### Validation Testing

- Activity logging: duration out of range (< 15, > 480)
- Activity logging: date in future
- Activity logging: date > 7 days past
- Activity logging: child not belonging to father (backend rejects)
- Children management: > 8 children attempted
- Children management: birth date > 18 years past

### Edge Cases

- Father with no children, no goals, no conversations (all empty states)
- Father with BLACK belt (no "next belt" to display)
- Father with zero streak (fresh start messaging)
- Partial degradation (growth system unavailable, rest loads)
- Rate limit hit on activity logging (429 response)
- Duplicate quality time report rejected

### Error Handling

- Network offline: show offline state, cached data if available
- API 500: show error state per screen, allow retry
- API 401: redirect to authentication
- API 404 on drill-in: redirect to parent list

### Regression Scenarios

- After belt level-up, dashboard summary reflects new belt
- After activity logged, growth score increments
- After notification marked read, badge count decrements
- After child archived, child disappears from overview

---

## Risks

### UX Risks

| Risk | Mitigation |
|------|-----------|
| Dashboard feels empty for new fathers | Designed empty state (US-1, FR-2) with warm welcome |
| Progress display feels like surveillance | No "streak at risk," no punitive language, no red indicators |
| Activity logging feels like homework | Minimal required fields, encouraging confirmation, under 30s |
| Too much data on dashboard | Progressive disclosure — summary only, details on drill-in |

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| Backend APIs not fully implemented | Partial degradation handles missing endpoints gracefully |
| Authentication mechanism undefined | Spec is auth-agnostic; routes are protected regardless of method |
| Belt graphics not yet created | Graceful fallback to text-based belt name |
| Client cache staleness | Stale-while-revalidate pattern + invalidation on mutations |

### Dependency Risks

| Risk | Mitigation |
|------|-----------|
| Backend SPEC-008 phases 4–7 incomplete | Frontend can build against API contract; partial degradation handles gaps |
| Asset delivery (belts, achievements) | .gitkeep folders exist; can implement with placeholder text until assets arrive |
| Onboarding spec not yet written | Workspace assumes father is authenticated and activated |

---

## Open Questions

1. **Authentication mechanism:** What authentication strategy will the web application use? (JWT in httpOnly cookie? OAuth flow? Magic link?) This affects protected route implementation, token refresh, and session timeout behavior.

2. **Onboarding session resumption:** When a father returns to an in-progress onboarding session (within 72h), should the web show a "welcome back" acknowledgment or silently restore their position?

3. **Notification delivery timing:** How frequently should the frontend poll for notification count updates? On every navigation? On a timer? Only on explicit refresh?

4. **Celebration display trigger:** When undisplayed celebration events exist, should they appear immediately on dashboard load, or after a brief delay to let the father orient?

5. **Profile mutations:** Profile edits (name, timezone) are performed through the Application API (not workspace API). What is the exact endpoint? Is it documented in an existing specification?

6. **Conversation summary content:** The backend returns a `summary` field for conversations. Is this always available, or only for completed conversations? What is the expected length?

7. **Belt graphics source:** Will belt graphics be custom illustrations, or are they being sourced from an external designer? This affects the `public/belts/` folder population timeline.

---

## Related Documents

| Document | Relationship |
|----------|-------------|
| [Screen Inventory](../ux/SCREEN_INVENTORY.md) | Defines all screens referenced here |
| [User Journeys](../ux/USER_JOURNEYS.md) | Defines journeys this spec enables |
| [Navigation Model](../ux/NAVIGATION_MODEL.md) | Defines navigation patterns used |
| [Feature Map](../ux/FEATURE_MAP.md) | Maps features to screens and APIs |
| [Design Language](../design/DESIGN_LANGUAGE.md) | Design rules that constrain implementation |
| [Tone of Voice](../brand/TONE_OF_VOICE.md) | Copy patterns for empty states, errors, celebrations |
| [Anti-Goals](../brand/ANTI_GOALS.md) | Boundaries that prevent harmful patterns |
| [North Star](../brand/NORTH_STAR.md) | The metric this workspace ultimately serves |
