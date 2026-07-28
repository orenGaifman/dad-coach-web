# User Journeys

## Overview

These journeys map the complete paths a father takes through the Dad Coach experience. The product spans two platforms:

- **Web** — onboarding, progress tracking, profile management
- **WhatsApp** — daily AI coaching, mission delivery, reflections

The web application is a companion to the WhatsApp coaching experience, not a replacement for it.

### Platform Responsibilities

| Platform | Owns | Does Not Own |
|----------|------|--------------|
| **Web** | Registration, onboarding wizard, progress dashboard, activity logging, profile/children/goal management, notifications display | Coaching conversations, mission delivery, AI interactions, daily engagement |
| **WhatsApp** | AI coaching conversations, mission assignment/completion, reflections, daily engagement, habit prompts | Registration, progress visualization, profile editing, achievement gallery |
| **Backend** | Data persistence, growth signal processing, belt/streak/achievement evaluation, scheduling, AI orchestration | Direct user interaction on either platform |

---

## Journey 1: Complete New Father Experience

**Trigger:** Father receives an invitation link (from admin, referral, or beta program)

**Goal:** Go from stranger to actively coached father

**Emotional arc:** Curious → Understood → Motivated → Connected → Growing

### Phase 1: Discovery (Web)

| Step | Screen | Action | Emotional State |
|------|--------|--------|-----------------|
| 1.1 | Invitation link arrives | Father clicks link from message/email | Curious, possibly skeptical |
| 1.2 | Welcome (O1) | Reads value proposition, sees product identity | "This looks like it's for me" |

### Phase 2: Registration (Web)

| Step | Screen | Action | Emotional State |
|------|--------|--------|-----------------|
| 2.1 | Language (O2) | Selects Hebrew or English | Comfortable — product speaks their language |
| 2.2 | Father Profile (O3) | Enters name, phone (E.164), timezone | Quick, low-friction, no unnecessary fields |
| 2.3 | Children (O4) | Adds children: name, birth date, interests, challenges | Starting to feel personal — "it cares about my family" |
| 2.4 | Goals (O5) | Selects 1–5 parenting goals from curated list | Defining intent — "I know what I want to improve" |
| 2.5 | Preferences (O6) | Sets coaching style, preferred time, notification frequency | "It adapts to me" |
| 2.6 | Review (O7) | Confirms all details in a clear summary | Confidence — "this is right" |

**Notes:**
- Steps 2.3–2.5 are optional (skippable)
- Session persists across page reloads and devices for 72 hours
- Back navigation preserves all entered data
- Required steps: Language, Father Profile, Review

### Phase 3: Activation (Web → WhatsApp)

| Step | Screen | Action | Emotional State |
|------|--------|--------|-----------------|
| 3.1 | Activation (O8) | Sees WhatsApp deep link with instructions | Clear on what to do next |
| 3.2 | WhatsApp opens | Clicks deep link (`wa.me/{number}?text=🚀 START`) | Crossing the threshold |
| 3.3 | Sends activation message | Sends pre-filled "🚀 START" to Dad Coach WhatsApp number | Active commitment |
| 3.4 | Activation confirmed | Web page updates via polling (status: CONVERSATION_STARTED) | "I'm in" — relief and excitement |

**Handoff:** At this point, responsibility transfers from Web to WhatsApp for coaching.

### Phase 4: First Coaching Interaction (WhatsApp)

| Step | Platform | What Happens | Emotional State |
|------|----------|--------------|-----------------|
| 4.1 | WhatsApp | Dad Coach sends personalized welcome message referencing children and goals | "It remembers what I said" |
| 4.2 | WhatsApp | Brief orientation: how coaching works, what to expect | Setting expectations — no overwhelm |
| 4.3 | WhatsApp | First micro-mission suggested (low difficulty, high warmth) | Actionable — "I can do this tonight" |

### Phase 5: First Dashboard Visit (Web)

| Step | Screen | What Father Sees | Emotional State |
|------|--------|------------------|-----------------|
| 5.1 | Dashboard (D1) | Warm welcome state, White belt, zero streak, "first session coming soon" | Beginning of something good |
| 5.2 | Dashboard (D1) | Clear mental model explanation: WhatsApp = coaching, Web = progress | Understanding the system |
| 5.3 | Dashboard (D1) | If first coaching happened: initial points visible, belt progress started | "It's already counting" |

### Phase 6: Long-Term Usage Pattern

After the first week, the father settles into a rhythm:

| Frequency | Platform | Activity |
|-----------|----------|----------|
| Daily | WhatsApp | Receives coaching message, completes missions, reflects |
| 2–3x/week | Web | Checks dashboard progress, views belt advancement |
| As needed | Web | Logs quality time or positive activities |
| Occasionally | Web | Reviews achievements, manages children/goals |
| Rarely | Web | Updates preferences or profile |

### Success Criteria

- Registration completed in under 5 minutes
- WhatsApp activation successful on first attempt
- First coaching interaction within 24 hours of activation
- First dashboard return within 48 hours
- Father understands the two-platform model without confusion

---

## Journey 2: Returning Father — Daily Check-in

**Trigger:** Father opens the web dashboard (motivated by curiosity, notification, or habit)

**Goal:** See progress at a glance, feel encouraged, leave quickly

**Emotional arc:** Busy → Acknowledged → Satisfied → Returns to life

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

**Emotional arc:** Warm from the experience → Wants to capture it → Sees it count

### Steps

1. **Navigate to activity logging** — Clear entry point from dashboard or Coaching tab
2. **Choose type** — Quality time or positive activity (praise, teaching moment, shared activity)
3. **Add details** — Which child (required), duration for quality time (optional), brief description (optional)
4. **Submit** — Instant confirmation with points awarded, streak updated
5. **See impact** — Progress bar moves, score updates, encouraging message

### Key Principles

- Logging takes under 30 seconds
- Minimum required fields: child + activity type
- Feels like capturing a good memory, not filing a report
- Immediate feedback makes it satisfying

### Validation Rules (from backend)

- Duration: 15–480 minutes (quality time only)
- Activity date: not future, not more than 7 days past
- Rate limits: max 10 quality time / 20 positive activity per day

---

## Journey 4: Reviewing Growth Progress

**Trigger:** Father wants to understand how far they've come

**Goal:** Feel a sense of accomplishment and see the trajectory

**Emotional arc:** Reflective → Proud → Motivated to continue

### Steps

1. **Open Growth tab** — Sees current belt, score, progress toward next belt
2. **View achievements** — Earned achievements displayed with dignity; unearned shown as available (not locked/greyed out)
3. **Check streak** — Current and longest streak, milestone markers
4. **Review statistics** (future) — Weekly/monthly activity patterns

### Key Principles

- Progress is framed as accumulation, never competition
- Unearned achievements inspire, never shame
- The past is always positive — no "missed days" highlighted
- Visual progression feels earned and meaningful

---

## Journey 5: Managing Children and Goals

**Trigger:** Father's situation changes (new child, updated interests, new goal)

**Goal:** Keep the coaching context accurate

**Emotional arc:** Practical → Efficient → Confident the system knows them

### Steps

1. **Navigate to Profile tab → Children Management** — Clear path from dashboard
2. **Edit or add** — Update child interests, add a new child, modify goals
3. **Confirm changes** — Simple save, confirmation that coaching will adapt
4. **Return to dashboard** — Updated summary reflects changes

### Key Principles

- Management is practical, not emotional
- Changes take immediate effect on future coaching (via WhatsApp)
- No judgment about what changed or why
- Minimal friction for updates

---

## Journey 6: First-Time Dashboard Experience

**Trigger:** Father completes onboarding and visits the dashboard before first coaching session

**Goal:** Understand what happens next without feeling overwhelmed

**Emotional arc:** "Now what?" → Clear on the path forward → Anticipation

### Steps

1. **Arrive at dashboard** — Sees a warm welcome state, not an empty shell
2. **Understand the model** — Brief explanation: coaching happens on WhatsApp, dashboard tracks progress
3. **See initial state** — White belt, zero streak, first coaching session indicated as "coming soon"
4. **Optional:** — Link to WhatsApp is available if father wants to initiate

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
- [FEATURE_MAP.md](./FEATURE_MAP.md) — features that enable these journeys
- [Personas](../brand/PERSONAS.md) — who these journeys serve
- [North Star](../brand/NORTH_STAR.md) — the metric these journeys ultimately drive
