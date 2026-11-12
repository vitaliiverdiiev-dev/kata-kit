---
name: code-quality
description: Apply KataKit's reusable strict TypeScript code quality and ESLint conventions when writing, reviewing, restructuring, or autofixing TypeScript/React/NestJS code, including module boundaries, import/export ordering, id-first object keys, JSX props, and magic numbers.
---

# Code Quality — TypeScript, ESLint and Safe Autofix

Use alongside the frontend or backend architecture skill where relevant. Read existing ESLint/Prettier/TypeScript config first and **prefer the repository's tested rules** over manually assuming an ESLint plugin enforces them. Avoid proliferating duplicate rules/configurations. Project-specific, documented exceptions are permitted.

## Type safety

Strict TypeScript with appropriate `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` when supported by project. Never use `any`, unsafe assertions, non-null assertions, or `React.FC` just to silence typing errors. Explicit named exports and `import type` / `export type` where applicable. Keep API validation and inferred types coherent; avoid duplicating Zod and TypeScript sources of truth.

## Imports and exports

For authored React/TS source, four groups **without blank lines between groups**: (1) React packages, (2) third-party packages, (3) internal absolute alias imports such as `@/`, (4) local relative imports. Alphabetic A–Z within groups and within named specifiers. Keep side-effect imports ordered for semantics. Relative traversal at most `../../` where project architecture allows; import another slice only via its public `index.ts`.

Export explicit named value re-exports A–Z, followed by explicit type re-exports A–Z where a safe compatible sorter supports it. No `export *` from public slice boundaries. Do not invent automatic classifications for 'component vs function vs constant' without verifiable tooling.

## Alphabetical declarations and keys

- Sort eligible top-level `type`, `interface`, `function` declarations and safe helper arrow-function blocks alphabetically if the configured fixer preserves dependencies. **Never auto-reorder arbitrary const initializers, hooks, reducers' statement order, or React component bodies**.
- `id` **exact key** first, remaining properties A–Z for safe object literals, interface/type-object properties. Handle side-effectful values, computed keys, integer-like names, spreads and order-dependent serializers/configs conservatively; use narrowly documented exceptions instead of changing runtime semantics.
- JSX props A–Z while preserving spread order and expression evaluation semantics; no special `id`-first rule for JSX props.
- Name meaningful timeouts, limits, thresholds and repeated values with the **same semantic meaning**. Prefer practical `@typescript-eslint/no-magic-numbers` allowances for `-1`, `0`, `1`, numeric literal types and fixtures. The lint rule cannot invent good constant names; fix manually with meaningful naming.
- Prefer `eslint-plugin-perfectionist` for verified sort fixes; `eslint-plugin-boundaries` / scoped `no-restricted-imports` or a narrowly tested local rule for boundaries. Compatibility with installed ESLint/Node/TypeScript versions must be checked, not assumed.

## Enforcement, not documentation theater

- Test both **forbidden and allowed** architecture imports (relative, alias, cross-slice, model-to-operation, backend infra-to-feature). An alias must not bypass a restriction enforced for a relative path.
- Verify strict main component contract with executable lint fixtures: imports, optional `type Props`, exactly one named `export const Component`. Exclude tests, stories, generated primitives and non-main TS modules deliberately.
- Verify `--fix` on shuffled imports/re-exports, id-last object/type/interface keys, and JSX props. Do not use `--fix` indiscriminately if it changes semantics.
- Keep `pnpm lint` nonmutating; expose/use `pnpm lint:fix` only where the repository already supports or explicitly requests it. Prettier handles formatting; ESLint handles sorting and architecture.
- Report checks actually executed and distinguish lint-enforced requirements from conventions described only in a skill. No hidden exceptions or blanket disable comments.
