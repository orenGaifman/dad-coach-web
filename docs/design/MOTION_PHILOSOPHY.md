# Motion Philosophy

## Why Motion Matters

Motion tells a story about how thoughtful a product is. Subtle, purposeful animation communicates premium quality and guides attention. But motion in a coaching product must never feel flashy, distracting, or performance-oriented. It serves clarity and emotion — never spectacle.

## Emotional Intent

### Should Create

- Smooth, confident transitions that feel natural
- Subtle feedback that confirms actions
- Gentle celebration of achievements
- Sense of continuity and spatial awareness
- Feeling of care and craftsmanship

### Should Avoid

- Distraction from content or coaching flow
- Excitement that feels gamified or performative
- Lag or interruption to task completion
- Flashy animations that demand attention
- Motion that triggers discomfort (excessive bounce, rapid movement)

## Motion Principles

### 1. Purposeful, Never Decorative

Every animation must answer: "What does this help the user understand?" If the answer is "nothing — it just looks nice," remove it. Motion serves comprehension, not aesthetic.

### 2. Fast and Responsive

Transitions should feel instant. They guide the eye without slowing the task. Standard interactions (page changes, element reveals) should be perceptible but never felt as waiting.

- Interface transitions: 150–250ms
- Content reveals: 200–350ms
- Achievement moments: 400–800ms (the only place motion is allowed to linger)

### 3. Natural Easing

Movement follows natural physics — ease-out for entrances (arriving with confidence), ease-in-out for transitions (smooth through-movement). No linear motion. No mechanical feeling.

### 4. Quiet by Default, Expressive When Earned

Daily interactions are subtle (micro-fades, gentle slides). Celebration moments — belt achievements, milestones — are allowed more expression. This contrast makes achievements feel meaningful.

### 5. Reduce, Don't Add

Motion should reduce complexity. A well-animated transition helps a father understand where content came from or where it went. It simplifies spatial relationships rather than adding visual complexity.

### 6. Respect Reduced Motion

Always honor `prefers-reduced-motion`. All animations degrade gracefully to instant state changes. No information should be lost when motion is disabled.

## Motion Categories

| Category | Behavior | Duration |
|----------|----------|----------|
| **Micro-feedback** | Button press, toggle, input focus | 100–150ms |
| **Transitions** | Page changes, panel slides | 200–300ms |
| **Reveals** | Content appearing, lazy-loaded elements | 250–350ms |
| **Celebrations** | Belt earned, milestone reached | 500–800ms |
| **Loading states** | Skeleton screens, progress indicators | Continuous, gentle |

## Achievement Motion

The belt and milestone system is the one area where motion is allowed to have personality. Even here, the style should feel:

- Dignified, not party-like
- Warm, not explosive
- Brief, not lingering
- Satisfying, not over-the-top

Think: a quiet glow that intensifies, a smooth reveal, a gentle weight settling into place. Not: confetti, fireworks, bouncing elements, or sound effects.

## Anti-Patterns

- Bouncing or elastic animations on standard elements
- Parallax scrolling effects
- Auto-playing animated illustrations
- Delays before content is readable
- Motion that loops continuously without user control
- Celebration animations that cannot be dismissed

## Inspiration

| Reference | Motion Lesson |
|-----------|--------------|
| Apple (iOS transitions) | Spatial continuity, natural physics, purposeful |
| Linear | Subtle, confident micro-interactions |
| Things 3 | Satisfying completions without excess |
| Stripe (website) | Smooth reveals that feel premium |

## Relationship to Brand

Motion supports:

- [Design Philosophy](../brand/DESIGN_PHILOSOPHY.md) — feel don't explain, progress is quiet
- [Visual Direction](./VISUAL_DIRECTION.md) — quiet confidence, progressive depth
- [Brand Principles](../brand/BRAND_PRINCIPLES.md) — calm, premium, minimal
- [Anti-Goals](../brand/ANTI_GOALS.md) — gamification must never become the primary experience
