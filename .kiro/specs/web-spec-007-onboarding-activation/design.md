# Design: Onboarding & Activation Frontend

## Architecture Overview

The onboarding flow is a linear multi-step wizard rendered within a dedicated route group (`/join/`). It operates independently from the authenticated workspace (`/(workspace)/`) — the father is NOT yet authenticated during onboarding.

It reuses the shared infrastructure established by WEB-SPEC-008 (apiClient, types, common components) but introduces its own:
- Wizard state machine (step progression)
- Server-side session management (via cookie)
- Long-polling mechanism (activation status)
- Form architecture (multi-step with server persistence)

## Route Map

```
app/
├── join/
│   └── [token]/
│       ├── page.tsx              # Invitation validation → Welcome (O1)
│       ├── layout.tsx            # Onboarding layout (stepper, no tabs)
│       ├── language/
│       │   └── page.tsx          # Language selection (O2)
│       ├── profile/
│       │   └── page.tsx          # Father profile (O3)
│       ├── children/
│       │   └── page.tsx          # Children setup (O4)
│       ├── goals/
│       │   └── page.tsx          # Goals selection (O5)
│       ├── preferences/
│       │   └── page.tsx          # Preferences (O6)
│       ├── review/
│       │   └── page.tsx          # Review & confirm (O7)
│       └── activate/
│           └── page.tsx          # WhatsApp activation (O8)
```

### URL Structure

| Screen | URL | Route Param |
|--------|-----|-------------|
| Welcome | `/join/{token}` | token |
| Language | `/join/{token}/language` | token |
| Profile | `/join/{token}/profile` | token |
| Children | `/join/{token}/children` | token |
| Goals | `/join/{token}/goals` | token |
| Preferences | `/join/{token}/preferences` | token |
| Review | `/join/{token}/review` | token |
| Activate | `/join/{token}/activate` | token |

## Wizard State Machine

```
WELCOME → LANGUAGE → FATHER_PROFILE → CHILDREN → GOALS → PREFERENCES → REVIEW → ACTIVATION
                                         ↓ skip     ↓ skip    ↓ skip
                                        GOALS    PREFERENCES  REVIEW
```

### Step Model

| Step | Required | Can Skip | Backend Step Name |
|------|----------|----------|-------------------|
| Welcome | Yes | No | — (no submission) |
| Language | Yes | No | LANGUAGE |
| Father Profile | Yes | No | FATHER_PROFILE |
| Children | No | Yes | CHILDREN |
| Goals | No | Yes | GOALS |
| Preferences | No | Yes | PREFERENCES |
| Review | Yes | No | — (triggers complete) |
| Activation | Yes | No | — (polling only) |

## Session Lifecycle

```
[Father clicks link] → Invitation Validated → Session Created (cookie set)
    → Steps submitted (server-side persistence)
    → Complete triggered (provisioning)
    → Activation polling
    → Success → Redirect to Workspace
```

- Session identified by HttpOnly cookie (`ONBOARDING_SESSION`)
- State stored server-side (72h TTL)
- Resume: re-visiting `/join/{token}` with valid cookie restores position
- Resume without cookie: backend matches by phone number (if FATHER_PROFILE completed)

## Provider Hierarchy

```
app/join/[token]/layout.tsx (OnboardingLayout)
└── OnboardingProvider (wizard state context)
    ├── StepIndicator
    └── {children} (Step pages)
```

No QueryProvider needed here — onboarding doesn't use TanStack Query (no caching required; each API call is sequential and non-repeating). Uses direct `apiClient` calls.

## State Management

### Server State (Primary)

All wizard data lives on the backend. The frontend is a thin UI layer over server-side session state.

- No client-side persistence of wizard data (no localStorage)
- Every step submission persists to server immediately
- Browser refresh restores from server via `GET /api/v1/onboarding/sessions/{id}`

### Client State (Minimal)

```typescript
interface OnboardingState {
  sessionId: string | null;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  language: 'he' | 'en' | null;
  isSubmitting: boolean;
  error: OnboardingError | null;
}
```

Managed via React Context (`OnboardingProvider`) — not a global state library.

### Form State

Each step page owns its own form state (uncontrolled or controlled per complexity):
- Simple steps (Language, Goals): controlled state
- Complex steps (Profile, Children): form library with validation (Zod schemas)
- On submit success: form state discarded (server is source of truth)
- On navigate back: form state restored from server session data

## API Integration

### apiClient Reuse

Uses the same `src/lib/api-client.ts` from WEB-SPEC-008 foundation. No separate HTTP client.

### Onboarding Service Layer

```
src/services/onboarding.ts
```

```typescript
export async function validateInvitation(token: string): Promise<InvitationValidation>;
export async function createSession(token: string): Promise<SessionCreateResponse>;
export async function getSession(sessionId: string): Promise<SessionState>;
export async function submitStep(sessionId: string, step: string, data: unknown): Promise<StepResponse>;
export async function completeOnboarding(sessionId: string): Promise<ProvisioningResponse>;
export async function getActivationStatus(sessionId: string): Promise<ActivationStatus>;
export async function retryActivation(sessionId: string): Promise<ActivationRetryResponse>;
```

### Long-Polling (Activation)

```typescript
// src/hooks/useActivationPolling.ts
function useActivationPolling(sessionId: string) {
  // Recursive fetch with 30s server hold
  // On status change → update state
  // On timeout → retry immediately (server handles backoff)
  // On CONVERSATION_STARTED → stop polling, show success
  // On FAILED → stop polling, show failure with retry
  // Cleanup on unmount
}
```

No TanStack Query for this — custom hook with AbortController for cleanup.

## Form Validation Strategy

### Client-Side (Immediate Feedback)

- Zod schemas matching backend validation rules
- Validate on blur (field exits focus)
- Validate on submit (all fields)
- No validation on keystroke

### Server-Side (Authority)

- Backend validates on every `PUT /steps/{step}` call
- Backend may reject data client-side validation passed (e.g., duplicate phone)
- Backend errors mapped to field-level UI errors via error code → field name mapping

### Error Code Mapping

```typescript
const errorFieldMap: Record<string, string> = {
  'INVALID_DISPLAY_NAME': 'displayName',
  'INVALID_PHONE_FORMAT': 'phoneNumber',
  'PHONE_ALREADY_REGISTERED': 'phoneNumber',
  'INVALID_EMAIL_FORMAT': 'email',
  'INVALID_TIMEZONE': 'timezone',
  'INVALID_CHILD_NAME': 'children[{index}].name',
  'INVALID_BIRTH_DATE': 'children[{index}].birthDate',
  'MAX_CHILDREN_EXCEEDED': '_form',
};
```

## Component Hierarchy

```
src/components/onboarding/
├── OnboardingLayout.tsx        # Stepper shell (no tabs, linear progress)
├── StepIndicator.tsx           # Progress dots / "Step N of M"
├── WelcomeScreen.tsx           # Value proposition + CTA
├── LanguageSelector.tsx        # Language cards (Hebrew / English)
├── ProfileForm.tsx             # Name, phone, email, timezone
├── ChildrenForm.tsx            # Dynamic child list (add/remove)
├── ChildCard.tsx               # Single child input group
├── GoalsSelector.tsx           # Multi-select goal cards
├── PreferencesForm.tsx         # Style, time, frequency, quiet hours
├── ReviewSummary.tsx           # Read-only summary with edit links
├── ActivationScreen.tsx        # Deep link + polling status
├── ActivationSuccess.tsx       # Success state + "Go to Dashboard"
├── ActivationFailed.tsx        # Failure state + retry
├── InvitationError.tsx         # Invalid/expired/used invitation states
└── SkipButton.tsx              # "Skip for now" for optional steps
```

## Folder Structure (Additions to WEB-SPEC-008 Foundation)

```
src/
├── services/
│   └── onboarding.ts           # NEW: onboarding API functions
├── hooks/
│   └── useActivationPolling.ts # NEW: long-poll hook
├── types/
│   └── onboarding.ts           # NEW: onboarding DTOs
├── constants/
│   └── onboarding.ts           # NEW: step names, predefined goals, coaching styles
├── components/
│   └── onboarding/             # NEW: all onboarding components (see hierarchy above)
└── utils/
    └── phone.ts                # NEW: E.164 formatting, country code helpers
```

## Error Handling

### Error Categories (extends WEB-SPEC-008 ErrorState)

| Category | Handling |
|----------|----------|
| Invalid invitation (404) | Dedicated InvitationError screen |
| Expired/revoked (410) | Dedicated InvitationError screen |
| Rate limited (429) | Countdown timer on current screen |
| Duplicate phone (409) | Inline field error + login link |
| Session expired (403) | Full-screen message + "Start Fresh" |
| Validation (400) | Inline field errors |
| Step out of order (422) | Redirect to correct step |
| Server error (500) | Inline error with retry on current step |
| Network offline | "You're offline" banner with auto-retry |

### Retry Behavior

- Step submission: manual retry (button re-enables on error)
- Provisioning: manual retry (button)
- Activation polling: automatic (server long-poll handles backoff)
- Activation retry: manual (max 3 attempts)
- Network recovery: auto-retry last failed request

## Security

- No authentication required to START onboarding (invitation token grants access)
- Session cookie set by backend on session creation — frontend never creates tokens
- CSRF: backend validates; frontend includes cookie automatically (SameSite=Strict)
- No sensitive data stored client-side
- Phone masked after initial submission
- XSS: all user input rendered via React (auto-escaped)

## Responsive Behavior

- **Mobile-first:** optimized for entry from WhatsApp (most common path)
- Single column layout at all breakpoints
- Forms: full-width inputs, large touch targets (44×44px minimum)
- Desktop: centered content column (max-width ~480px) for readability
- Step indicator: horizontal dots on mobile, vertical sidebar on desktop (optional)

## Localization Architecture

- Language selected at step 2 → stored in `OnboardingProvider` context
- UI strings from a translation file (`src/constants/onboarding-i18n.ts` or i18n library)
- `dir` attribute set on layout root based on language
- CSS logical properties used throughout (margin-inline-start, etc.)
- Date format adapts: dd/MM/yyyy (Hebrew) vs MM/dd/yyyy (English)
- Phone input always LTR regardless of document direction

## Performance

- No heavy dependencies needed (no chart library, no rich editor)
- Code splitting: `/join/` routes in their own chunk (not bundled with workspace)
- Images: minimal (one welcome illustration, WhatsApp logo on activation)
- Validation: client-side Zod schemas are lightweight
- Long-polling: single HTTP connection, no rapid retries

## Analytics Architecture

Reuse the same analytics abstraction from WEB-SPEC-008. Events defined in the product spec (FR-7).

## Accessibility

- All form fields: visible labels + `aria-describedby` for errors
- Step indicator: `aria-current="step"` + `role="progressbar"`
- Focus management: on step transition, focus first input or heading
- Skip links: not needed (linear flow with minimal nav)
- Keyboard: Tab through fields, Enter to submit, Escape to dismiss errors

## Dependencies

### Reused from WEB-SPEC-008 Foundation

- `src/lib/api-client.ts` — HTTP abstraction
- `src/components/common/SkeletonScreen.tsx` — loading states
- `src/components/common/ErrorState.tsx` — error display
- `src/components/common/EmptyState.tsx` — empty states
- `src/config/api.ts` — base URL
- `src/types/common.ts` — ApiError type

### New Dependencies

- Form validation: Zod (already planned for WEB-SPEC-008)
- Phone input: lightweight country code component (or custom)
- No new heavy libraries required

## Open Questions

1. **Authentication handoff:** After activation succeeds and the father clicks "Go to Dashboard," how is the authenticated session established? Does the onboarding cookie transform into an auth token? Or does the father need to "log in" separately? (Depends on WEB-SPEC-002)
2. **Device switch resume:** Backend SPEC-007 says resume works by phone number match when cookie is absent. Does the frontend need a "Resume your registration" flow with phone number input, or does re-clicking the same invitation link handle this automatically?
3. **Consent checkboxes:** Backend SPEC-007 Req 6.10 mentions consent collection. Which step contains these? Are they part of Profile or Review?
4. **Timezone auto-detection:** Should the frontend use `Intl.DateTimeFormat().resolvedOptions().timeZone` to pre-fill timezone, or always default to Asia/Jerusalem?
5. **Invitation metadata richness:** What exactly is returned in the invitation validation response? The backend spec defines the fields but doesn't specify if `inviter_display_name` is always present.
