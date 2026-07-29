# Information Architecture

## Overview

This document defines how information is organized, grouped, and prioritized within the Dad Coach web application. The structure must support two distinct modes: the linear onboarding flow, and the ambient dashboard experience.

## Architectural Principle

**Shallow and wide, never deep and narrow.** Fathers should be able to reach any piece of information within 2 taps from the dashboard. Deep hierarchies create cognitive overhead and hide value.

---

## Top-Level Content Areas

The web application has two primary modes, each with its own information architecture:

### Mode 1: Onboarding

A linear, step-by-step wizard. The father moves forward through a defined sequence. Information is revealed progressively — only what's relevant to the current step.

```
Onboarding
├── Welcome
├── Language
├── Father Profile
├── Children (optional)
├── Goals (optional)
├── Preferences (optional)
├── Review
└── Activation
```

### Mode 2: Dashboard (Post-Activation)

A hub-and-spoke model. The dashboard is the hub; all other areas are one level deep.

```
Dashboard (Hub)
├── Growth
│   ├── Belt & Score
│   ├── Achievements
│   ├── Streak
│   └── Statistics (future)
├── Children
│   └── [Child Detail]
│       ├── Recent Missions
│       ├── Goals
│       └── Interests
├── Goals
│   └── [Goal Detail]
│       ├── Progress
│       └── Related Missions
├── Coaching History
│   └── [Conversation Summary]
├── Activity Log
│   ├── Log Quality Time
│   └── Log Positive Activity
├── Notifications
└── Profile & Settings
    ├── Profile Details
    ├── Children Management
    ├── Preferences
    └── Account
```

---

## Content Priority (Dashboard Hub)

The dashboard presents information in priority order based on what matters most to a returning father:

| Priority | Content | Why |
|----------|---------|-----|
| 1 | Current state summary | Belt, streak, active mission — "Where am I?" |
| 2 | Recent coaching activity | Last interaction, next expected — "What's happening?" |
| 3 | Growth progress | Progress toward next belt — "Am I improving?" |
| 4 | Children overview | Quick status per child — "How are my kids doing in the system?" |
| 5 | Notifications | Unread items — "Do I need to do anything?" |

## Information Grouping Logic

### Group by Meaning, Not by Data Type

Information is grouped by what it means to the father, not by how it's stored:

- **"My Progress"** = belt + streak + achievements + score (not "gamification system")
- **"My Family"** = children + their missions + their goals (not "child entities")
- **"My Coaching"** = conversation history + active mission (not "conversation engine output")

### Temporal Organization

- Recent content surfaces first everywhere
- History is available but never forced
- Future items (upcoming birthdays, goals nearing completion) surface contextually

---

## Content Relationships

```
Father Profile ──owns──→ Children
                ──pursues──→ Goals
                ──engages──→ Coaching Conversations
                ──earns──→ Growth (Belt, Achievements, Streak)
                ──logs──→ Activities

Children ──participate in──→ Missions
         ──linked to──→ Goals

Goals ──measured by──→ Mission Completions
      ──assigned to──→ Children (optional)

Missions ──generated from──→ Goals + Child Context
         ──contribute to──→ Growth Score
```

---

## Data Freshness Expectations

| Content | Expected Freshness | Rationale |
|---------|--------------------|-----------|
| Summary (belt, streak) | Real-time | Core emotional feedback |
| Achievements | Near real-time | Celebrations shouldn't lag |
| Children overview | Minutes | Updated through WhatsApp coaching |
| Goal progress | Minutes | Updated on mission completion |
| Coaching history | Minutes | Populated from WhatsApp sessions |
| Notifications | Real-time | Time-sensitive by nature |
| Statistics | Daily refresh | Historical aggregation is acceptable |

---

## Related Documents

- [NAVIGATION_MODEL.md](./NAVIGATION_MODEL.md) — how users move through this architecture
- [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) — the screens that implement this structure
- [FEATURE_MAP.md](./FEATURE_MAP.md) — feature relationships and dependencies
- [Design Language](../design/DESIGN_LANGUAGE.md) — progressive disclosure, information priority
