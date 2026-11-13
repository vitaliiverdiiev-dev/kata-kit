# UI/UX review checklist - use when a screen or major flow changes

Evaluate the current product and the real target devices. This is a review guide, **not a requirement to create a checklist artifact for every button**.

## Product flow

- Can the user tell what this screen is for and what to do next within seconds?
- Is there one dominant action, with clearly subordinate alternatives?
- Are information and controls necessary *now*, or can they be deferred?
- Do labels describe outcomes rather than implementation concepts?
- Does the flow work for new, returning, slow-network and error scenarios?

## Mobile-native quality

- Is the phone layout deliberately designed, not a compressed desktop layout?
- Are hit areas comfortable, focus targets and input fields reachable, keyboard interactions usable?
- Are bottom fixed controls compatible with safe areas and software keyboard?
- Is scrolling natural (avoid nested scroll traps), with no horizontal overflow at 320–390px?
- Do touch menus, sheets and dialogs handle dismiss, focus return and back navigation?
- Is content still usable at text zoom and on tablet/desktop?

## System coherence

- Are semantic tokens used for surfaces, text, states, spacing and focus?
- Does each visual exception have a real reason? Check contrast in both light/dark modes.
- Are fonts, sizes, labels, icons, radii, gaps and alignment consistent?
- Are primitives/composites reused, and are there duplicated UI patterns that need consolidation?
- Do layout and hierarchy remain readable without decorative effects?

## Accessibility

- Semantic HTML; meaningful heading hierarchy and control names.
- All features usable with keyboard alone; clear focus indicator, predictable Tab order.
- Dialog focus management, Escape behavior, return focus and announcements.
- Error summary or inline error messages tied to fields, not color alone.
- Appropriate contrast; reduced motion; touch target sizing; no hover-only actions.
- Screen reader labels/status for loading, error, success and dynamic changes.
- Run relevant automated tooling if available; manually review things tools cannot infer.

## Forms and authentication-specific UX

- Email/password fields have correct autocomplete and input semantics; password manager works.
- Validation is helpful, does not erase entered data, and supports keyboard and screen reader feedback.
- Pending submissions prevent accidental duplicate requests but never silently lose progress.
- Errors are useful without revealing sensitive account information.
- Tab/Enter/Escape behavior, mobile keyboard, show-password control and session-expired path are considered if applicable.

## Visual verification

- Inspect at practical phone widths (e.g. 375px), tablet and desktop; add 320px stress check if supported.
- Compare normal, empty, loading, offline, error, success and long-content states as relevant.
- Inspect real rendered UI rather than relying on code or mockups alone; don't claim visuals were checked unless a browser/screenshot was actually available.
- Prefer a few concrete, user-impacting fixes over aesthetic churn.

Official references:
- https://www.w3.org/TR/WCAG22/
- https://web.dev/learn/accessibility/
- https://react.dev/learn
