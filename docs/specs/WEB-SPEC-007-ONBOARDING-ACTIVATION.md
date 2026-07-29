# WEB-SPEC-007: Onboarding & Activation Frontend

## Overview

### Purpose

This specification defines the frontend implementation of the Dad Coach onboarding and activation flow — the complete journey from invitation link entry through WhatsApp activation and handoff to the Father Workspace.

### Business Value

Onboarding is the single entry point to the entire Dad Coach experience. Every father must complete this flow before accessing coaching or the workspace. The quality of this experience directly determines:
- Conversion rate from invitation to activation
- First impression and trust establishment
- Data quality for personalized coaching
- Time to first coaching interaction

### Goals

1. Convert invitation clicks into activated WhatsApp coaching relationships
2. Collect family context for personalized coaching (children, goals, preferences)
3. Establish trust through warm, respectful, non-overwhelming UX
4. Complete the flow in under 5 minutes
5. Support resumption after interruption (72h window)

### Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Backend SPEC-007 (User Onboarding & Activation) | API | Implemented |
| WhatsApp activation webhook | Backend integration | Implemented |
| WEB-SPEC-002 (Authentication) | Future spec | Not yet created |
| WEB-SPEC-008 (Father Workspace) | Handoff destination | Specified |

### Assumptions

- MVP is invitation-only (no public registration)
- Backend SPEC-007 APIs are fully implemented
- Session management uses server-side state with HttpOnly session cookie
- Long-polling (30s) is used for activation status — no WebSocket
- Hebrew (RTL) and English (LTR) are the supported languages
- The father arrives from a WhatsApp message, email, or direct link share

### Out of Scope

- General authentication infrastructure (WEB-SPEC-002)
- Father Workspace (WEB-SPEC-008)
- Admin invitation management UI
- OAuth/social login
- Mobile native app onboarding
- Marketing landing page


---

## Business Context

### User Problem

A father receives an invitation link via WhatsApp or email. He's curious but skeptical. He doesn't know what Dad Coach is, whether it's trustworthy, or how long setup will take. If the registration feels burdensome, clinical, or unclear, he'll abandon it — and the coaching opportunity is lost.

### Business Problem

The entire product funnel depends on this flow. Zero activations means zero coaching relationships. Every friction point, confusing step, or unrecoverable error directly reduces the total addressable user base.

### Expected Outcome

- 80%+ of fathers who click an invitation link complete registration
- 90%+ of fathers who complete registration successfully activate WhatsApp
- Average completion time under 5 minutes
- Zero data loss from interruptions (browser refresh, network loss, device switch)

---

## Scope

### Included

- Invitation link entry (`/join/{token}`)
- Invitation validation (valid, expired, revoked, used, rate-limited)
- Welcome screen (O1)
- Language selection (O2)
- Father profile registration (O3)
- Children setup (O4, optional)
- Goals selection (O5, optional)
- Preferences setup (O6, optional)
- Review and confirmation (O7)
- Provisioning feedback
- WhatsApp activation (O8)
- Activation status polling (long-poll)
- Activation success → workspace handoff
- Activation failure and retry
- Session recovery (browser refresh, device switch, 72h resume)
- Inline validation and error handling
- RTL/LTR localization
- Mobile-first responsive design

### Excluded

- Admin invitation creation/management
- General authentication (WEB-SPEC-002)
- Father Workspace post-activation (WEB-SPEC-008)
- Dark mode
- OAuth/social login
- Bulk onboarding

---

## User Stories

### US-1: Invitation Entry and Validation

**Priority:** P0

As a father clicking an invitation link, I want immediate feedback on whether my invitation is valid, so that I don't waste time on an unusable link.

**Acceptance Criteria:**

1. WHEN a father navigates to `/join/{token}`, THE system SHALL call `GET /api/v1/invitations/{token}/validate`
2. IF the invitation is valid (HTTP 200), THEN display the Welcome screen (O1) with inviter name if available
3. IF the token does not exist (HTTP 404), THEN display: "This invitation link isn't valid. Please check with the person who shared it."
4. IF the invitation is expired or revoked (HTTP 410), THEN display: "This invitation has expired. Ask for a new one — it only takes a moment."
5. IF the invitation is fully used (HTTP 410 with reason), THEN display: "This invitation has already been used."
6. IF rate limited (HTTP 429), THEN display: "Too many attempts. Please try again in a few minutes." with Retry-After countdown
7. THE validation SHALL complete within 2 seconds of page load
8. IF network is unavailable, THEN show offline state with retry button

### US-2: Welcome Screen

**Priority:** P0

As a new father, I want to understand what Dad Coach is and what happens next, so that I feel confident proceeding.

**Acceptance Criteria:**

1. THE Welcome screen SHALL display: product value proposition (one clear sentence), inviter's name (if available from invitation metadata), and a single "Get Started" CTA
2. THE screen SHALL NOT require any input — it is purely informational
3. THE "Get Started" action SHALL create an onboarding session via `POST /api/v1/onboarding/sessions` with the invitation token
4. IF session creation fails, THEN show an error with retry option
5. IF the phone number is already registered (HTTP 409), THEN show: "This phone number is already registered. Would you like to log in instead?" with a link (target: WEB-SPEC-002)
6. THE screen SHALL feel warm and trustworthy — not corporate or clinical

### US-3: Language Selection

**Priority:** P0

As a father, I want to choose my language immediately, so that all subsequent steps are in my preferred language.

**Acceptance Criteria:**

1. THE Language screen SHALL offer: Hebrew (עברית) and English, with clear visual selection
2. WHEN selected, THE system SHALL submit via `PUT /api/v1/onboarding/sessions/{id}/steps/LANGUAGE` with `language_code`
3. THE entire UI SHALL immediately switch to the selected language (direction, labels, placeholders, validation messages)
4. Hebrew selection SHALL set `dir="rtl"` on the document; English sets `dir="ltr"`
5. THE step is REQUIRED — cannot be skipped
6. THE system SHALL remember language preference on session resume

### US-4: Father Profile

**Priority:** P0

As a father, I want to provide my basic information quickly, so that coaching can be personalized.

**Acceptance Criteria:**

1. THE form SHALL collect: display_name (required, 2–50 chars), phone_number (required, E.164 format), email (optional, RFC 5322), timezone (required, IANA ID, default: Asia/Jerusalem)
2. Validation SHALL be inline: errors appear on blur or submit, not on every keystroke
3. Phone number SHALL show a country code selector with default +972 (Israel)
4. IF the phone number is already registered (HTTP 409 on submit), THEN show: "This number is already registered" with login link
5. THE step is REQUIRED — cannot be skipped
6. On success, THE system SHALL submit via `PUT /api/v1/onboarding/sessions/{id}/steps/FATHER_PROFILE`
7. THE phone number SHALL be masked in all subsequent displays (****1234)

### US-5: Children Setup

**Priority:** P1

As a father, I want to register my children so coaching is personalized to them, but I should be able to skip this if I'm in a hurry.

**Acceptance Criteria:**

1. THE form SHALL collect per child: name (required, 2–30 chars), birth_date (required, 0–18 years past), gender (optional), interests (optional, tag selection), challenges (optional, tag selection)
2. THE father can add 0–8 children
3. THE step is OPTIONAL — "Skip for now" advances to Goals
4. IF children are added, THE system SHALL submit via `PUT /api/v1/onboarding/sessions/{id}/steps/CHILDREN`
5. Each child form SHALL validate independently
6. THE father can remove a child before submission
7. Birth date validation: not in future, not more than 18 years past
8. Empty state (no children added yet): "Add your children when you're ready. You can always do this later."

### US-6: Goals Selection

**Priority:** P1

As a father, I want to express what I want to improve, so that coaching focuses on what matters to me.

**Acceptance Criteria:**

1. THE screen SHALL display predefined goals as selectable cards: spend-more-quality-time, improve-communication, build-stronger-emotional-connection, handle-conflicts-better, create-family-routines, support-child-development, be-more-patient
2. THE father SHALL select 1–5 goals (multi-select)
3. A "Custom goal" text input (max 100 chars) SHALL be available
4. THE step is OPTIONAL — "Skip for now" applies default (spend-more-quality-time)
5. ON submit: `PUT /api/v1/onboarding/sessions/{id}/steps/GOALS`

### US-7: Preferences Setup

**Priority:** P1

As a father, I want to set my coaching preferences so the experience fits my schedule.

**Acceptance Criteria:**

1. THE form SHALL collect: coaching_style (GENTLE/BALANCED/DIRECT/MOTIVATIONAL, default BALANCED), preferred_coaching_time (HH:mm, 30-min intervals, default 08:00), notification_frequency (DAILY/EVERY_OTHER_DAY/TWICE_WEEKLY, default DAILY), quiet_hours_start (default 21:00), quiet_hours_end (default 07:00)
2. THE step is OPTIONAL — "Skip for now" applies all defaults
3. ON submit: `PUT /api/v1/onboarding/sessions/{id}/steps/PREFERENCES`
4. Coaching style SHALL have brief descriptions helping the father choose

### US-8: Review and Confirmation

**Priority:** P0

As a father, I want to review everything before final submission, so that I'm confident the system has my information correct.

**Acceptance Criteria:**

1. THE Review screen SHALL display a summary of all provided data: name, phone (masked), language, children (names + ages), goals, preferences
2. Skipped sections SHALL show their defaults clearly (e.g., "Coaching style: Balanced (default)")
3. Each section SHALL have an "Edit" link that navigates back to that step
4. THE "Confirm" button triggers `POST /api/v1/onboarding/sessions/{id}/complete`
5. Duplicate submission prevention: button disables after first click; HTTP 409 is treated as success (idempotent)
6. IF provisioning fails (HTTP 500), THEN show: "Something went wrong. Your information is safe — please try again." with retry
7. THE step is REQUIRED

### US-9: WhatsApp Activation

**Priority:** P0

As a father, I want to connect to WhatsApp coaching seamlessly after registration.

**Acceptance Criteria:**

1. AFTER successful provisioning (HTTP 201), THE system SHALL display the WhatsApp activation screen with: deep link button ("Open WhatsApp"), instructions, and visual of what to expect
2. THE deep link SHALL be `https://wa.me/{number}?text=🚀 START` (URL-encoded)
3. WHEN the father clicks the link, THE system SHALL call `POST .../activation/retry` to record LINK_CLICKED (or rely on backend detection)
4. THE system SHALL begin long-polling `GET .../activation-status` with 30s server-side hold
5. WHEN status transitions to CONVERSATION_STARTED, THE system SHALL show success state and "Go to Dashboard" button
6. IF activation fails after 30 minutes (FAILED status), THEN show: "We didn't receive your message. Try again?" with retry button
7. IF activation fails after 24 hours, THEN show: "No worries — we'll send you a reminder. You can close this page."
8. Retry: `POST .../activation/retry` regenerates the deep link (max 3 retries)
9. THE father SHALL be able to manually copy the activation message if the deep link doesn't work

### US-10: Session Recovery

**Priority:** P0

As a father, I want my progress saved if I close the browser or switch devices, so I don't have to start over.

**Acceptance Criteria:**

1. IF the father returns to `/join/{token}` with an existing IN_PROGRESS session (identified by session cookie or phone number match), THEN resume at the last completed step
2. THE system SHALL call `GET /api/v1/onboarding/sessions/{id}` to restore wizard state
3. All previously submitted data SHALL be pre-populated in forms
4. Browser refresh at any step SHALL NOT lose submitted data (server-side persistence)
5. Session expires after 72 hours of inactivity — show: "Your session has expired, but the invitation is still valid. Let's start fresh."
6. IF the invitation has been revoked during an active session (HTTP 403 on step submit), THEN show: "This invitation is no longer available."

### US-11: Progress Indication

**Priority:** P1

As a father, I want to see where I am in the process, so I know how much is left.

**Acceptance Criteria:**

1. A step indicator SHALL show the current position in the wizard (e.g., "Step 3 of 8")
2. Completed steps SHALL be visually distinct from pending steps
3. Required vs optional steps SHALL be indicated subtly
4. THE indicator SHALL NOT create pressure or imply the father is slow
5. Total step count adjusts if optional steps are skipped


---

## Functional Requirements

### FR-1: Navigation Rules

1. Forward navigation: only after current step validates successfully
2. Back navigation: always allowed, data preserved
3. Skip: available on optional steps (CHILDREN, GOALS, PREFERENCES), applies defaults
4. Direct URL access to a step: redirect to current step if not yet reached
5. No ability to jump to arbitrary steps (linear progression enforced)
6. "Edit" from Review navigates back to that step, preserving all other data

### FR-2: Form Validation Strategy

1. Validation timing: on blur (field-level) + on submit (form-level)
2. No validation on keystroke (avoids premature errors)
3. Required fields marked with subtle indicator (not aggressive red asterisk)
4. Error messages appear below the field, in the selected language
5. On submit with errors: focus moves to first invalid field
6. Backend validation errors (from PUT step response) are mapped to field-level UI errors

### FR-3: Loading States

1. Page load (invitation validation): full-screen skeleton
2. Step submission: button shows inline loading indicator, form disabled
3. Provisioning (complete): progress message "Setting up your coaching..."
4. Activation polling: gentle animation (not spinner), status text updates
5. Session restore: skeleton of current step while data loads

### FR-4: Error Handling

| Error | HTTP | User Message | Action |
|-------|------|-------------|--------|
| Invalid token | 404 | "This invitation link isn't valid." | Link to contact inviter |
| Expired invitation | 410 | "This invitation has expired." | Suggest requesting new one |
| Used invitation | 410 | "This invitation has already been used." | None |
| Rate limited | 429 | "Too many attempts. Try again in {n} minutes." | Countdown timer |
| Duplicate phone | 409 | "This number is already registered." | Login link (WEB-SPEC-002) |
| Session expired | 403 | "Your session expired. Let's start fresh." | Re-click invitation link |
| Invitation revoked mid-flow | 403 | "This invitation is no longer available." | None |
| Validation error | 400 | Field-level inline errors | Fix and resubmit |
| Step out of order | 422 | Redirect to correct current step | Auto-recover |
| Server error | 500 | "Something went wrong. Please try again." | Retry button |
| Network offline | — | "You're offline. We'll retry when connected." | Auto-retry on reconnect |

### FR-5: Duplicate Submission Protection

1. Submit buttons disable after first click
2. Backend idempotency: duplicate `POST .../complete` returns 409 treated as success
3. Network timeout + retry: same session cookie ensures idempotent processing
4. Double-click prevention on activation deep link button

### FR-6: Accessibility

1. All form fields have associated labels (not just placeholder text)
2. Error messages are linked to fields via `aria-describedby`
3. Step indicator uses `aria-current="step"` for screen readers
4. Focus management: on step transition, focus moves to first input or heading
5. All interactive elements reachable via keyboard (Tab, Enter, Escape)
6. Contrast meets WCAG AA for all text and interactive elements
7. RTL layout uses CSS logical properties

### FR-7: Analytics Events

| Event | Properties | Trigger |
|-------|-----------|---------|
| `onboarding_started` | invitation_type, inviter_id | Session created |
| `step_completed` | step_name, duration_ms | Step submitted successfully |
| `step_skipped` | step_name | Skip clicked |
| `validation_error` | step_name, field, error_code | Inline error shown |
| `onboarding_completed` | total_duration_ms, steps_skipped[] | Provisioning success |
| `activation_started` | — | Deep link clicked |
| `activation_succeeded` | time_to_activate_ms | Status = CONVERSATION_STARTED |
| `activation_failed` | failure_reason, retry_count | Status = FAILED |
| `session_resumed` | steps_completed, time_since_last_activity | Session restored |
| `onboarding_abandoned` | last_step, time_spent_ms | Session expires (backend event) |

---

## API Mapping

### Endpoints Used

| Feature | Endpoint | Method | Trigger |
|---------|----------|--------|---------|
| Validate invitation | `/api/v1/invitations/{token}/validate` | GET | Page load at `/join/{token}` |
| Create session | `/api/v1/onboarding/sessions` | POST | "Get Started" click |
| Get session state | `/api/v1/onboarding/sessions/{id}` | GET | Session resume / page refresh |
| Submit step | `/api/v1/onboarding/sessions/{id}/steps/{step}` | PUT | Step form submission |
| Complete registration | `/api/v1/onboarding/sessions/{id}/complete` | POST | "Confirm" on Review |
| Poll activation | `/api/v1/onboarding/sessions/{id}/activation-status` | GET | Long-poll after provisioning |
| Retry activation | `/api/v1/onboarding/sessions/{id}/activation/retry` | POST | Retry button click |

### Session Cookie

- Name: `ONBOARDING_SESSION`
- Attributes: HttpOnly, Secure, SameSite=Strict, Path=/api/v1/onboarding
- Set by backend on session creation (POST response)
- Used for all subsequent requests to identify session
- Cleared on completion or expiration

---

## Security

- CSRF token validated on all mutating requests (backend enforces)
- No sensitive data in URL parameters (token is in path, not query string)
- Phone number masked after initial submission
- Session cookie is HttpOnly (not accessible to JavaScript)
- All communication over HTTPS
- Rate limiting: 10 invitation validations per IP/hour, 5 registrations per phone/hour
- Input sanitization: all user input escaped for XSS prevention

---

## Performance

- Invitation validation: < 2s from page load to result
- Step submission: < 1s to confirmation
- Provisioning: < 3s (backend target)
- Activation polling: 30s long-poll (single connection, no rapid polling)
- Total onboarding: < 5 minutes for complete flow

---

## Open Questions

1. **Login link target (US-2, US-4):** When "already registered" is detected, where does the login link point? This depends on WEB-SPEC-002 (Authentication). For now, show the message but the link target is TBD.
2. **Session cookie and device switch:** If a father starts on mobile and continues on desktop (re-clicking the invitation link), does the backend match by phone number or require the same cookie? Backend SPEC-007 Req 2 criteria 13 suggests phone-number matching, but the exact mechanism is unclear.
3. **Invitation metadata display:** The backend returns `inviter_display_name` if available. What if the inviter has no display name? Show nothing? Show "a friend"?
4. **Consent collection:** Backend SPEC-007 Req 6 criteria 10 mentions consent checkboxes (data processing required, marketing optional). These aren't defined in the wizard steps — are they part of FATHER_PROFILE step or REVIEW step?
5. **Timezone detection:** Should the frontend auto-detect timezone via browser API and pre-fill, or require manual selection?

---

## Related Documents

| Document | Relationship |
|----------|-------------|
| Backend SPEC-007 | Source of truth for all API contracts |
| [User Journeys](../ux/USER_JOURNEYS.md) | Journey 1 defines this flow |
| [Screen Inventory](../ux/SCREEN_INVENTORY.md) | Screens O1–O8 |
| [Navigation Model](../ux/NAVIGATION_MODEL.md) | Linear stepper pattern |
| [Tone of Voice](../brand/TONE_OF_VOICE.md) | Copy patterns for errors and empty states |
| [Design Language](../design/DESIGN_LANGUAGE.md) | Design rules that constrain implementation |
| WEB-SPEC-002 (future) | Authentication handoff after activation |
| WEB-SPEC-008 | Workspace handoff destination |
