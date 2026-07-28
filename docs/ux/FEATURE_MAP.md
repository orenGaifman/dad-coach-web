# Feature Map

## Overview

This document maps all user-facing features, their relationships, dependencies, implementation priority, and platform ownership. It connects product capabilities to screens, user journeys, and backend APIs.

---

## Ownership

### Platform Responsibilities

Each feature belongs to exactly one platform as its owner. Other platforms may consume or display related data, but only the owner initiates or controls the interaction.

#### Web Owns

| Feature | Why Web |
|---------|---------|
| Registration & onboarding | Form-based wizard, multi-step input |
| WhatsApp activation handshake | Deep link presentation, status polling |
| Progress dashboard display | Visual data aggregation, charts, belt visualization |
| Activity logging (quality time, positive activity) | Structured form input |
| Achievement gallery | Visual collection, browse/explore pattern |
| Profile management | Form editing (name, timezone, email) |
| Children management (add/edit/archive) | CRUD forms |
| Preference management | Settings forms |
| Notification list display | Paginated list, mark-as-read |
| Celebration display | Modal/overlay triggered by undisplayed events |

#### WhatsApp Owns

| Feature | Why WhatsApp |
|---------|--------------|
| AI coaching conversations | Conversational, contextual, real-time |
| Mission delivery & acceptance | Part of coaching flow |
| Mission completion & reflection | Conversational follow-up |
| Goal progress (via mission completion) | Side-effect of coaching interaction |
| Daily engagement prompts | Scheduled outbound messages |
| Streak qualification | Triggered by WhatsApp interactions |
| Inactivity re-engagement | Template messages |
| Difficult situation support | Immediate, conversational |

#### Backend Owns (Neither Platform Controls)

| Feature | Why Backend |
|---------|-------------|
| Growth signal processing | Event-driven, computed from multiple sources |
| Belt evaluation & promotion | Business logic, threshold calculation |
| Streak calculation & reset | Timezone-aware daily job |
| Achievement evaluation | Criteria-based, triggered by signals |
| Mission generation | AI-powered, context-dependent |
| Notification scheduling | Time-based, quiet-hours aware |
| Statistics aggregation | Nightly batch processing |

---

## Feature Categories

### 1. Onboarding & Activation

The MVP entry point is invitation-only. There is no public marketing landing page. Fathers arrive via a shared invitation link (`/join/{token}`).

| Feature | Description | Priority | Screens | Journey | Owner |
|---------|-------------|----------|---------|---------|-------|
| Invitation validation | Verify token, display welcome | MVP | O1 | J1 | Web |
| Language selection | RTL/LTR language choice | MVP | O2 | J1 | Web |
| Profile creation | Father registration form | MVP | O3 | J1 | Web |
| Children registration | Add children during onboarding | MVP | O4 | J1 | Web |
| Goal selection | Choose parenting goals | MVP | O5 | J1 | Web |
| Preference setup | Coaching style & timing | MVP | O6 | J1 | Web |
| Review & confirm | Summary before activation | MVP | O7 | J1 | Web |
| WhatsApp activation | Deep link + status polling | MVP | O8 | J1 | Web |
| Session persistence | Resume onboarding across devices (72h) | MVP | All O* | J1 | Web |

### 2. Dashboard & Summary

| Feature | Description | Priority | Screens | Journey | Owner |
|---------|-------------|----------|---------|---------|-------|
| Workspace summary | Aggregated overview of all key data | MVP | D1 | J2 | Web |
| Partial degradation | Graceful display when some data unavailable | MVP | D1 | J2 | Web |
| Empty state (first visit) | Warm welcome for new users | MVP | D1 | J6 | Web |
| WhatsApp bridge | Clear CTA to open WhatsApp | MVP | D1 | J2 | Web |

### 3. Growth System

| Feature | Description | Priority | Screens | Journey | Owner |
|---------|-------------|----------|---------|---------|-------|
| Belt display | Current belt and progress to next | MVP | G1, D1 | J4 | Web (display) |
| Score breakdown | Points by category | MVP | G1 | J4 | Web (display) |
| Achievement gallery | Earned and available achievements | MVP | G2 | J4 | Web (display) |
| Streak tracking | Current, longest, milestones | MVP | G3 | J4 | Web (display) |
| Celebration events | Display belt-ups, achievements earned | MVP | U2 | J4 | Web (display) |
| Statistics dashboard | Weekly/monthly patterns | Future | G4 | J4 | Web (display) |
| Growth signal recording | Emit signals from interactions | MVP | — | — | Backend |
| Belt evaluation | Promote belt when threshold crossed | MVP | — | — | Backend |
| Achievement evaluation | Award achievements when criteria met | MVP | — | — | Backend |
| Streak reset job | Daily timezone-aware streak calculation | MVP | — | — | Backend |

### 4. Family Management

| Feature | Description | Priority | Screens | Journey | Owner |
|---------|-------------|----------|---------|---------|-------|
| Children overview | All children at a glance | MVP | F1 | J2 | Web |
| Child detail | Full child view with missions, goals | MVP | F2 | J5 | Web |
| Goals overview | All goals with progress | MVP | F3 | J2 | Web |
| Goal detail | Single goal deep view | MVP | F4 | J4 | Web |
| Add/edit children | Post-onboarding child management | MVP | P3 | J5 | Web |
| Birthday indicator | Upcoming birthday highlight | Future | F1, F2 | — | Web |

### 5. Coaching & Activity

| Feature | Description | Priority | Screens | Journey | Owner |
|---------|-------------|----------|---------|---------|-------|
| Conversation history | Recent coaching sessions list (read-only) | MVP | C1 | J2 | Web (display) |
| Conversation detail | Review past session summary (read-only) | MVP | C2 | — | Web (display) |
| Log quality time | Record time spent with child | MVP | C3, C4 | J3 | Web |
| Log positive activity | Record praise, teaching, etc. | MVP | C3, C4 | J3 | Web |
| Active mission display | Current mission on dashboard | MVP | D1 | J2 | Web (display) |
| AI coaching delivery | Daily coaching via conversation | MVP | — | — | WhatsApp |
| Mission assignment | Generate and deliver missions | MVP | — | — | WhatsApp |
| Mission completion flow | Confirm completion, trigger reflection | MVP | — | — | WhatsApp |

### 6. Notifications

| Feature | Description | Priority | Screens | Journey | Owner |
|---------|-------------|----------|---------|---------|-------|
| Unread count | Badge on navigation | MVP | All | J2 | Web (display) |
| Notification list | Paginated notifications | MVP | U1 | — | Web |
| Mark as read | Single and bulk | MVP | U1 | — | Web |
| Notification scheduling | Create/deliver at right time | MVP | — | — | Backend |

### 7. Profile & Settings

| Feature | Description | Priority | Screens | Journey | Owner |
|---------|-------------|----------|---------|---------|-------|
| View profile | Read-only profile display | MVP | P1 | — | Web |
| Edit profile | Modify name, timezone | MVP | P2 | J5 | Web |
| Edit preferences | Coaching style, timing, notifications | MVP | P4 | J5 | Web |
| Pause account | Temporary pause (max 30 days) | Future | P5 | — | Web |
| Delete account | Permanent deletion request | Future | P5 | — | Web |

---

## Feature Dependencies

```
Invitation Validation ──enables──→ Onboarding Flow
Onboarding Flow ──enables──→ WhatsApp Activation
WhatsApp Activation ──enables──→ Dashboard Access
WhatsApp Activation ──enables──→ First Coaching (WhatsApp)

First Coaching (WhatsApp) ──generates──→ Growth Signals (Backend)
Growth Signals ──triggers──→ Belt Evaluation (Backend)
Growth Signals ──triggers──→ Achievement Evaluation (Backend)
Growth Signals ──updates──→ Streak (Backend)

Belt/Achievement/Streak ──displayed by──→ Dashboard (Web)
Celebration Events ──triggered by──→ Belt/Achievement/Streak (Backend)
Celebration Events ──displayed by──→ Celebration Modal (Web)

Activity Logging (Web) ──generates──→ Growth Signals (Backend)
Activity Logging (Web) ──updates──→ Streak (Backend)
```

---

## MVP vs. Future Scope

### MVP (Launch)

Core loop: **Onboard (Web) → Activate (WhatsApp) → Coach (WhatsApp) → Track (Web) → Log (Web) → Grow**

- Full onboarding flow with WhatsApp activation
- Dashboard with workspace summary
- Belt, streak, achievements display
- Children and goals overview
- Conversation history (read-only summaries)
- Activity logging (quality time + positive activity)
- Basic notifications (list, unread count, mark-as-read)
- Profile and preference management

### Future Iterations

- Statistics dashboard (weekly/monthly trends)
- Activity feed (chronological timeline)
- Quick actions (contextual suggestions)
- Birthday celebrations and reminders
- Account pause/delete
- Advanced notification preferences
- Goal creation from web

---

## Feature-to-Backend API Mapping

| Web Feature | Backend API Endpoint | Method |
|-------------|---------------------|--------|
| Workspace summary | `/api/v1/workspace/summary` | GET |
| Belt progression | `/api/v1/workspace/growth/belt` | GET |
| Score breakdown | `/api/v1/workspace/growth/score` | GET |
| Streak data | `/api/v1/workspace/growth/streak` | GET |
| Achievements | `/api/v1/workspace/growth/achievements` | GET |
| Celebrations | `/api/v1/workspace/growth/celebrations` | GET |
| Mark celebrations displayed | `/api/v1/workspace/growth/celebrations/mark-displayed` | POST |
| Children overview | `/api/v1/workspace/children` | GET |
| Child detail | `/api/v1/workspace/children/{childId}/summary` | GET |
| Goals overview | `/api/v1/workspace/goals` | GET |
| Goal detail | `/api/v1/workspace/goals/{goalId}/progress` | GET |
| Active missions | `/api/v1/workspace/missions/active` | GET |
| Conversation history | `/api/v1/workspace/conversations` | GET |
| Log quality time | `/api/v1/workspace/activities/quality-time` | POST |
| Log positive activity | `/api/v1/workspace/activities/positive-activity` | POST |
| Notifications | `/api/v1/workspace/notifications` | GET |
| Mark notifications read | `/api/v1/workspace/notifications/mark-read` | POST |
| Mark all notifications read | `/api/v1/workspace/notifications/mark-all-read` | POST |
| Profile | `/api/v1/workspace/profile` | GET |

---

## Related Documents

- [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) — which screens each feature lives on
- [USER_JOURNEYS.md](./USER_JOURNEYS.md) — how features serve user tasks
- [NAVIGATION_MODEL.md](./NAVIGATION_MODEL.md) — how features are accessed
- [Product Overview](../brand/PRODUCT.md) — core pillars these features deliver
- [North Star](../brand/NORTH_STAR.md) — the metric all features serve
- [Anti-Goals](../brand/ANTI_GOALS.md) — what we refuse to build
