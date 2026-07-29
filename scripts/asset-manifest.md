# Dad Coach - Asset Manifest (Updated)

All assets generated using Gemini 2.5 Flash Image API with Master Style Guide reference.

## Generated Assets Summary

| Folder | Count | Status |
|--------|-------|--------|
| `public/logos/` | 2 | ✅ Complete |
| `public/brand/` | 1 | ✅ Complete |
| `public/belts/` | 8 | ✅ Complete |
| `public/illustrations/` | 12 | ✅ Complete |
| `public/dashboard/` | 20 | ✅ Complete |
| `public/landing/` | 5 | ✅ Complete |
| `public/achievements/` | 10 | ✅ Complete |
| **TOTAL** | **58** | ✅ |

---

## Logos

| File | Path | Used In |
|------|------|---------|
| `dad-coach-logo-full.webp` | `public/logos/` | Header, all screens |
| `dad-coach-logo-icon.webp` | `public/logos/` | Favicon, mobile header |

## Brand

| File | Path | Used In |
|------|------|---------|
| `og-image.webp` | `public/brand/` | Social sharing meta tags |

## Belts (8 levels)

All belt characters: same father figure with short beard, white martial arts gi, colored belt.

| File | Path | Level |
|------|------|-------|
| `white-belt.webp` | `public/belts/` | Beginner |
| `yellow-belt.webp` | `public/belts/` | Learner |
| `orange-belt.webp` | `public/belts/` | Improving |
| `green-belt.webp` | `public/belts/` | Committed |
| `blue-belt.webp` | `public/belts/` | Advanced |
| `purple-belt.webp` | `public/belts/` | Expert |
| `brown-belt.webp` | `public/belts/` | Master |
| `black-belt.webp` | `public/belts/` | Dad Sensei (flexing!) |

**Code usage:** `/belts/${level.toLowerCase()}-belt.webp`

## Onboarding Illustrations

| File | Path | Screen |
|------|------|--------|
| `onboarding-language-selection.webp` | `public/illustrations/` | Language Selection |
| `onboarding-welcome.webp` | `public/illustrations/` | Welcome |
| `onboarding-register.webp` | `public/illustrations/` | Registration |
| `onboarding-father-info.webp` | `public/illustrations/` | Father Information |
| `onboarding-children.webp` | `public/illustrations/` | Children Setup |
| `onboarding-goals.webp` | `public/illustrations/` | Goals Selection |
| `onboarding-activation.webp` | `public/illustrations/` | WhatsApp Activation |
| `onboarding-success.webp` | `public/illustrations/` | Success/Celebration |

## State Illustrations

| File | Path | Used For |
|------|------|----------|
| `celebration-confetti.webp` | `public/illustrations/` | Success states |
| `error-state.webp` | `public/illustrations/` | Error screens |
| `offline-state.webp` | `public/illustrations/` | Offline detection |
| `session-expired.webp` | `public/illustrations/` | Session timeout |

## Dashboard

### Coach Characters

| File | Path | Pose |
|------|------|------|
| `coach-avatar.webp` | `public/dashboard/` | Portrait (judo gi + black belt) |
| `coach-greeting.webp` | `public/dashboard/` | Welcoming wave |
| `coach-thinking.webp` | `public/dashboard/` | Thoughtful pose |
| `coach-celebrating.webp` | `public/dashboard/` | Celebrating/encouraging |

### Motivational Characters

| File | Path | Message |
|------|------|---------|
| `motivation-doing-great.webp` | `public/dashboard/` | "You're doing great!" |
| `motivation-small-steps.webp` | `public/dashboard/` | "Small steps. Big impact." |
| `motivation-mission-complete.webp` | `public/dashboard/` | "Mission completed!" |
| `motivation-stronger-together.webp` | `public/dashboard/` | "Stronger together." |

### Mission Illustrations

| File | Path | Mission Type |
|------|------|-------------|
| `mission-quality-time.webp` | `public/dashboard/` | Quality Time |
| `mission-listening.webp` | `public/dashboard/` | Active Listening |
| `mission-play.webp` | `public/dashboard/` | Outdoor Play |
| `mission-conversation.webp` | `public/dashboard/` | Meaningful Conversation |
| `mission-routine.webp` | `public/dashboard/` | Daily Routine |

### Empty States

| File | Path | Section |
|------|------|---------|
| `dashboard-empty.webp` | `public/dashboard/` | Dashboard (no data) |
| `growth-empty.webp` | `public/dashboard/` | Growth section |
| `insights-empty.webp` | `public/dashboard/` | Insights section |

## Landing Page

| File | Path | Section |
|------|------|---------|
| `landing-hero.webp` | `public/landing/` | Hero section |
| `landing-feature-relationships.webp` | `public/landing/` | Feature card |
| `landing-feature-guidance.webp` | `public/landing/` | Feature card |
| `landing-feature-achievements.webp` | `public/landing/` | Feature card |
| `landing-feature-memories.webp` | `public/landing/` | Feature card |

## Achievements

| File | Path | Achievement |
|------|------|-------------|
| `great-listener.webp` | `public/achievements/` | Great Listener |
| `quality-time-champion.webp` | `public/achievements/` | Quality Time Champion |
| `first-mission.webp` | `public/achievements/` | First Mission Complete |
| `streak-7-days.webp` | `public/achievements/` | 7-Day Streak |
| `streak-30-days.webp` | `public/achievements/` | 30-Day Streak |
| `deep-conversation.webp` | `public/achievements/` | Deep Conversation |
| `patience-master.webp` | `public/achievements/` | Patience Master |
| `playful-dad.webp` | `public/achievements/` | Playful Dad |
| `bedtime-hero.webp` | `public/achievements/` | Bedtime Hero |
| `growth-milestone.webp` | `public/achievements/` | Growth Milestone |

**Code usage:** `/achievements/${slug}.webp`

---

## Visual Style Rules

- All illustrations use the Master Style Guide (`docs/master-style-guide.png`)
- 3D Pixar-like rendering, warm lighting
- Dark navy backgrounds (#0F172A, #1E293B)
- Gold (#B88B1E) and Emerald (#13A881) accents
- Father character: consistent appearance with short beard across all images
- Coach character: same father style but wearing white judo gi with black belt
- No text in any illustration
- All files are WebP format for optimal web performance
