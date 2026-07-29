# Requirements: Onboarding & Activation Frontend

## Introduction

This document defines the business and functional requirements for the Dad Coach onboarding and activation frontend — the complete journey from invitation link through WhatsApp activation. It maps directly to Backend SPEC-007 (User Onboarding & Activation) and must remain synchronized with the product specification at `docs/specs/WEB-SPEC-007-ONBOARDING-ACTIVATION.md`.

---

## Requirement 1: Invitation Validation

**User Story:** As a father clicking an invitation link, I want immediate feedback on whether my invitation is valid.

**Business Objective:** Prevent confusion and frustration from invalid links; provide clear recovery paths.

#### Acceptance Criteria

1. WHEN a father navigates to `/join/{token}`, THE system SHALL call `GET /api/v1/invitations/{token}/validate` and render the result within 2 seconds.
2. IF HTTP 200 (valid), THEN display the Welcome screen with inviter name (if available in response).
3. IF HTTP 404 (token not found), THEN display error: "This invitation link isn't valid. Please check with the person who shared it."
4. IF HTTP 410 (expired/revoked/used), THEN display the appropriate message based on the `reason` field in the response body.
5. IF HTTP 429 (rate limited), THEN display: "Too many attempts. Please try again in {n} minutes." using the Retry-After header value.
6. IF network is unavailable, THEN show offline state with retry button.
7. THE page SHALL show a skeleton loading state while validation is in progress.

**Backend API:** `GET /api/v1/invitations/{token}/validate` (SPEC-007 Req 8.2)

---

## Requirement 2: Welcome Screen

**User Story:** As a new father, I want to understand what Dad Coach is before committing to registration.

**Business Objective:** Set emotional tone, establish trust, reduce abandonment at the first screen.

#### Acceptance Criteria

1. THE Welcome screen SHALL display: product value proposition (single clear sentence), inviter's name (if available), and one "Get Started" CTA button.
2. NO user input SHALL be required on this screen.
3. WHEN "Get Started" is clicked, THE system SHALL call `POST /api/v1/onboarding/sessions` with the invitation token.
4. ON success (HTTP 201), THE system SHALL store the session cookie and navigate to the Language step.
5. IF HTTP 409 (phone already registered — detected from existing session for same invitation), THEN display: "This phone number is already registered. Would you like to log in instead?" with a link placeholder (target: WEB-SPEC-002).
6. IF the request fails (5xx or network), THEN show error with retry button.

**Backend API:** `POST /api/v1/onboarding/sessions` (SPEC-007 Req 8.3)

---

## Requirement 3: Language Selection

**User Story:** As a father, I want to choose my language so all subsequent content is in my preferred language.

**Business Objective:** Ensure accessibility for Hebrew-speaking and English-speaking fathers; set RTL/LTR immediately.

#### Acceptance Criteria

1. THE screen SHALL offer Hebrew (עברית) and English as visual selection options (buttons or cards, not a dropdown).
2. WHEN selected, THE system SHALL submit via `PUT /api/v1/onboarding/sessions/{id}/steps/LANGUAGE` with `{"language_code": "he"|"en"}`.
3. ON success, THE entire UI SHALL immediately switch to the selected language — all labels, placeholders, validation messages, button text, and text direction.
4. Hebrew sets `dir="rtl"`; English sets `dir="ltr"` on the root element.
5. THIS step is REQUIRED — the father cannot skip it.
6. ON session resume, THE selected language SHALL be restored from session state.

**Backend API:** `PUT /api/v1/onboarding/sessions/{id}/steps/LANGUAGE` (SPEC-007 Req 8.4, Req 2.4)

---

## Requirement 4: Father Profile

**User Story:** As a father, I want to provide my basic information quickly so that coaching is personalized to me.

**Business Objective:** Collect minimal required data for account creation and WhatsApp activation.

#### Acceptance Criteria

1. THE form SHALL collect: display_name (required), phone_number (required), email (optional), timezone (required).
2. display_name: 2–50 characters, Unicode letters and spaces only.
3. phone_number: E.164 format (`^\+[1-9]\d{1,14}$`). Show country code selector with +972 default.
4. email: optional, RFC 5322 format if provided.
5. timezone: valid IANA timezone ID. Default: Asia/Jerusalem. Pre-fill from browser detection.
6. Validation SHALL be inline (on blur + on submit). No validation on keystroke.
7. IF HTTP 409 (duplicate phone) on submit, THEN show: "This number is already registered" with login link (target: WEB-SPEC-002).
8. THIS step is REQUIRED.
9. ON success, phone_number SHALL be masked in all subsequent UI (****1234).
10. THE system SHALL submit via `PUT /api/v1/onboarding/sessions/{id}/steps/FATHER_PROFILE`.

**Backend API:** `PUT /api/v1/onboarding/sessions/{id}/steps/FATHER_PROFILE` (SPEC-007 Req 8.4, Req 2.5)
**Validation Rules:** SPEC-007 Req 2.5

---

## Requirement 5: Children Setup

**User Story:** As a father, I want to register my children so coaching is personalized to them.

**Business Objective:** Collect family context for age-appropriate coaching. Optional to reduce friction.

#### Acceptance Criteria

1. THE form SHALL collect per child: name (required, 2–30 chars), birth_date (required, 0–18 years past), gender (optional: MALE/FEMALE/OTHER/PREFER_NOT_TO_SAY), interests (optional, tag selection), challenges (optional, tag selection).
2. THE father can add 0 to 8 children. "Add another child" button visible until 8 reached.
3. THIS step is OPTIONAL — "Skip for now" advances to Goals with no children registered.
4. Each child validates independently. Removing a child before submit is allowed.
5. birth_date: not in future, not more than 18 years in the past.
6. WHEN skipped, no data is submitted. WHEN children are added, submit via `PUT /api/v1/onboarding/sessions/{id}/steps/CHILDREN`.
7. Empty state (no children added yet): "Add your children when you're ready. You can always do this later."

**Backend API:** `PUT /api/v1/onboarding/sessions/{id}/steps/CHILDREN` (SPEC-007 Req 8.4, Req 2.6)
**Validation Rules:** SPEC-007 Req 2.6

---

## Requirement 6: Goals Selection

**User Story:** As a father, I want to express what I want to improve so coaching focuses on what matters to me.

**Business Objective:** Set coaching priorities for personalized mission generation.

#### Acceptance Criteria

1. THE screen SHALL display 7 predefined goals as selectable cards: spend-more-quality-time, improve-communication, build-stronger-emotional-connection, handle-conflicts-better, create-family-routines, support-child-development, be-more-patient.
2. Multi-select: 1–5 goals required if not skipping.
3. Custom goal text input available (max 100 chars).
4. THIS step is OPTIONAL — "Skip for now" applies default goal (spend-more-quality-time).
5. ON submit: `PUT /api/v1/onboarding/sessions/{id}/steps/GOALS`.

**Backend API:** `PUT /api/v1/onboarding/sessions/{id}/steps/GOALS` (SPEC-007 Req 8.4, Req 2.7)

---

## Requirement 7: Preferences Setup

**User Story:** As a father, I want to set coaching preferences so the experience fits my schedule.

**Business Objective:** Reduce notification friction; match coaching style to personality.

#### Acceptance Criteria

1. THE form SHALL collect: coaching_style (GENTLE/BALANCED/DIRECT/MOTIVATIONAL, default BALANCED), preferred_coaching_time (HH:mm, 30-min intervals, default 08:00), notification_frequency (DAILY/EVERY_OTHER_DAY/TWICE_WEEKLY, default DAILY), quiet_hours_start (default 21:00), quiet_hours_end (default 07:00).
2. Coaching style options SHALL include brief descriptions helping the father choose.
3. THIS step is OPTIONAL — "Skip for now" applies all defaults.
4. ON submit: `PUT /api/v1/onboarding/sessions/{id}/steps/PREFERENCES`.

**Backend API:** `PUT /api/v1/onboarding/sessions/{id}/steps/PREFERENCES` (SPEC-007 Req 8.4, Req 2.8)

---

## Requirement 8: Review and Confirmation

**User Story:** As a father, I want to review everything before final submission so I'm confident my information is correct.

**Business Objective:** Reduce post-registration corrections; build confidence before commitment.

#### Acceptance Criteria

1. THE Review screen SHALL display all collected data: name, phone (masked), language, children (names + computed ages), goals, preferences.
2. Skipped sections SHALL show defaults clearly (e.g., "Coaching style: Balanced (default)").
3. Each section SHALL have an "Edit" link that navigates back to that step (preserving all other data).
4. THE "Confirm & Start" button SHALL trigger `POST /api/v1/onboarding/sessions/{id}/complete`.
5. Duplicate submission prevention: button disables on click; HTTP 409 treated as success.
6. IF provisioning fails (HTTP 500), THEN show: "Something went wrong. Your information is safe — please try again." with retry.
7. DURING provisioning, show loading state: "Setting up your coaching..." (target < 3 seconds).
8. THIS step is REQUIRED.

**Backend API:** `POST /api/v1/onboarding/sessions/{id}/complete` (SPEC-007 Req 8.5)

---

## Requirement 9: WhatsApp Activation

**User Story:** As a father, I want to connect to WhatsApp coaching seamlessly after registration.

**Business Objective:** Convert registrations into active coaching relationships.

#### Acceptance Criteria

1. AFTER successful provisioning (HTTP 201), THE system SHALL display: WhatsApp deep link button, step-by-step instructions, and visual of what to expect.
2. THE deep link SHALL be `https://wa.me/{number}?text=🚀 START` (from backend response).
3. WHEN the father clicks the button, THE system SHALL begin long-polling `GET /api/v1/onboarding/sessions/{id}/activation-status` (30s server hold per request).
4. WHEN status = CONVERSATION_STARTED, show success: "You're connected! 🎉" with "Go to Dashboard" button.
5. WHEN status = FAILED (30 min timeout), show: "We didn't receive your message. Try again?" with retry button.
6. Retry via `POST /api/v1/onboarding/sessions/{id}/activation/retry` (max 3 attempts).
7. IF all retries fail or 24h passes, show: "No worries — we'll send you a reminder. You can close this page."
8. THE father SHALL be able to manually copy the activation message if deep link doesn't work (fallback).
9. THE "Go to Dashboard" button navigates to the Father Workspace (WEB-SPEC-008 route).

**Backend API:** `GET .../activation-status` (SPEC-007 Req 8.6), `POST .../activation/retry` (SPEC-007 Req 8.7)

---

## Requirement 10: Session Recovery

**User Story:** As a father, I want my progress saved if I close the browser or switch devices.

**Business Objective:** Prevent abandonment from accidental interruptions.

#### Acceptance Criteria

1. IF the father returns to `/join/{token}` with an existing IN_PROGRESS session, THEN restore at the last completed step with all data pre-populated.
2. THE system SHALL call `GET /api/v1/onboarding/sessions/{id}` using the session cookie to restore state.
3. Browser refresh at any step SHALL NOT lose submitted data (all state is server-side).
4. IF the session has expired (72h inactivity, HTTP 403), THEN show: "Your session has expired, but the invitation is still valid. Let's start fresh." with "Start Again" button.
5. IF the invitation was revoked during an active session (HTTP 403 on step submit), THEN show: "This invitation is no longer available."
6. ON resume, language preference SHALL be restored immediately (correct RTL/LTR).

**Backend API:** `GET /api/v1/onboarding/sessions/{id}` (SPEC-007 Req 8.3, Req 9.3)

---

## Requirement 11: Progress Indication

**User Story:** As a father, I want to see where I am in the process so I know how much is left.

**Business Objective:** Reduce anxiety and abandonment by showing clear progress.

#### Acceptance Criteria

1. A step indicator SHALL show current position (e.g., "Step 3 of 8" or visual dots).
2. Completed steps SHALL be visually distinct from pending steps.
3. Required vs optional steps SHALL be subtly indicated.
4. THE indicator SHALL NOT create pressure (no timers, no "hurry up" language).
5. Step count dynamically adjusts when optional steps are skipped.

---

## Requirement 12: Wizard Navigation

**User Story:** As a father, I want to navigate back and forth without losing data.

**Business Objective:** Allow correction of mistakes without starting over.

#### Acceptance Criteria

1. BACK navigation SHALL always be available (except on Welcome).
2. BACK SHALL preserve all entered data (server-side persistence).
3. FORWARD SHALL only proceed after current step validates.
4. SKIP SHALL be available only on optional steps (CHILDREN, GOALS, PREFERENCES).
5. Direct URL access to a future step SHALL redirect to current step.
6. EDIT from Review SHALL navigate back to that step; completion returns to Review.

---

## Requirement 13: Loading and Error States

**User Story:** As a father, I want graceful handling when things are loading or failing.

**Business Objective:** Prevent confusion and maintain trust during technical issues.

#### Acceptance Criteria

1. Page load SHALL show skeleton screen while invitation validates.
2. Step submission SHALL show inline button loading state (button disabled + indicator).
3. Provisioning SHALL show "Setting up your coaching..." progress message.
4. Activation polling SHALL show gentle animation with status text updates.
5. Network errors SHALL show: "You're offline. We'll retry when connected." with auto-retry.
6. Server errors (5xx) SHALL show friendly message with retry button.
7. All error copy SHALL follow the product's Tone of Voice — conversations, not alerts.

---

## Requirement 14: Localization

**User Story:** As a father, I want the experience in my language with correct text direction.

**Business Objective:** Ensure Hebrew-speaking and English-speaking fathers have equal quality experience.

#### Acceptance Criteria

1. AFTER language selection, ALL UI text SHALL render in the chosen language.
2. Hebrew: `dir="rtl"`, right-aligned forms, mirrored layouts, date format dd/MM/yyyy.
3. English: `dir="ltr"`, left-aligned forms, standard layouts, date format MM/dd/yyyy.
4. Direction-dependent icons (arrows, progress bars) SHALL flip in RTL.
5. Numbers and phone inputs SHALL remain LTR regardless of document direction.
6. Validation error messages SHALL be in the selected language.
