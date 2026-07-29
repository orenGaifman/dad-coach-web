# Requirements: Father Workspace Frontend

## Introduction

This document defines the business and functional requirements for the Father Workspace frontend — the authenticated dashboard experience that fathers access after onboarding and WhatsApp activation. It is derived from [WEB-SPEC-008-FATHER-WORKSPACE](../../../docs/specs/WEB-SPEC-008-FATHER-WORKSPACE.md) and must remain synchronized with it.

The workspace serves as a progress mirror, activity logging surface, and management hub for the Dad Coach web application.

## Requirements

### Requirement 1: Workspace Summary Dashboard

**User Story:** As a father, I want to see my key metrics at a glance when I open the dashboard, so that I feel acknowledged and know where I stand.

#### Acceptance Criteria

1. WHEN an authenticated father loads the dashboard, THE system SHALL display: current belt, growth score, current streak days, active mission (if any), last coaching conversation timestamp, unread notification count, and active children count.
2. THE dashboard SHALL render within 2 seconds of page load.
3. IF any backend section is unavailable (partial degradation), THEN the remaining sections SHALL render normally and unavailable sections SHALL show a neutral placeholder — never an error modal.
4. IF the father has never completed a coaching session, THEN the dashboard SHALL show a warm empty state explaining the coaching model rather than displaying zeros.
5. THE dashboard SHALL include a persistent, subtle WhatsApp bridge link that opens WhatsApp directly.

---

### Requirement 2: Belt Progression Display

**User Story:** As a father, I want to see my current belt and progress toward the next belt, so that I feel motivated by visible forward momentum.

#### Acceptance Criteria

1. THE Growth section SHALL display: current belt name and visual, current score, next belt name, points remaining to next belt, and percentage progress to next belt.
2. THE belt system SHALL visually represent 8 levels: WHITE, YELLOW, ORANGE, GREEN, BLUE, PURPLE, BROWN, BLACK.
3. WHEN the father holds BLACK belt (final), THE display SHALL show a mastery/completion state instead of "next belt."
4. THE progress visualization SHALL fill (never deplete).
5. THE display SHALL NOT compare the father to other users.

---

### Requirement 3: Achievements Gallery

**User Story:** As a father, I want to browse my achievements, so that I feel recognized for my parenting efforts.

#### Acceptance Criteria

1. THE Achievements view SHALL display all available achievements grouped by category: MISSIONS, CONSISTENCY, GROWTH, CONVERSATIONS, GOALS, SPECIAL.
2. Earned achievements SHALL show the earned_at date.
3. Unearned achievements SHALL be shown as available — not locked, greyed, or hidden.
4. THE view SHALL highlight "next achievable" — the closest unearned achievement the father is progressing toward.
5. THE copy SHALL NOT imply failure for unearned achievements.

---

### Requirement 4: Streak Display

**User Story:** As a father, I want to see my consistency streak, so that I appreciate my sustained engagement.

#### Acceptance Criteria

1. THE Streak view SHALL display: current streak days, longest streak ever, streak start date, and last qualifying interaction date.
2. THE view SHALL NOT display "streak at risk" warnings or any shaming language.
3. Milestone markers SHALL appear at: 7, 14, 21, 30, 60, 90, 180, 365 days.
4. WHEN streak is zero, THE view SHALL show an encouraging message about starting fresh.

---

### Requirement 5: Children Overview

**User Story:** As a father, I want to see all my children at a glance, so that I know their coaching context.

#### Acceptance Criteria

1. THE Children Overview SHALL display per child: name, computed age, recent mission title, active goals count, and completed missions count.
2. Ages SHALL be computed dynamically from birth_date.
3. IF a birthday is within 7 days, THEN a subtle indicator SHALL appear.
4. WHEN no children are registered, THE empty state SHALL invite adding children without pressure.
5. Tapping a child SHALL navigate to the Child Detail view.

---

### Requirement 6: Child Detail

**User Story:** As a father, I want to view detailed information about one child, so that I understand their coaching context fully.

#### Acceptance Criteria

1. THE Child Detail SHALL display: name, birth date, computed age, interests, challenges, active goals with progress, mission history summary, and upcoming birthday indicator.
2. THE view SHALL be read-only — editing navigates to Children Management.
3. Back navigation SHALL return to Children Overview.

---

### Requirement 7: Goals Overview

**User Story:** As a father, I want to see all my parenting goals with progress, so that I track what I'm working toward.

#### Acceptance Criteria

1. THE Goals Overview SHALL display per goal: description, category, priority, progress percentage, related child (if linked), and missions completed/remaining.
2. Progress percentage SHALL be calculated as: completed_missions / estimated_missions × 100, capped at 100%.
3. THE view SHALL support filtering by: status, category, child.
4. WHEN no goals exist, THE empty state SHALL explain that goals are created through WhatsApp coaching.

---

### Requirement 8: Goal Detail

**User Story:** As a father, I want to see detailed progress for one goal, so that I understand how close I am to completion.

#### Acceptance Criteria

1. THE Goal Detail SHALL display: description, category, priority, creation date, progress percentage, related missions list, and milestones reached.
2. The mission list SHALL be read-only.
3. Back navigation SHALL return to Goals Overview.

---

### Requirement 9: Coaching History

**User Story:** As a father, I want to see my recent coaching conversations, so that I can reflect on my coaching journey.

#### Acceptance Criteria

1. THE Coaching History SHALL display recent conversations (default 10, max 50): type, date, message count, summary, and status.
2. THE view SHALL NOT display full message transcripts — only metadata and summary.
3. THE view SHALL NOT expose system prompts, AI telemetry, or internal metadata.
4. Tapping a conversation SHALL show conversation detail with summary view.
5. WHEN no conversations exist, THE empty state SHALL explain that coaching happens on WhatsApp.

---

### Requirement 10: Log Quality Time

**User Story:** As a father, I want to log quality time spent with my child, so that my growth score reflects real-world parenting.

#### Acceptance Criteria

1. THE form SHALL collect: child (required), duration in minutes (optional, 15–480 range), description (optional, max 200 chars), and activity date (optional, defaults to today).
2. Activity date SHALL NOT be in the future or more than 7 days in the past.
3. ON success, THE system SHALL show confirmation with: points awarded (12 pts), updated streak status, and encouraging message.
4. WHEN the daily limit is reached (10 reports), THE system SHALL show a friendly message — never punitive.
5. WHEN a duplicate is detected (same child, duration, date), THE system SHALL explain clearly.
6. THE form SHALL only show children belonging to the father.
7. THE total flow SHALL complete in under 30 seconds.

---

### Requirement 11: Log Positive Activity

**User Story:** As a father, I want to log positive parenting moments, so that I'm recognized for daily wins.

#### Acceptance Criteria

1. THE form SHALL collect: activity type (required: PRAISE, SHARED_ACTIVITY, TEACHING_MOMENT, QUALITY_CONVERSATION, OTHER), child (optional), description (optional, max 200 chars), and activity date (optional, defaults to today).
2. THE same date constraints SHALL apply as quality time (not future, not >7 days past).
3. ON success, THE system SHALL show confirmation with: points awarded (5 pts), updated streak, and encouraging message.
4. WHEN the daily limit is reached (20 reports), THE system SHALL show a friendly message.
5. Multiple activities of the same type on the same day SHALL be valid (no duplicate detection).
6. THE flow SHALL complete in under 30 seconds.

---

### Requirement 12: Notifications

**User Story:** As a father, I want to see my notifications, so that I don't miss important coaching moments.

#### Acceptance Criteria

1. THE Notifications view SHALL display a paginated list: type, title, body, created_at, read status, and priority.
2. THE view SHALL support mark-as-read (individual and bulk "mark all read").
3. Unread count SHALL be visible in navigation badge.
4. THE badge SHALL be a simple dot or count — never red, never aggressive.
5. WHEN no notifications exist, THE empty state SHALL say "No notifications right now."

---

### Requirement 13: Profile View and Edit

**User Story:** As a father, I want to view and edit my profile, so that my coaching context stays accurate.

#### Acceptance Criteria

1. THE Profile view SHALL display: name, phone (masked), timezone, coaching style, preferred coaching time, language, coaching phase, and days since activation.
2. THE Edit view SHALL allow changes to: name, timezone, and email.
3. Profile mutations SHALL go through the Application API (not workspace API).
4. ON save, THE system SHALL confirm without page reload.

---

### Requirement 14: Children Management

**User Story:** As a father, I want to add, edit, or archive children, so that coaching adapts to my family.

#### Acceptance Criteria

1. THE view SHALL list all children with edit and archive actions.
2. THE add form SHALL collect: name (required), birth date (required, 0–18 years past), gender, interests, and challenges.
3. THE system SHALL enforce a maximum of 8 children.
4. Archive SHALL require confirmation (non-reversible in UI).
5. Changes SHALL reflect immediately in the dashboard and coaching context.

---

### Requirement 15: Preferences

**User Story:** As a father, I want to adjust my coaching preferences, so that the experience adapts to my needs.

#### Acceptance Criteria

1. THE view SHALL allow editing: coaching style (GENTLE/BALANCED/DIRECT/MOTIVATIONAL), preferred coaching time, notification frequency, and quiet hours.
2. Changes SHALL be saved through the Application API.
3. ON save, THE system SHALL confirm that changes take effect on the next coaching session.

---

### Requirement 16: Celebration Events

**User Story:** As a father, I want to see celebrations when I earn achievements or level up, so that I feel recognized.

#### Acceptance Criteria

1. WHEN undisplayed celebration events exist, THE system SHALL show a modal/overlay on dashboard load.
2. Celebration types SHALL include: BELT_LEVEL_UP, ACHIEVEMENT_EARNED, MILESTONE_REACHED, STREAK_MILESTONE.
3. THE celebration SHALL display: event type, title, and encouragement message from backend.
4. After viewing, THE system SHALL mark the celebration as displayed via API.
5. Multiple pending celebrations SHALL be shown sequentially.
6. THE celebration SHALL feel dignified — not party-like or exaggerated.
7. THE father SHALL be able to dismiss without interaction.

---

### Requirement 17: Loading, Error, and Empty States

**User Story:** As a father, I want graceful handling when things are loading, unavailable, or empty, so that I never feel alarmed or confused.

#### Acceptance Criteria

1. Loading SHALL use skeleton screens matching final layout — no spinners.
2. Network errors SHALL display: "We can't connect right now. We'll be back shortly." with optional retry.
3. Server errors (5xx) SHALL display: "Something didn't work on our end. Your progress is safe." with retry.
4. Rate limits (429) SHALL display: "You've reached today's limit. Come back tomorrow."
5. Validation errors SHALL appear inline at field level — never as modal alerts.
6. All error copy SHALL follow the product's Tone of Voice.
7. Every screen SHALL have a designed empty state using warm, inviting language.
