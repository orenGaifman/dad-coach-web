# Asset Strategy

## Overview

This document defines how visual assets are organized, named, versioned, and maintained within the Dad Coach web application. It serves as the single reference for anyone adding, modifying, or consuming assets.

---

## Current Folder Structure

All publicly served assets live under `public/`:

```
public/
├── achievements/       # Achievement badge graphics
├── belts/              # Belt level graphics (WHITE → BLACK)
├── brand/              # Brand marks, logos, OG images
├── dashboard/          # Dashboard-specific illustrations or graphics
├── icons/              # UI icons (navigation, actions, status)
├── illustrations/      # Emotional illustrations (onboarding, empty states, milestones)
├── landing/            # Reserved for future marketing/landing page assets
├── logos/              # Product logo variations
├── file.svg            # Next.js scaffold default (unused)
├── globe.svg           # Next.js scaffold default (unused)
├── next.svg            # Next.js scaffold default (unused)
├── vercel.svg          # Next.js scaffold default (unused)
├── window.svg          # Next.js scaffold default (unused)
```

**Note:** Root-level SVG files are Next.js scaffold defaults and are not used by the application. Do not reference them in new code.

---

## Asset Categories

### 1. Belt Graphics (`public/belts/`)

Visual representations of the 8 belt levels.

| Belt | Filename Pattern | Usage |
|------|-----------------|-------|
| White | `belt-white.*` | Growth section, dashboard summary |
| Yellow | `belt-yellow.*` | Growth section, celebration modal |
| Orange | `belt-orange.*` | Growth section, celebration modal |
| Green | `belt-green.*` | Growth section, celebration modal |
| Blue | `belt-blue.*` | Growth section, celebration modal |
| Purple | `belt-purple.*` | Growth section, celebration modal |
| Brown | `belt-brown.*` | Growth section, celebration modal |
| Black | `belt-black.*` | Growth section, celebration modal |

### 2. Achievement Graphics (`public/achievements/`)

Badge graphics for the 15+ predefined achievements.

| Filename Pattern | Example |
|-----------------|---------|
| `achievement-{slug}.*` | `achievement-first-steps.svg` |

Slug derived from achievement name: lowercase, hyphens replace spaces.

### 3. Illustrations (`public/illustrations/`)

Emotional illustrations used at key moments. See [Illustration Style](./ILLUSTRATION_STYLE.md) for guidelines.

| Context | Filename Pattern |
|---------|-----------------|
| Onboarding welcome | `onboarding-welcome.*` |
| Empty dashboard state | `empty-dashboard.*` |
| Empty achievements state | `empty-achievements.*` |
| Error state | `error-general.*` |
| Offline state | `offline.*` |
| Celebration (generic) | `celebration.*` |

### 4. Icons (`public/icons/`)

UI icons for navigation and actions. See [Iconography](./ICONOGRAPHY.md) for style guidelines.

| Category | Filename Pattern | Example |
|----------|-----------------|---------|
| Navigation | `nav-{name}.svg` | `nav-home.svg`, `nav-growth.svg` |
| Actions | `action-{name}.svg` | `action-log.svg`, `action-edit.svg` |
| Status | `status-{name}.svg` | `status-streak.svg` |

### 5. Logos (`public/logos/`)

Product logo in various formats and contexts.

| Variant | Filename | Usage |
|---------|----------|-------|
| Full logo | `logo-full.*` | Header, marketing |
| Logomark only | `logo-mark.*` | Favicon, small contexts |
| Dark background | `logo-full-dark.*` | Dark mode, dark sections |

### 6. Brand (`public/brand/`)

Brand assets for social sharing and external contexts.

| Asset | Filename |
|-------|----------|
| Open Graph image | `og-image.png` |
| Favicon | Served from `app/favicon.ico` |

### 7. Landing Page (`public/landing/`)

Reserved for future marketing/landing page assets. A public landing page is out of scope for the MVP — the product is accessed via invitation links only.

### 8. Dashboard (`public/dashboard/`)

Dashboard-specific decorative or structural assets.

---

## Naming Conventions

### Rules

1. **Lowercase only** — no capitals in filenames
2. **Hyphens for separators** — no underscores, no camelCase
3. **Category prefix when ambiguous** — `nav-home.svg` not just `home.svg`
4. **Descriptive slug** — name describes what it is, not where it's used
5. **No version numbers in filenames** — versioning is handled by git

### Format

```
{category}-{descriptor}[-{variant}].{extension}
```

Examples:
- `belt-green.svg`
- `achievement-first-steps.svg`
- `nav-growth.svg`
- `logo-full-dark.svg`
- `onboarding-welcome.svg`

---

## File Formats

| Format | Use For | Why |
|--------|---------|-----|
| **SVG** | Icons, logos, belt graphics, achievement badges | Scalable, small file size, themeable via CSS |
| **PNG** | OG images, fallback for complex illustrations | Required by social platforms, good for raster |
| **WebP** | Photography, complex illustrations | Superior compression for raster imagery |
| **Lottie (JSON)** | Celebration animations, progress transitions | Lightweight vector animation |

### Format Priority

1. SVG for anything that can be vector
2. Lottie for animation
3. WebP for raster imagery
4. PNG only where required by external systems (OG images, favicons)

---

## Asset Lifecycle

### Creation

1. Design asset according to relevant style guide ([Illustration](./ILLUSTRATION_STYLE.md), [Iconography](./ICONOGRAPHY.md), [Photography](./PHOTOGRAPHY_GUIDELINES.md))
2. Export in correct format and size
3. Optimize (SVGO for SVG, compression for raster)
4. Name according to conventions above
5. Place in correct folder
6. Commit with descriptive message

### Modification

1. Modify source file (design tool)
2. Re-export with same filename (overwrite)
3. Verify usage contexts still render correctly
4. Commit with description of what changed

### Deprecation

1. Remove references from code
2. Delete file
3. Commit with explanation

---

## Optimization Requirements

| Format | Optimization |
|--------|-------------|
| SVG | Run through SVGO — remove metadata, editor artifacts, unnecessary attributes |
| PNG | Compress to acceptable quality (85% minimum) |
| WebP | Target < 100KB for illustrations, < 50KB for thumbnails |
| Lottie | Minimize JSON — no unused layers, flatten where possible |

---

## Theming and Dark Mode

SVG assets used in UI should support color theming:

- Use `currentColor` for stroke/fill where icon should match text color
- Provide `-dark` variant only when the asset cannot adapt via CSS
- Belt and achievement graphics may have fixed colors (they represent specific achievements)

---

## AI-Generated Assets

If AI tools (Midjourney, DALL·E, etc.) are used for illustration generation:

- Output must be post-processed to match [Illustration Style](./ILLUSTRATION_STYLE.md)
- Raw AI output is never committed directly
- Source prompts are documented in asset commit messages
- Generated assets receive the same naming and optimization as hand-crafted assets
- Licensing must be verified before use

---

## What Does Not Belong Here

- Component-level styling (belongs in CSS/Tailwind)
- Font files (handled by `next/font`)
- Third-party library assets (managed via npm)
- Development/debug assets
- Unoptimized source files (Figma, Illustrator — live in design tools, not repo)

---

## Related Documents

- [ILLUSTRATION_STYLE.md](./ILLUSTRATION_STYLE.md) — style guide for illustrations
- [ICONOGRAPHY.md](./ICONOGRAPHY.md) — style guide for icons
- [PHOTOGRAPHY_GUIDELINES.md](./PHOTOGRAPHY_GUIDELINES.md) — photo style and usage
- [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) — colors used in assets
- [VISUAL_DIRECTION.md](./VISUAL_DIRECTION.md) — overarching aesthetic context
