---
name: frontend-architecture
description: Apply the reusable KataKit Architecture standard when designing, implementing, reviewing, or refactoring React and TypeScript frontend application code; includes layer ownership, slices, state, API, component boundaries, imports, UI primitives, and test placement.
---

# Frontend Architecture — React + TypeScript

Use for substantive React/TypeScript changes. Read the target repository's `CLAUDE.md`, architecture docs and ESLint config before editing. Project-specific exceptions are valid only when documented; **do not silently replace a project's existing architecture**. This skill is a generic default, not a Shiori-only rule or a substitute for automated lint.

## Structure and ownership

Recommended `src/` layers: `app/`, `pages/`, `domain/`, `shared/`, optional `test/`, and `main.tsx`. No default root `features/`, `widgets/`, `entities/`.

- `app/`: bootstrap, providers, routing, global styles, composition. May import pages/domain/shared.
- `pages/<page>/`: page slice, composition and page-specific logic. May import domain/shared.
- `domain/<domain>/`: product functional slice, with or without a UI component. May import shared.
- `shared/`: product/domain-agnostic utilities and UI. Must not import app/pages/domain.
- No cross-slice deep imports: consumers enter an independent page/domain slice only through its public `index.ts`. Within a slice, import its internal files directly. Same-layer cross-slice dependencies, if genuinely necessary, must use the other slice's public entrypoint and remain acyclic.
- Only **public independent units** get `index.ts` (typically `pages/<page>`, `domain/<domain>`, `shared/ui`). Do not add `index.ts` to `api/model/helpers/store/hooks/ui/tests` within a slice. Export only consumers' needs, with explicit named/type re-exports; no `export *`.
- `@/` alias for external app/slice imports; relative paths for same-slice internals. Max two parent traversals (`../../`). Do not evade boundaries by changing import syntax.

## Optional slice segments — add only when needed

```text
<slice>/
├── index.ts
├── <main-component>.tsx         # only if the slice renders a main component
├── <main-component>.test.tsx
├── api/                         # requests.ts, queries.ts, mutations.ts, tests/
├── model/                       # consts.ts, types.ts, schema.ts, config.ts, tests/
├── helpers/                     # helpers.ts, validation.ts, mappers.ts, reducer.ts, tests/
├── store/                       # Zustand store and store-specific operations/tests
├── hooks/                       # React coordination hooks and tests/
└── ui/                          # internal subcomponents and tests/
```

**WHAT / HOW convention**:

- `model/` = **WHAT**: types, request/response schemas (e.g. Zod), allowed values, constants, declarative configs. Model does not own UI classes or import API/helpers/hooks/store/ui; no React logic in model.
- `helpers/` = **HOW**: operations and pure computations: validation of answers, mappers (including API shape conversion), formatters, normalizers, reducers, general selectors, pure events, factories. Small coherent helpers may share one file; avoid one-file-per-function habits and redundant `.safeParse()` wrappers. Mapper location is `helpers/`, not sometimes `api/`.
- `api/` = server communication: `requests.ts` for actual transport, `queries.ts` for TanStack Query, `mutations.ts` for writes. Do not force TanStack Query on a simple fetch. Don't mirror server cache into Zustand unnecessarily.
- `store/` = client state (Zustand only when shared state genuinely needed); simple state/actions in the store file, optional store-specific selectors/reducer/actions. Reducers and separate selectors are not required by Zustand. Distinguish store-specific state helpers from general `helpers/` transformations; avoid cycles.
- `hooks/` = React state/effects and orchestration (including submit handlers using hooks/queries/mutations). Trivial handlers can stay inside a component; pure event transformations go in helpers. No pass-through hooks created solely to mirror queries.
- `ui/` = subcomponents owned by a slice. UI-specific class mappings belong here, never in `model/`. No slice-local CSS files/CSS modules; reusable CSS rules/tokens belong in `app/styles`, Tailwind in JSX, deliberate inline styles when appropriate.

## Strict main component contract

For the **main page/domain component file** and app root component when applicable, the **only module-level declarations** are: imports; an optional `type Props`; exactly one **named `export const Component = (...) => ...`**. No additional top-level functions, hooks, types, constants, callbacks, components, side-effect initialization or default export. Calling hooks/functions and keeping small local callbacks **inside** the main component is allowed. Extract substantial logic into its owning segment. Check lint coverage with negative fixtures rather than trusting prose. Generated shadcn primitive component files are an explicit exception to this strict top-level shape.

## Shared UI and styling

- `shared/ui/primitives/<name>/<name>.tsx` for real shadcn/Base UI primitives; `<name>.stories.tsx` and `<name>.test.tsx` adjacent where used. `shared/ui/composites/` for genuinely reusable domain-agnostic assemblies. `shared/ui/index.ts` is the public UI entrypoint.
- `shared/helpers/cn.ts` owns `cn`; other shared helpers only when truly domain-neutral. Never promote one-off domain functions prematurely.
- Keep shadcn `components.json` aliases consistent (`ui` to shared primitives; `utils` to `cn`), and after the CLI generates a component **move it into its own named folder**, fixing imports/stories. The CLI alone does not create the per-component folder.
- Preserve accessibility, semantic tokens, mobile touch targets, Storybook and current theme. No ad-hoc local stylesheet proliferation.

## Test placement (deterministic)

- Main page/domain component test always adjacent at slice root, regardless of directory name.
- File named like its immediate parent folder (`button/button.tsx`) has its test adjacent.
- Other test files go into **`tests/` in that file's immediate parent folder** (`api/tests/requests.test.ts`, `hooks/tests/use-status.test.ts`, `ui/tests/status-row.test.tsx`, `model/tests/schema.test.ts`). Never `__tests__/`, never internal `tests/index.ts`.
- `src/test/` is reserved for shared setup/utilities, not a second mirror of the app. Don't create empty test folders. Keep small tests targeted, including error/recovery scenarios.

## Enforcement and review

Respect existing ESLint architecture rules, TypeScript strictness, import/order conventions and component checks; request or implement missing automatic boundaries when tasked. Never mistake a skill for a lint engine. Avoid `any`, unsafe casts, non-null assertions, and `React.FC`; prefer named exports and precise public types.

Before completion: check wrong-layer imports, slice boundaries, circular imports, correct semantic ownership, component file contract, test location, lint/typecheck/tests/build and no unnecessary folder scaffolding. Explain any documented exception. Do not commit/push without explicit authorization.
