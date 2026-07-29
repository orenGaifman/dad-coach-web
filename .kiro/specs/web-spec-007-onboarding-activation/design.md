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

## Screen Visual Layouts

This section describes the exact visual layout of every onboarding screen. The implementation must follow these layouts precisely.

### Global Design Rules

- **Background:** All screens use dark navy gradient (`bg-gradient-to-b from-[#0F172A] to-[#1E293B]`)
- **Max width:** Content constrained to `max-w-md` (448px) centered on desktop
- **Mobile:** Full width, single column, minimum padding `px-6`
- **Typography:** Inter/Noto Sans. Headings white, body text `text-gray-300`
- **Buttons:** Primary = indigo-500 rounded-full with arrow icon. Full width on mobile.
- **Cards:** `bg-white/5 backdrop-blur border border-white/10 rounded-2xl`
- **Spacing:** Generous vertical spacing `space-y-6` between sections
- **Illustrations:** Centered, `max-w-[280px]` on mobile, `max-w-[320px]` on desktop

---

### Screen O1: Language Selection (`/join/[token]/language`)

```
┌─────────────────────────────────┐
│         [Logo Icon 32px]         │  ← /logos/dad-coach-logo-icon.webp
│                                  │
│    ┌──────────────────────┐      │
│    │                      │      │
│    │   [Illustration]     │      │  ← /illustrations/onboarding-language-selection.webp
│    │     280x280          │      │     Centered, rounded
│    │                      │      │
│    └──────────────────────┘      │
│                                  │
│     "Choose your language"       │  ← h1, text-2xl, font-bold, white, center
│     "בחר את השפה שלך"           │  ← subtitle, text-gray-400, center
│                                  │
│  ┌────────────┐ ┌────────────┐   │
│  │ 🇬🇧         │ │ 🇮🇱         │   │  ← Two language cards, side by side
│  │  English   │ │   עברית    │   │     Selected: border-indigo-500 bg-indigo-500/10
│  │ [selected] │ │            │   │     Unselected: border-white/10 bg-white/5
│  └────────────┘ └────────────┘   │     Size: flex-1, py-4, rounded-xl
│                                  │
│  ┌──────────────────────────┐    │
│  │     Continue →            │    │  ← Primary button, full width
│  └──────────────────────────┘    │
│                                  │
└─────────────────────────────────┘
```

**Key details:**
- English preselected by default (border-indigo-500)
- Language cards are equal width, `gap-4`
- No step indicator on this screen (first step)
- `dir="ltr"` until Hebrew selected, then `dir="rtl"`

---

### Screen O2: Welcome (`/join/[token]`)

```
┌─────────────────────────────────┐
│                                  │
│    ┌──────────────────────┐      │
│    │                      │      │
│    │   [Hero Illustration]│      │  ← /illustrations/onboarding-welcome.webp
│    │   Father + child on  │      │     Full width, aspect-[4/3], rounded-2xl
│    │   starlit path       │      │     priority loading
│    │                      │      │
│    └──────────────────────┘      │
│                                  │
│  "Become the Father              │  ← h1, text-3xl, font-bold, white
│   You Want to Be"                │
│                                  │
│  "Small daily actions.           │  ← p, text-gray-300, text-lg
│   Big lifelong impact."          │
│                                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│  │ 🔗 │ │ 🌱 │ │ 🏆 │ │ 💛 │    │  ← 4 feature icons in a row
│  │Rel.│ │Grow│ │Ach.│ │Mem.│    │     /landing/landing-feature-*.webp (48x48)
│  └────┘ └────┘ └────┘ └────┘    │     grid grid-cols-4 gap-2
│                                  │     Below each: tiny label text-xs text-gray-400
│  ┌──────────────────────────┐    │
│  │  Start Your Journey →     │    │  ← Primary CTA button, rounded-full
│  └──────────────────────────┘    │     bg-amber-500 hover:bg-amber-600
│                                  │     text-black font-semibold
└─────────────────────────────────┘
```

**Key details:**
- No step indicator (entry screen)
- CTA button is golden/amber (stands out against dark navy)
- Feature icons are small thumbnails from landing features
- If `inviter_display_name` available: show "Invited by {name}" above CTA

---

### Screen O3: Father Profile (`/join/[token]/profile`)

```
┌─────────────────────────────────┐
│  [Step 2 of 6]  ●●○○○○          │  ← StepIndicator component
│                                  │
│    ┌──────────────────────┐      │
│    │  [Illustration 160px]│      │  ← /illustrations/onboarding-father-info.webp
│    └──────────────────────┘      │     Centered, smaller than welcome
│                                  │
│  "Let's start your journey"      │  ← h2, text-xl, font-semibold, white
│  "Just a few quick questions"    │  ← p, text-gray-400
│                                  │
│  ┌──────────────────────────┐    │
│  │ Display Name              │    │  ← Label + Input
│  │ ┌──────────────────────┐ │    │     Input: bg-white/5 border-white/10
│  │ │ "Daniel"              │ │    │     rounded-xl py-3 px-4
│  │ └──────────────────────┘ │    │     Focus: border-indigo-500
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ WhatsApp Number           │    │
│  │ ┌─────┐┌───────────────┐ │    │  ← Country code dropdown + phone input
│  │ │+972 ▾││ 50-123-4567   │ │    │     Side by side: w-20 + flex-1
│  │ └─────┘└───────────────┘ │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Email (optional)          │    │
│  │ ┌──────────────────────┐ │    │
│  │ │                      │ │    │
│  │ └──────────────────────┘ │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Timezone                  │    │  ← Auto-detected, shown as select
│  │ ┌──────────────────────┐ │    │
│  │ │ Asia/Jerusalem    ▾  │ │    │
│  │ └──────────────────────┘ │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │      Continue →           │    │  ← Primary button
│  └──────────────────────────┘    │
│                                  │
└─────────────────────────────────┘
```

**Key details:**
- Validation errors appear below each field in `text-red-400 text-sm`
- Error fields get `border-red-400`
- Phone field always LTR even in RTL mode

---

### Screen O4: Children Setup (`/join/[token]/children`)

```
┌─────────────────────────────────┐
│  [Step 3 of 6]  ●●●○○○          │
│                                  │
│    ┌──────────────────────┐      │
│    │  [Illustration 160px]│      │  ← /illustrations/onboarding-children.webp
│    └──────────────────────┘      │
│                                  │
│  "How many children             │  ← h2, text-xl
│   do you have?"                  │
│                                  │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌──┐          │  ← Number selector: 1-4+ buttons
│  │1│ │2│ │3│ │4│ │4+│          │     Selected: bg-indigo-500 text-white
│  └─┘ └─┘ └─┘ └─┘ └──┘          │     Size: w-12 h-12 rounded-full
│                                  │
│  ── Child 1 ──────────────────   │  ← Child card with border-l-2 border-indigo-500
│  │ Name:    [______________] │   │
│  │ Birth:   [__/__/____]     │   │
│  │ Gender:  ○Boy ○Girl ○Skip │   │
│  └───────────────────────────┘   │
│                                  │
│  ── Child 2 ──────────────────   │
│  │ Name:    [______________] │   │
│  │ Birth:   [__/__/____]     │   │
│  │ Gender:  ○Boy ○Girl ○Skip │   │
│  └───────────────────────────┘   │
│                                  │
│  [+ Add another child]           │  ← text-indigo-400, if < 8
│                                  │
│  ┌────────────┐ ┌────────────┐   │
│  │ Skip for now│ │ Continue → │   │  ← Skip (ghost) + Continue (primary)
│  └────────────┘ └────────────┘   │
│                                  │
└─────────────────────────────────┘
```

---

### Screen O5: Goals (`/join/[token]/goals`)

```
┌─────────────────────────────────┐
│  [Step 4 of 6]  ●●●●○○          │
│                                  │
│    ┌──────────────────────┐      │
│    │  [Illustration 140px]│      │  ← /illustrations/onboarding-goals.webp
│    └──────────────────────┘      │
│                                  │
│  "What would you like to        │  ← h2, text-xl
│   improve as a father?"          │
│  "(Choose up to 5)"             │  ← text-gray-400, text-sm
│                                  │
│  ┌──────────────────────────┐    │  ← Goal cards: selectable
│  │ ☑ Build stronger connection│   │     Selected: bg-indigo-500/10 border-indigo-500
│  │   with my children        │    │     Unselected: bg-white/5 border-white/10
│  └──────────────────────────┘    │     Each: rounded-xl p-4, checkbox left
│  ┌──────────────────────────┐    │
│  │ ☑ Communicate better      │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ □ Spend more quality time │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ □ Be more patient         │    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ □ Lead by example         │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌────────────┐ ┌────────────┐   │
│  │ Skip for now│ │ Continue → │   │
│  └────────────┘ └────────────┘   │
│                                  │
└─────────────────────────────────┘
```

---

### Screen O6: Preferences (`/join/[token]/preferences`)

```
┌─────────────────────────────────┐
│  [Step 5 of 6]  ●●●●●○          │
│                                  │
│  "How would you like             │  ← h2, text-xl
│   to be coached?"                │
│                                  │
│  ┌──────────────────────────┐    │  ← Coaching style cards (radio)
│  │ ○ Encouraging              │    │     Selected: border-indigo-500
│  │   "Positive focus, gentle" │    │     Each has title + description
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ ● Direct                   │    │
│  │   "Clear, honest feedback"│    │
│  └──────────────────────────┘    │
│  ┌──────────────────────────┐    │
│  │ ○ Balanced                 │    │
│  │   "Mix of both styles"    │    │
│  └──────────────────────────┘    │
│                                  │
│  "Best time for coaching?"       │  ← Label
│  ┌──────────────────────────┐    │
│  │  08:00 AM            ▾   │    │  ← Time picker (30min intervals)
│  └──────────────────────────┘    │
│                                  │
│  ┌────────────┐ ┌────────────┐   │
│  │ Skip for now│ │ Continue → │   │
│  └────────────┘ └────────────┘   │
│                                  │
└─────────────────────────────────┘
```

---

### Screen O7: Review (`/join/[token]/review`)

```
┌─────────────────────────────────┐
│  [Step 6 of 6]  ●●●●●●          │
│                                  │
│  "Review your information"       │  ← h2
│                                  │
│  ┌──────────────────────────┐    │  ← Summary card sections
│  │ Profile             [Edit]│    │     Each section: bg-white/5 rounded-xl p-4
│  │ Name: Daniel              │    │     [Edit] = text-indigo-400, navigates back
│  │ Phone: ****4567           │    │     Phone always masked
│  │ Timezone: Asia/Jerusalem  │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Children            [Edit]│    │
│  │ • Yoav (5 years)         │    │
│  │ • Maya (3 years)         │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Goals               [Edit]│    │
│  │ • Build stronger connect. │    │
│  │ • Communicate better      │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Preferences         [Edit]│    │
│  │ Style: Direct             │    │
│  │ Time: 08:00 AM           │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │   Confirm & Start →       │    │  ← Primary button, amber/gold
│  └──────────────────────────┘    │
│                                  │
└─────────────────────────────────┘
```

---

### Screen O8: Activation (`/join/[token]/activate`)

```
┌─────────────────────────────────┐
│                                  │
│    ┌──────────────────────┐      │
│    │  [Illustration 200px]│      │  ← /illustrations/onboarding-activation.webp
│    │  Father + phone +    │      │
│    │  coach hologram      │      │
│    └──────────────────────┘      │
│                                  │
│  "Welcome to Dad Coach!"        │  ← h2, text-2xl, white
│                                  │
│  "Your coach is already          │  ← p, text-gray-300
│   waiting for you on WhatsApp.   │
│   Let's do this together!"       │
│                                  │
│  ┌──────────────────────────┐    │
│  │ 💬 Open WhatsApp →        │    │  ← Green button (#25D366)
│  └──────────────────────────┘    │     Opens wa.me deep link
│                                  │
│  "or copy this message:"        │  ← text-sm, text-gray-400
│  ┌──────────────────────────┐    │
│  │ "Hi Coach, I'm ready!" 📋│    │  ← Copy-to-clipboard box
│  └──────────────────────────┘    │
│                                  │
│  [◌ Waiting for connection...]   │  ← Polling indicator, subtle pulse
│                                  │
│  "The journey begins now."       │  ← footer text, text-gray-500, italic
│                                  │
└─────────────────────────────────┘
```

**Success state (replaces above):**
```
┌─────────────────────────────────┐
│                                  │
│    ┌──────────────────────┐      │
│    │  [Success Illust.]   │      │  ← /illustrations/onboarding-success.webp
│    │  Father celebrating  │      │
│    └──────────────────────┘      │
│                                  │
│  "You're connected! 🎉"         │  ← h2, text-2xl, white
│                                  │
│  "Your coaching journey          │
│   starts now."                   │
│                                  │
│  ┌──────────────────────────┐    │
│  │   Go to Dashboard →       │    │  ← Primary button
│  └──────────────────────────┘    │
│                                  │
└─────────────────────────────────┘
```

---

### StepIndicator Component

```
Mobile:  ● ● ● ○ ○ ○   Step 3 of 6
Desktop: Same, centered above content
```

- Filled dots: `bg-indigo-500 w-2.5 h-2.5 rounded-full`
- Empty dots: `bg-white/20 w-2.5 h-2.5 rounded-full`
- Current step text: `text-gray-400 text-sm`
- `aria-current="step"` on active dot
- Gap between dots: `gap-1.5`

---

## Visual Assets

All onboarding illustrations are pre-generated and available in the `public/` folder. Use Next.js `<Image>` component with the paths below.

### Onboarding Screen Illustrations

| Screen | Asset Path | Description |
|--------|-----------|-------------|
| Language Selection | `/illustrations/onboarding-language-selection.webp` | Welcoming father figure, warm atmosphere |
| Welcome | `/illustrations/onboarding-welcome.webp` | Father and child on starlit path toward torii gate |
| Registration | `/illustrations/onboarding-register.webp` | Father with phone, modern connected feel |
| Father Profile | `/illustrations/onboarding-father-info.webp` | Father with golden aura, identity being recognized |
| Children Setup | `/illustrations/onboarding-children.webp` | Father with 2-3 happy children |
| Goals | `/illustrations/onboarding-goals.webp` | Father at base of mountain path with glowing waypoints |
| Activation | `/illustrations/onboarding-activation.webp` | Father with phone, coach appearing as hologram |
| Success | `/illustrations/onboarding-success.webp` | Father celebrating, arms raised, golden light |

### State Illustrations

| State | Asset Path | Description |
|-------|-----------|-------------|
| Celebration | `/illustrations/celebration-confetti.webp` | Golden confetti, sparkles |
| Error | `/illustrations/error-state.webp` | Paper airplane off course |
| Offline | `/illustrations/offline-state.webp` | Glowing lantern in fog |
| Session Expired | `/illustrations/session-expired.webp` | Hourglass with golden sand |

### Usage Pattern

```tsx
import Image from 'next/image';

// In a step page component:
<Image
  src="/illustrations/onboarding-welcome.webp"
  alt="Welcome to Dad Coach"
  width={400}
  height={400}
  priority // for above-the-fold images
/>
```

---

## Open Questions

1. **Authentication handoff:** After activation succeeds and the father clicks "Go to Dashboard," how is the authenticated session established? Does the onboarding cookie transform into an auth token? Or does the father need to "log in" separately? (Depends on WEB-SPEC-002)
2. **Device switch resume:** Backend SPEC-007 says resume works by phone number match when cookie is absent. Does the frontend need a "Resume your registration" flow with phone number input, or does re-clicking the same invitation link handle this automatically?
3. **Consent checkboxes:** Backend SPEC-007 Req 6.10 mentions consent collection. Which step contains these? Are they part of Profile or Review?
4. **Timezone auto-detection:** Should the frontend use `Intl.DateTimeFormat().resolvedOptions().timeZone` to pre-fill timezone, or always default to Asia/Jerusalem?
5. **Invitation metadata richness:** What exactly is returned in the invitation validation response? The backend spec defines the fields but doesn't specify if `inviter_display_name` is always present.
