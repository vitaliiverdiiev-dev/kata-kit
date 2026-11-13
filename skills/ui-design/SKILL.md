---
name: ui-design
description: Design or review user-facing web/mobile UI with a mobile-first app-like experience, existing design systems, semantic tokens, accessibility, keyboard/touch interactions, restrained modern aesthetics, and visual verification; avoid generic cluttered AI-looking interfaces.
---
# UI Design - Human-Centered, Mobile-First, System-Led

Use for new UI, significant interface changes, or UI/UX review. This is a **design and interaction standard**, not a replacement for `frontend-architecture` (file ownership), `code-quality` (TS/ESLint) or `testing` (automated test strategy). Respect product requirements, existing design system, brand tokens and documented constraints before proposing a visual direction.

## Understand the user and task

Identify the screen's primary user goal, environment, expected frequency, important information and one clear primary action. Design *the task flow* first. Prefer subtraction and progressive disclosure over more cards, controls, labels or decorative containers. Don't redesign unrelated screens or introduce a new visual language by default.

## Mobile-first means a mobile experience

- Define mobile layout and interaction first, then adapt intentionally to tablet/desktop. Don't simply shrink a desktop dashboard.
- Prefer comfortable touch targets (44×44 CSS px where feasible), safe-area respect, predictable scrolling, reachable controls and spacing that supports actual fingers; compact secondary actions need accessible hit areas.
- Match interaction to context: sheets, dialogs, tabs or dedicated pages only when they simplify the task. Avoid unnecessary sticky bars, nested scrolling and navigation that competes with the primary task.
- Consider software keyboard appearance, form auto-complete, field types, return-key behavior, password managers and visible validation near the field.

## Design system and semantic tokens first

- Inspect the existing component library (e.g. shadcn/Base UI), tokens, typography and Storybook before writing custom markup. Compose available primitives and create a reusable composite only when reuse is real.
- Colors, backgrounds, states, typography scale, spacing, radius, shadow and animation decisions should come from **semantic design tokens** and established utility classes, not hardcoded one-off values. Prefer system-level changes when a deliberate theme shift is required.
- Keep brand identity project-specific. KataKit should not make unrelated products share one visual palette.
- Follow the project's styling policy; in KataKit React projects, `frontend-architecture` owns style file placement.
- Support light/dark themes and high contrast where the product does, without deriving raw text colors from a single decorative hue.

## Visually intentional, not generically generated

- Use clear information hierarchy, readable typography, consistent alignment, balanced whitespace and proportionate density.
- Avoid defaulting to excessive cards, equal-weight controls, gradients, glowing elements, giant rounded corners, unnecessary badges, generic illustrations or dashboard-like chrome. Decorative effects must serve the product.
- Keep a human tone, understandable labels and consistent iconography. Use labels rather than icons alone when meaning is uncertain. Make disabled, pending and destructive actions explicit.
- Animation communicates state/continuity, not spectacle: subtle duration, no blocking animation, no motion when reduced-motion is requested; avoid layout shifts and expensive effects.

## Accessibility and interaction quality

- Target WCAG 2.2 AA where applicable: semantic elements, accessible names, landmarks, screen reader feedback, logical focus order, visible focus, keyboard-only operation, contrast, status announcements, error identification and understandable recovery.
- Avoid mouse-hover-only functionality; don't trap focus accidentally or hide focus outlines. Prefer accessible primitives over hand-rolled dialog/menu behavior.
- Design all relevant states, not only the happy screenshot: loading/skeleton, empty, offline/error, retry, success, validation, disabled/pending, slow network and small screen overflow.
- Keep performance and responsiveness as part of the UX: avoid gratuitous assets, heavy animations, waterfalls and unnecessary client state.

## Review and verification

1. Inspect current screens and design tokens. List concrete UX problems, then make the smallest cohesive improvement.
2. Review phone, tablet and desktop layouts, **actual keyboard and touch interactions**, overflow/scroll and focus. If browsers/screenshots aren't available, clearly say what remains unverified.
3. Validate normal and error states; test forms with keyboard, zoom and assistive technology where feasible. Automated accessibility tooling is useful but never a complete accessibility audit.
4. Use [references/review-checklist.md](references/review-checklist.md) for a full UI audit or high-impact feature (e.g. authentication); don't load it for a small copy-only adjustment.
5. Coordinate behavior tests with `testing`, architecture with `frontend-architecture`, and final verification with `quality-gate` when the task reaches a checkpoint.

Never claim a screenshot/browser check you didn't perform. Don't generate decorative redesigns or add dependencies without a concrete user need.
