# docs/specs

## Purpose

This folder contains feature and technical specifications for the Dad Coach web frontend. Each specification is the single source of truth for implementing a feature — detailed enough for product, UX, engineering, and QA.

## Contents

| Document | Description | Status |
|----------|-------------|--------|
| [WEB-SPEC-007-ONBOARDING-ACTIVATION.md](./WEB-SPEC-007-ONBOARDING-ACTIVATION.md) | Onboarding wizard — invitation entry through WhatsApp activation | Draft |
| [WEB-SPEC-008-FATHER-WORKSPACE.md](./WEB-SPEC-008-FATHER-WORKSPACE.md) | Father Workspace dashboard — progress tracking, activity logging, profile management | Draft |

## Numbering Convention

Frontend specifications mirror backend specification numbers:

| Frontend | Backend | Scope |
|----------|---------|-------|
| WEB-SPEC-007 | SPEC-007 (User Onboarding & Activation) | Registration wizard, WhatsApp activation |
| WEB-SPEC-008 | SPEC-008 (Father Workspace Backend) | Authenticated dashboard, growth, activity logging |

## What belongs here

- Feature specifications (functional requirements, user stories, acceptance criteria)
- Screen mapping and navigation impact
- API integration contracts
- State management strategy
- Testing considerations

## Naming Convention

```
WEB-SPEC-{number}-{FEATURE-NAME}.md
```

## Relationship to other documentation

| Layer | Folder | Purpose |
|-------|--------|---------|
| Strategy & Brand | [docs/brand](../brand/README.md) | Product philosophy, values, audience |
| Design | [docs/design](../design/README.md) | Visual direction, design language |
| UX Architecture | [docs/ux](../ux/README.md) | Journeys, navigation, screen inventory |
| **Specifications** | **docs/specs** (this folder) | Implementation-ready feature requirements |
