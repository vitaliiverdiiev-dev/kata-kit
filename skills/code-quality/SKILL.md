---
name: code-quality
description: Apply reusable TypeScript code quality, minimal-diff engineering, self-explanatory naming, comment discipline, and safe ESLint sorting/boundary conventions when implementing or reviewing TypeScript, React, or NestJS code.
---
# Code Quality - TypeScript, Clarity, and Minimal Change

Use for substantial TypeScript implementation/refactoring/review. Read the repository's `CLAUDE.md`, TypeScript/ESLint/Prettier configuration, and documented exceptions first. **The project configuration is the enforceable contract; this skill is the generic default.** Apply the frontend/backend architecture skills only when their respective architecture is relevant.

## Make the smallest *complete* change

1. Establish the requested behavior and inspect the affected flow: implementation, callers, public contracts, tests, configuration, and migrations as applicable.
2. Reuse existing code and platform/library capabilities before adding abstractions, dependencies or duplicate implementations.
3. Prefer clear, explicit code over speculative extensibility, clever types, and accidental complexity. Delete dead code introduced by the change.
4. Keep the diff focused. Do **not** optimize for fewer lines at the cost of correctness, accessibility, security, validation, maintainability, or useful tests. A proven security/auth library is preferable to a smaller home-grown replacement.
5. When a requirement affects adjacent behavior, update the necessary callers/contracts/tests rather than leaving a superficially minimal but incomplete implementation.
6. When reviewing, prioritize behavior, security, contracts, error paths, tests, and performance before cosmetic concerns. Review relevant code around the diff, not only modified lines.

## TypeScript - one source of truth

- Use strict typing and preserve the project's strict compiler flags. No `any`, `React.FC`, non-null assertions, assertions used to silence errors, double-casts through `unknown`, or broad ESLint disable comments as shortcuts.
- Prefer precise inferred local types; annotate public boundaries where it improves a contract. Treat network, storage, environment, third-party, and parsed input as **untrusted runtime data**, validate at boundaries, then narrow.
- Choose discriminated unions for exclusive states, literal unions over needless enums, tuples only for meaningful fixed positions, and generics only for genuine type relationships. Use `satisfies`, utility types and `as const` when they improve accuracy without obscure complexity.
- Infer types from Zod or another established runtime schema when appropriate; avoid maintaining an independent duplicate definition. Handle `unknown` errors through safe narrowing; model success/failure/error conditions explicitly.
- Prefer named exports and type-only imports/exports. Follow actual framework/compiler conventions for ESM, decorators and type metadata.
- The canonical detailed TypeScript guidance is in [references/typescript.md](references/typescript.md). Read it for type-heavy changes, API validation, generic design, or when selecting between TS language features; don't load it for trivial edits.

## Code should explain itself

- Strong names, small cohesive functions, explicit data flow, and well-chosen types are the first choice. Avoid comments describing obvious code, file purpose, JSX layout, or what the next statement does.
- Comments are allowed only for non-obvious **why**: external protocol/integration constraints, security-sensitive invariants, unusual tradeoffs, or public API documentation a consumer actually needs. Remove comments when code makes them obsolete. Preserve essential security/legal/license comments.
- Recognized actionable markers: `TODO`, `FIXME`, `WORKAROUND`. Add an issue reference when one exists, and describe the **remaining action/reason**, not a vague reminder. Do not defer required behavior or a security fix behind a TODO. Avoid `HACK`, `NOTE`, `IMPORTANT` comment proliferation.
- Prefer deletion of commentary like `/** Composition root ... */`, `// Set 44px touch size`, or `// Call the API` when naming/structure already conveys the meaning.

## ESLint sorting and architectural enforcement

Follow the repository's *tested* rules, not an invented assumption about what a plugin enforces:

- Imports: React packages → third-party → internal absolute (`@/`) → local relative, A–Z within groups, **no blank lines between groups**; preserve meaningful side-effect order. Internal external-slice imports use public `index.ts`. Avoid more than two `../` traversals where the project standard applies.
- Explicit named re-exports sorted A–Z (value before type if configured); no `export *` at public slice boundaries. Sort eligible named specifiers.
- Sort safe top-level type/interface/function declarations, safe helper functions, object and type/interface keys A–Z with exact `id` first, and JSX props A–Z. **Do not** reorder arbitrary initialized `const`, React hooks, code with side effects, computed keys, spread precedence, or order-sensitive objects just to satisfy alphabetical order.
- Name meaningful thresholds, timeouts, repeated semantically identical values; avoid magic numbers in domain logic. Do not create constants for obvious `-1`, `0`, or `1` without a reason. The rule cannot invent good names.
- Prefer the existing tested `eslint-plugin-perfectionist`, `eslint-plugin-boundaries` and scoped lint rules when available. Verify both allowed/forbidden imports, aliases and relatives, strict main component shape, and sorter `--fix` behavior with fixtures. Lint alone cannot verify semantic responsibility.
- Prettier formats; ESLint sorts and enforces architecture. An `@/` alias must not bypass a restriction enforced for the equivalent relative path.
- `lint` is nonmutating; `lint:fix` is intentional. Never run broad autofix on unrelated files or override project-specific exceptions without checking semantics.

## Ownership and handoff

- **Architecture**: frontend-architecture / backend-architecture. **Tests and TDD**: testing. **Pre-commit evidence**: quality-gate. **UI/UX**: ui-design. Do not duplicate their full procedures here.
- Preserve existing behavior unless the task explicitly changes it. Report meaningful tradeoffs, actual commands executed, tests that ran, and blockers; never claim green checks based only on configuration.
- Never commit, push or deploy without explicit authorization.
