---
name: code-quality
description: Apply reusable TypeScript code quality, minimal-diff engineering, self-explanatory naming, the canonical zero-by-default comment policy (TODO/FIXME/WORKAROUND/INVARIANT/COMPAT only), and safe ESLint sorting/boundary conventions when implementing, reviewing, or auditing comments in TypeScript, React, or NestJS code.
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

## Code should explain itself - canonical comment policy

This is KataKit's **only** comment policy. Projects may enforce it with their own lint tooling and document real exceptions, but must not redefine it. It applies to all maintained source and configuration that supports comments.

### Default: zero comments

Names, types, control flow, named functions/constants and tests explain the code. **Prohibited:** comments saying what a file/class/function does, restating a setting or the next statement, advertising a milestone, describing JSX layout/styling, or repeating a test assertion. Being technically true is not enough value. "Integration constraint" is not a blanket justification for commenting framework/library settings.

The only ordinary comment categories:

| Prefix | Narrow purpose | Minimum content |
| --- | --- | --- |
| `TODO` | Concrete, genuinely deferred work outside the current acceptance criteria | Remaining action; task reference when available |
| `FIXME` | Precisely identified defect that can't be fixed in the current authorized scope | Defect and required correction; risk/task reference when available |
| `WORKAROUND` | Temporary workaround for a real constraint | Why, affected dependency/system, removal condition |
| `INVARIANT` | Critical, *non-obvious* correctness/security/state constraint that code and names can't convey | The invariant and what breaks if violated; ideally backed by a test |
| `COMPAT` | Verified version-specific behavior of an external dependency, runtime, protocol or platform | Name@version or specific contract, the non-obvious behavior, why the code/config is necessary |

```ts
// TODO(SHI-123): Add recovery emails when SMTP setup is supported.
// FIXME(SHI-124): Prevent duplicate invitations under concurrent requests.
// WORKAROUND(package@1.2.3): Use X until upstream fixes Y; remove after upgrade.
// INVARIANT: Consume an invitation atomically with user creation to prevent reuse.
// COMPAT(better-auth@1.7.23): Test mode disables Origin verification by default.
```

These are illustrations of shape, not comments to add. A substantive explanation must follow the marker; prefixing narration with `INVARIANT:`/`COMPAT:` doesn't make it valid. No other categories (`NOTE`, `INFO`, `IMPORTANT`, `HACK`, `WHY`, milestone tags like `M02.1`, free-form JSDoc prose). One short line; extend only if essential. Never defer required behavior or a security fix behind a `TODO`.

### Decision process - before *each* new or retained comment

1. Could naming, types, structure, a named function/constant or a test make it clear? **Yes → no comment.**
2. Would removing it realistically make a maintainer miss an important fact not evident from the code or normal repo docs? **No → remove it.**
3. Does it fit one of the five categories with a factual, specific reason? **No → remove it**, or move it to product/architecture docs when it belongs there.
4. Is it as short and precise as possible? Drop redundant prose and stale version/milestone references.
5. For `COMPAT`/`WORKAROUND`/`INVARIANT`, find concrete evidence (source behavior, test, cited upstream restriction, security requirement). Never invent an integration quirk to justify a comment.

**Invalid:** `transaction: true` "enables transactions"; `session.expiresIn` "seven-day session"; `disableSignUp: true` "signup disabled until next milestone"; JSDoc paraphrasing the method name; explaining a touch target a design token already defines; a script header repeating its CLI name (`api:check`). **May pass:** a concise note on *unexpected upstream behavior that the code would otherwise tempt someone to remove*.

When applying the policy to existing code, judge each comment with this process; do not mass-delete. Preserve real security/compatibility knowledge, converting it to the correct category if needed.

### Technical exceptions (metadata, not an escape hatch)

- Legally required license/copyright notices; generated code (don't hand-edit); vendored dependencies.
- Tool-required pragmas/triple-slash references when objectively required; type-bearing JSDoc in `.js/.mjs/.cjs` where actually needed for TS checking. Not a licence for narrative JSDoc.
- ESLint/TS disable directives are not a shortcut. An unavoidable targeted directive needs explicit justification and project review. Don't add exemptions just because a linter finds a comment inconvenient.
- A published API contract that genuinely needs prose belongs in dedicated reference/API docs; don't turn every export into JSDoc. Prefer types and named parameters for local TypeScript APIs.

### Enforcement ownership

KataKit owns the semantic judgment. A project's own ESLint/tooling should reject unclassified ordinary JS/TS comments with narrow, tested exceptions; never ship a mass-delete fixer. KataKit does not inject an ESLint config or mandate a custom rule per language. Lint can check the marker format, **not whether a `COMPAT`/`INVARIANT` claim is true**; code review still judges necessity. `quality-gate` verifies compliance at the final checkpoint.

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
- For substantial TS/React/NestJS work, load `code-quality` and `testing` (plus the relevant architecture skill) **before** changing code, and `quality-gate` at the final checkpoint. For a comment-policy audit: `code-quality`, then `quality-gate`. Confirm a skill is actually loaded in this session; don't infer it from earlier conversation or project docs.
- Project `CLAUDE.md` holds project-specific context, commands, decisions and exceptions only; it does not restate these generic standards. If project config conflicts with them, surface the conflict for a deliberate decision rather than silently picking one.
- Preserve existing behavior unless the task explicitly changes it. Report meaningful tradeoffs, actual commands executed, tests that ran, and blockers; never claim green checks based only on configuration.
- Never commit, push or deploy without explicit authorization.
