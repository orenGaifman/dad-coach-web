# User Journeys

## Overview

These journeys map the primary paths a father takes through Dad Coach's web experience. The web application serves two key functions: (1) onboarding new fathers into the system, and (2) providing a dashboard where fathers can track progress, review coaching history, and manage their profiles.

The primary coaching interaction happens via WhatsApp. The web is a companion — not a replacement for the conversational experience.

---

## Journey 1: New Father Onboarding

**Trigger:** Father receives an invitation link (from admin, referral, or beta program)

**Goal:** Complete registration and activate WhatsApp coaching

**Emotional state:** Curious but skeptical → Understood and respected → Motivated and connected

### Steps

1. **Arrive at invitation link** — Sees welcome page explaining Dad Coach's value in one clear statement
2. **Choose language** — Hebrew or English (determines RTL/LTR for entire experience)
3. **Create profile** — Name, phone number, timezone
4. **Add children** (optional) — Name, birth date, interests, challenges
5. **Select goals** (optional) — Choose 1–5 from curated list or add custom
6. **Set preferences** (optional) — Coaching style, preferred time, notification frequency
7. **Review** — Confirm details in a clear summary
8. **Activate WhatsApp** — Click deep link, send activation message, see confirmation

### Key Principles

- Required steps: only 3 (welcome, language, profile). Everything else is skippable.
- Progress is visible but not pressuring
- Father can go back without losing data
- Session persists across page reloads and devices (72h)
- Tone throughout: warm, brief, never overwhelming

### Success Criteria

- Father completes registration in under 5 minutes
- Father successfully activates WhatsApp
- Father feels understood and hopeful, not overwhelmed

---

## Journey 2: Returning Father — Daily Check-in

**Trigger:** Father opens the web dashboard (motivated by curiosity, notification, or habit)

**Goal:** See progress at a glance, feel encouraged, leave quickly

**Emotional state:** Busy, checking in → Acknowledged → Satisfied, returns to life

### Steps

1. **Arrive at dashboard** — Sees workspace summary: belt, streak, active mission, recent coaching
2. **Glance at progress** — Belt advancement, streak status, recent achievements
3. **Optionally explore** — View children's progress, review goals, check notifications
4. **Leave** — Feels good about where things stand. Total time: 1–2 minutes.

### Key Principles

- Dashboard loads fast and communicates state within 2 seconds
- No action required — purely confirmatory
- Progress is celebrated subtly
- If there's nothing new, that's fine — the screen still feels warm and valuable

---

## Journey 3: Logging an Activity

**Trigger:** Father spent quality time or had a positive moment with his child

**Goal:** Record the activity and see it reflected in progress

**Emotional state:** Warm from the experience → Wants to capture it → Sees it count

### Steps

1. **Navigate to activity logging** — Clear entry point from dashboard
2. **Choose type** — Quality time or positive activity (praise, teaching moment, shared activity)
3. **Add details** — Which child, duration (for quality time), brief description (optional)
4. **Submit** — Instant confirmation, points awarded, streak updated
5. **See impact** — Progress bar moves, score updates, encouraging message

### Key Principles

- Logging takes under 30 seconds
- Minimum required fields (child selection + type)
- Feels like capturing a good memory, not filing a report
- Immediate feedback makes it satisfying

---

## Journey 4: Reviewing Growth Progress

**Trigger:** Father wants to understand how far they've come

**Goal:** Feel a sense of accomplishment and see the trajectory

**Emotional state:** Reflective → Proud → Motivated to continue

### Steps

1. **Open growth section** — Sees current belt, score, progress toward next belt
2. **View achievements** — Earned achievements displayed with dignity; unearned shown as available (not locked/greyed out)
3. **Check streak history** — Current and longest streak, milestone markers
4. **Review statistics** (future) — Weekly/monthly activity patterns

### Key Principles

- Progress is framed as accumulation, never competition
- Unearned achievements inspire, never shame
- The past is always positive — no "missed days" highlighted
- Visual progression feels earned and meaningful

---

## Journey 5: Managing Children and Goals

**Trigger:** Father's situation changes (new child, new goal, updated interests)

**Goal:** Keep the coaching context accurate

**Emotional state:** Practical → Efficient → Confident the system knows them

### Steps

1. **Navigate to profile/children** — Clear path from dashboard
2. **Edit or add** — Update child interests, add a new child, modify goals
3. **Confirm changes** — Simple save, confirmation that coaching will adapt
4. **Return to dashboard** — Updated summary reflects changes

### Key Principles

- Management is practical, not emotional
- Changes take immediate effect on coaching
- No judgment about what changed or why
- Minimal friction for updates

---

## Journey 6: First-Time Dashboard Experience (Post-Onboarding)

**Trigger:** Father completes onboarding and visits the dashboard for the first time

**Goal:** Understand what happens next without feeling overwhelmed

**Emotional state:** Just set things up → "Now what?" → Clear on the path forward

### Steps

1. **Arrive at dashboard** — Sees a warm welcome state, not an empty shell
2. **Understand the coaching flow** — Brief explanation: coaching happens on WhatsApp, the dashboard tracks progress
3. **See initial state** — White belt, zero streak, first coaching session coming soon
4. **First hint of progress** — Onboarding completion itself might award initial points

### Key Principles

- The empty state is inviting, never disappointing
- Clear mental model: WhatsApp = coaching, Web = progress + management
- No "unlock" or "complete X to see Y" patterns
- Feels like the beginning of something good

---

## Related Documents

- [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) — how content is organized
- [NAVIGATION_MODEL.md](./NAVIGATION_MODEL.md) — how fathers move between areas
- [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) — the screens these journeys touch
- [Personas](../brand/PERSONAS.md) — who these journeys serve
- [North Star](../brand/NORTH_STAR.md) — the metric these journeys ultimately drive
