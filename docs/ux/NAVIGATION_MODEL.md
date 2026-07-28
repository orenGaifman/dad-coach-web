# Navigation Model

## Overview

Navigation in Dad Coach must be predictable, minimal, and never compete with content. A father should always know where he is, where he can go, and how to get back — without thinking about it.

## Navigation Modes

### Onboarding: Linear Stepper

During onboarding, navigation is a linear progression:

- Forward/back between steps
- Step indicator showing position (not completion pressure)
- No global navigation visible (onboarding is a focused flow)
- Skip forward available for optional steps
- No ability to jump to arbitrary steps (preserves linear clarity)

### Dashboard: Persistent Tab Bar

After activation, the primary navigation is a persistent bottom tab bar (mobile) or sidebar (desktop). This provides:

- Constant orientation ("where am I")
- One-tap access to all top-level areas
- No hamburger menus or hidden navigation

---

## Primary Navigation Structure

| Tab | Purpose | Icon Metaphor |
|-----|---------|---------------|
| **Home** | Dashboard summary — the hub | Home/overview |
| **Growth** | Belt, achievements, streak, score | Progress/upward |
| **Family** | Children, goals, missions | People/connection |
| **Coaching** | Conversation history, activity log | Message/dialogue |
| **Profile** | Settings, preferences, account | Person/gear |

### Why Five Tabs

Five is the maximum for comfortable one-handed thumb navigation. It covers the complete feature set without requiring secondary navigation patterns. Each tab maps to a clear mental model.

---

## Secondary Navigation (Within Tabs)

Within each tab, navigation uses:

- **Segmented controls** — for switching between related views (e.g., "Achievements" / "Belt" / "Streak" within Growth)
- **List → Detail** — for drilling into children, goals, conversations
- **Back button** — standard "return to previous" pattern

No third-level navigation. If a design requires three levels of hierarchy, the information architecture needs simplification.

---

## Navigation Behavior

### Current State Indication

- Active tab is clearly indicated (filled icon, label visible)
- Current page within a tab uses contextual titles
- Breadcrumbs are not needed given shallow architecture

### Deep Linking

Every screen has a unique URL. Fathers can bookmark, share, or return to any state directly. This supports:

- Notification links that open a specific section
- Onboarding resumption at the correct step
- Future email digest links

### Notification Badge

A single notification indicator lives on the Home tab (or a persistent top bar). It's a simple dot or count — never aggressive, never red by default.

### WhatsApp Connection Point

A subtle, persistent indicator reminds the father that coaching lives on WhatsApp. On mobile: a floating action button linking to WhatsApp. On desktop: a subtle prompt in the sidebar. This bridges the two experiences without being pushy.

---

## Navigation Anti-Patterns

- No hamburger menus (hides structure, increases cognitive load)
- No gesture-only navigation (must always have visible affordance)
- No tab reordering or customization (consistency over personalization)
- No nested tab bars (one level of tabs only)
- No modals for navigation purposes (modals are for confirmations and focused input)
- No "back to dashboard" as a navigation pattern (tabs always take you home)

---

## Responsive Behavior

| Viewport | Primary Nav | Secondary Nav |
|----------|-------------|---------------|
| Mobile (< 768px) | Bottom tab bar | In-page segments, back button |
| Tablet (768–1024px) | Bottom tab bar or collapsible sidebar | Same as mobile |
| Desktop (> 1024px) | Persistent left sidebar | In-page segments |

The information architecture remains identical across viewports. Only the navigation container changes.

---

## Related Documents

- [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) — what's navigated to
- [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) — all screens within this nav structure
- [USER_JOURNEYS.md](./USER_JOURNEYS.md) — how navigation serves real tasks
- [Design Language](../design/DESIGN_LANGUAGE.md) — one primary action per screen, never compete with content
