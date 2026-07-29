# docs/ux

## Purpose

This folder defines the UX architecture of the Dad Coach web application — how information is organized, how users navigate, and how features connect to form a coherent experience.

These documents sit between strategy ([docs/brand](../brand/README.md)) and visual execution ([docs/design](../design/README.md)). They define *what* the user encounters and *in what order* — not how it looks.

## Contents

| Document | Description |
|----------|-------------|
| [USER_JOURNEYS.md](./USER_JOURNEYS.md) | Primary paths fathers take through the experience |
| [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) | How content is organized, grouped, and prioritized |
| [NAVIGATION_MODEL.md](./NAVIGATION_MODEL.md) | How users move through the product |
| [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) | Complete catalog of every screen |
| [FEATURE_MAP.md](./FEATURE_MAP.md) | All features with dependencies, priorities, and API mapping |

## Recommended Reading Order

1. **USER_JOURNEYS** — understand the experience from the father's perspective
2. **INFORMATION_ARCHITECTURE** — understand how content is structured
3. **NAVIGATION_MODEL** — understand how movement works
4. **SCREEN_INVENTORY** — see every screen mapped to the architecture
5. **FEATURE_MAP** — see how features, screens, and APIs connect

## Key UX Decisions

### The Web Is a Companion, Not the Primary Experience

Coaching happens on WhatsApp. The web application serves three purposes:
1. **Onboarding** — register via invitation link and activate WhatsApp
2. **Progress tracking** — see growth, belt, streak, achievements
3. **Management** — update profile, children, preferences

The web never tries to replicate the coaching conversation. There is no public marketing landing page in the MVP — fathers access the product exclusively through invitation links.

### Shallow Architecture

Maximum 2 levels of navigation depth. Any content reachable within 2 taps from the dashboard. No hidden features, no deep hierarchies.

### Five-Tab Navigation

Home, Growth, Family, Coaching, Profile — covers the complete feature set within thumb-comfortable navigation. No hamburger menus, no hidden sections.

## Relationship to Other Documentation

| Layer | Documents | Role |
|-------|-----------|------|
| Strategy | [docs/brand](../brand/README.md) | Why and for whom |
| UX | **docs/ux** (this folder) | What and in what order |
| Design | [docs/design](../design/README.md) | How it looks and feels |

## What else belongs here (future)

- Flow diagrams (Mermaid or visual)
- Error handling UX patterns
- Empty state strategy document
- Accessibility interaction patterns
- RTL/LTR adaptation guidelines
- Responsive behavior specification
