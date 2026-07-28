# Feature Map

## Overview

This document maps all user-facing features, their relationships, dependencies, and implementation priority. It connects product capabilities to screens and user journeys.

---

## Feature Categories

### 1. Onboarding & Activation

| Feature | Description | Priority | Screens | Journey |
|---------|-------------|----------|---------|---------|
| Invitation validation | Verify invitation link and display welcome | MVP | O1 | J1 |
| Language selection | RTL/LTR language choice | MVP | O2 | J1 |
| Profile creation | Father registration form | MVP | O3 | J1 |
| Children registration | Add children during onboarding | MVP | O4 | J1 |
| Goal selection | Choose parenting goals | MVP | O5 | J1 |
| Preference setup | Coaching style & timing | MVP | O6 | J1 |
| Review & confirm | Summary before activation | MVP | O7 | J1 |
| WhatsApp activation | Deep link + status polling | MVP | O8 | J1 |
| Session persistence | Resume onboarding across devices | MVP | All O* | J1 |

### 2. Dashboard & Summary

| Feature | Description | Priority | Screens | Journey |
|---------|-------------|----------|---------|---------|
| Workspace summary | Aggregated overview of all key data | MVP | D1 | J2 |
| Partial degradation | Graceful display when some data unavailable | MVP | D1 | J2 |
| Empty state (first visit) | Warm welcome for new users | MVP | D1 | J6 |
| WhatsApp bridge | Clear CTA to open WhatsApp | MVP | D1 | J2 |

### 3. Growth System

| Feature | Description | Priority | Screens | Journey |
|---------|-------------|----------|---------|---------|
| Belt display | Current belt and progress to next | MVP | G1, D1 | J4 |
| Score breakdown | Points by category | MVP | G1 | J4 |
| Achievement gallery | Earned and available achievements | MVP | G2 | J4 |
| Streak tracking | Current, longest, milestones | MVP | G3 | J4 |
| Celebration events | Display belt-ups, achievements earned | MVP | U2 | J4 |
| Statistics dashboard | Weekly/monthly patterns | Future | G4 | J4 |

### 4. Family Management

| Feature | Description | Priority | Screens | Journey |
|---------|-------------|----------|---------|---------|
| Children overview | All children at a glance | MVP | F1 | J2 |
| Child detail | Full child view with missions, goals | MVP | F2 | J5 |
| Goals overview | All goals with progress | MVP | F3 | J2 |
| Goal detail | Single goal deep view | MVP | F4 | J4 |
| Add/edit children | Post-onboarding child management | MVP | P3 | J5 |
| Birthday indicator | Upcoming birthday highlight | Future | F1, F2 | — |

### 5. Coaching & Activity

| Feature | Description | Priority | Screens | Journey |
|---------|-------------|----------|---------|---------|
| Conversation history | Recent coaching sessions list | MVP | C1 | J2 |
| Conversation detail | Review past session summary | MVP | C2 | — |
| Log quality time | Record time spent with child | MVP | C3, C4 | J3 |
| Log positive activity | Record praise, teaching, etc. | MVP | C3, C4 | J3 |
| Active mission display | Current mission on dashboard | MVP | D1 | J2 |

### 6. Notifications

| Feature | Description | Priority | Screens | Journey |
|---------|-------------|----------|---------|---------|
| Unread count | Badge on navigation | MVP | All | J2 |
| Notification list | Paginated notifications | MVP | U1 | — |
| Mark as read | Single and bulk | MVP | U1 | — |

### 7. Profile & Settings

| Feature | Description | Priority | Screens | Journey |
|---------|-------------|----------|---------|---------|
| View profile | Read-only profile display | MVP | P1 | — |
| Edit profile | Modify name, timezone | MVP | P2 | J5 |
| Edit preferences | Coaching style, timing, notifications | MVP | P4 | J5 |
| Pause account | Temporary pause (max 30 days) | Future | P5 | — |
| Delete account | Permanent deletion request | Future | P5 | — |

---

## Feature Dependencies

```
Invitation Validation ──enables──→ Onboarding Flow
Onboarding Flow ──enables──→ WhatsApp Activation
WhatsApp Activation ──enables──→ Dashboard Access

Dashboard Summary ──depends on──→ Growth System + Family Data + Coaching Data
Belt Display ──depends on──→ Growth Signals (from WhatsApp coaching)
Streak Tracking ──depends on──→ Qualifying Interactions (from WhatsApp)
Achievement Gallery ──depends on──→ Achievement Evaluation (backend)
Activity Logging ──feeds──→ Growth Score + Streak
Celebration Events ──triggered by──→ Belt Advancement + Achievement Earned + Streak Milestone
```

---

## MVP vs. Future Scope

### MVP (Launch)

Core loop: Onboard → Activate WhatsApp → Track progress → Log activities → See growth

- Full onboarding flow
- Dashboard with workspace summary
- Belt, streak, achievements display
- Children and goals overview
- Conversation history (read-only)
- Activity logging (quality time + positive activity)
- Basic notifications
- Profile management

### Future Iterations

- Statistics dashboard (weekly/monthly trends)
- Activity feed (chronological timeline)
- Quick actions (contextual suggestions)
- Birthday celebrations and reminders
- Account pause/delete
- Advanced notification preferences
- Goal creation from web (currently WhatsApp-only)

---

## Feature-to-Backend API Mapping

| Feature | Backend API Endpoint |
|---------|---------------------|
| Workspace summary | `GET /api/v1/workspace/summary` |
| Belt progression | `GET /api/v1/workspace/growth/belt` |
| Score breakdown | `GET /api/v1/workspace/growth/score` |
| Streak data | `GET /api/v1/workspace/growth/streak` |
| Achievements | `GET /api/v1/workspace/growth/achievements` |
| Celebrations | `GET /api/v1/workspace/growth/celebrations` |
| Children overview | `GET /api/v1/workspace/children` |
| Child detail | `GET /api/v1/workspace/children/{childId}/summary` |
| Goals overview | `GET /api/v1/workspace/goals` |
| Goal detail | `GET /api/v1/workspace/goals/{goalId}/progress` |
| Active missions | `GET /api/v1/workspace/missions/active` |
| Conversation history | `GET /api/v1/workspace/conversations` |
| Log quality time | `POST /api/v1/workspace/activities/quality-time` |
| Log positive activity | `POST /api/v1/workspace/activities/positive-activity` |
| Notifications | `GET /api/v1/workspace/notifications` |
| Profile | `GET /api/v1/workspace/profile` |

---

## Related Documents

- [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) — which screens each feature lives on
- [USER_JOURNEYS.md](./USER_JOURNEYS.md) — how features serve user tasks
- [NAVIGATION_MODEL.md](./NAVIGATION_MODEL.md) — how features are accessed
- [Product Overview](../brand/PRODUCT.md) — core pillars these features deliver
- [North Star](../brand/NORTH_STAR.md) — the metric all features serve
