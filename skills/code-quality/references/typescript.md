# TypeScript - practical strong typing

This is the **single reusable reference** for KataKit TypeScript decisions. It applies across React and NestJS; framework skills describe architecture, not duplicate TS policy. Check the target project's TypeScript version, compiler flags, library types, and runtime constraints before adopting a feature. Do not assume that a recently published syntax is supported in every project.

## Baseline

- Enable and respect `strict` and, where the project supports them, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Don't weaken flags to make code compile.
- **Never** use `any` or escape hatches (`as unknown as T`, blanket `@ts-ignore`, non-null assertion) to bypass a modeling error. A justified third-party interop exception requires a narrow validator/adapter and an explanation of the unavoidable constraint.
- Infer local types when obvious; add annotations for exported APIs, callbacks and return contracts when they clarify intent. Named exports preferred; `import type`/`export type` when applicable.
- Validate incoming data at runtime. `type ApiResponse = ...` does not prove fetched JSON satisfies that contract. Start with `unknown` and narrow through a parser or type guard.
- Use `readonly` selectively for values that consumers must not mutate; avoid copying object graphs merely to satisfy an aesthetic preference.

## Picking the right construct

| Need | Prefer | Avoid |
| --- | --- | --- |
| Mutually exclusive states | Discriminated union with literal discriminant | Several independent booleans that admit impossible combinations |
| Small fixed vocabulary | String literal union | Runtime `enum` without a need for its runtime identity |
| Fixed positional contract | Tuple (`readonly [number, number]`) | Tuple for ordinary objects with named fields |
| Preserve relation between inputs and outputs | Minimal generic type parameter | Generics that do not relate two types |
| Validate an object while preserving precise inference | `satisfies` | Broad type annotation erasing literal information |
| Derive from existing type | `Pick`, `Omit`, `Partial`, `Required`, `Readonly`, mapped types when needed | Manually synchronized duplicates |
| Runtime contracts | Zod or established project validator with inferred TS type | Blind casting of `unknown` |
| Errors from `catch` | `unknown` plus safe narrowing | Assuming every caught value is an `Error` |

## Examples

```ts
// Discriminated union: impossible states are excluded.
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

// `satisfies` checks the contract without widening the literal values.
const statusLabels = {
  error: 'Unavailable',
  ready: 'Connected',
} satisfies Record<'error' | 'ready', string>;

// Generic only because the argument and result have a relationship.
export const firstOrNull = <T>(items: readonly T[]): T | null =>
  items[0] ?? null;
```

For untrusted responses:

```ts
import { z } from 'zod';

export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

export type Session = z.infer<typeof sessionSchema>;

export const decodeSession = (input: unknown): Session =>
  sessionSchema.parse(input);
```

Don't add `decodeSession` if the schema is already parsed exactly once at the consuming boundary and the wrapper adds no behavior.

## Function and component contracts

- React props should describe actual accepted behavior. Use `type Props` in the *main component file* when the project's architecture mandates that shape; other types go to their owner.
- Don't use `React.FC`. Avoid passing a large `Partial<T>` object merely to evade explicit required fields.
- Don't create generic component factories or elaborate type utilities for a single call site.
- Keep async error states explicit; catch and narrow unknown errors; don't represent failures as ambiguous nulls without a documented contract.
- Use type guards with real checks; `return true` followed by a type predicate is not validation.

## API, persistence, and authentication boundaries

- Differentiate trusted internal data from external JSON, cookies, headers, environment variables, persistence records, and identity claims.
- Validate and normalize at the boundary; expose narrow typed contracts downstream. Do not trust client-provided roles, user IDs, or session markers for authorization.
- When a library already generates canonical types, reuse them rather than recreating their shape from memory.
- Avoid copying server cache data into parallel client stores without a concrete state-ownership reason.

## Review questions

- Can the compiler represent an invalid state that the application must reject?
- Are optional values handled safely without `!` or casts?
- Are generic parameters preserving relationships, or merely decorating code?
- Is a type duplicated independently of a Zod schema or generated library type?
- Does any type claim more than the runtime validation establishes?
- Can the type be simpler without losing a safety guarantee?

Official reference: https://www.typescriptlang.org/docs/
