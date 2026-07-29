# Screen Inventory

## Overview

This document catalogs every screen in the Dad Coach web application. Each screen has a single purpose, maps to the [navigation model](./NAVIGATION_MODEL.md), and serves a specific [user journey](./USER_JOURNEYS.md).

---

## Onboarding Flow Screens

| # | Screen | Purpose | Required | Nav Context |
|---|--------|---------|----------|-------------|
| O1 | Welcome | Value proposition, set emotional tone | Yes | Linear stepper |
| O2 | Language Selection | Choose Hebrew/English (RTL/LTR) | Yes | Linear stepper |
| O3 | Father Profile | Name, phone, timezone | Yes | Linear stepper |
| O4 | Children Setup | Add children with birth date, interests | No (skippable) | Linear stepper |
| O5 | Goals Selection | Choose parenting goals | No (skippable) | Linear stepper |
| O6 | Preferences | Coaching style, timing, notifications | No (skippable) | Linear stepper |
| O7 | Review | Confirm all provided information | Yes | Linear stepper |
| O8 | Activation | WhatsApp deep link + status confirmation | Yes | Linear stepper |

---

## Dashboard Screens (Post-Activation)

### Home Tab

| # | Screen | Purpose | Data Displayed |
|---|--------|---------|----------------|
| D1 | Dashboard Home | At-a-glance summary of everything | Belt, streak, active mission, recent coaching, children status, notifications count |

### Growth Tab

| # | Screen | Purpose | Data Displayed |
|---|--------|---------|----------------|
| G1 | Growth Overview | Belt progress and score | Current belt, score, progress to next belt, recent signals |
| G2 | Achievements | Earned and available badges | Achievement list with earned status, next achievable |
| G3 | Streak | Consistency tracking | Current streak, longest streak, milestone history |
| G4 | Statistics (future) | Patterns and trends | Weekly/monthly engagement, quality time totals |

### Family Tab

| # | Screen | Purpose | Data Displayed |
|---|--------|---------|----------------|
| F1 | Children Overview | All children at a glance | Per child: name, age, recent mission, goals count |
| F2 | Child Detail | Deep view of one child | Missions history, active goals, interests, challenges, upcoming birthday |
| F3 | Goals Overview | All active goals | Per goal: description, progress %, child, priority |
| F4 | Goal Detail | Single goal progress | Missions completed/remaining, child context, category |

### Coaching Tab

| # | Screen | Purpose | Data Displayed |
|---|--------|---------|----------------|
| C1 | Coaching History | Recent conversations | List of recent coaching sessions: type, date, summary |
| C2 | Conversation Detail | Review a past session | Message exchange summary (read-only, not full transcript) |
| C3 | Activity Log | Log quality time or positive activities | Activity type selection, child, duration, description |
| C4 | Activity Confirmation | Confirm logged activity | Points awarded, streak impact, encouragement |

### Profile Tab

| # | Screen | Purpose | Data Displayed |
|---|--------|---------|----------------|
| P1 | Profile Overview | Account summary | Name, phone (masked), timezone, coaching style, language, days active |
| P2 | Edit Profile | Modify personal details | Editable fields: name, timezone, email |
| P3 | Children Management | Add/edit/archive children | Full CRUD for children |
| P4 | Preferences | Coaching and notification settings | Style, timing, frequency, quiet hours |
| P5 | Account | Account-level actions | Pause, delete, language change |

---

## Utility Screens

| # | Screen | Purpose | Trigger |
|---|--------|---------|---------|
| U1 | Notifications List | All notifications | Notification badge tap |
| U2 | Celebration Modal | Achievement/belt earned | Triggered by undisplayed celebration event |
| U3 | Error State | Graceful degradation | API failure |
| U4 | Offline State | No connection | Network unavailable |
| U5 | Loading State | Content loading | Initial page load, navigation |

---

## Screen Count Summary

| Area | Screens |
|------|---------|
| Onboarding | 8 |
| Dashboard | 1 |
| Growth | 4 |
| Family | 4 |
| Coaching | 4 |
| Profile | 5 |
| Utility | 5 |
| **Total** | **31** |

---

## Screen Relationships

```
Onboarding (O1→O8) ──completes──→ Dashboard Home (D1)

D1 ──navigates to──→ G1, F1, C1, P1, U1
G1 ──contains──→ G2, G3, G4
F1 ──drills into──→ F2
F1 ──navigates to──→ F3
F3 ──drills into──→ F4
C1 ──drills into──→ C2
C1 ──navigates to──→ C3 ──confirms──→ C4
P1 ──navigates to──→ P2, P3, P4, P5
```

---

## Related Documents

- [NAVIGATION_MODEL.md](./NAVIGATION_MODEL.md) — how screens are reached
- [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) — how content is organized within screens
- [USER_JOURNEYS.md](./USER_JOURNEYS.md) — how screens serve user tasks
- [FEATURE_MAP.md](./FEATURE_MAP.md) — which features map to which screens
- [Design Language](../design/DESIGN_LANGUAGE.md) — one primary action per screen
