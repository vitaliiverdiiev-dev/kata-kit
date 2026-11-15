# NestJS module contracts and responsibility boundaries

Use when a change creates/refactors a Nest module, introduces a cross-module dependency, or turns an implementation into a potentially portable system. These are *decision rules*, not a requirement to scaffold a directory tree.

## Decide ownership first

1. Name the **business capability** or technical facility being changed.
2. Choose exactly one module responsible for its invariants and writes.
3. Identify any data/APIs it consumes from other modules. Choose their existing public APIs or ask for a deliberate new public capability.
4. Select the *smallest implementation* that keeps actual responsibilities separate. Only add a segment for real code.
5. Check whether the change introduces a cycle, private import, shared-state duplication, or feature-specific dependency in a portable implementation.

Examples:

- Auth owns identities, credentials, sessions, invitation/registration lifecycle when delegated to the selected auth library.
- Users may own a distinct profile and account-facing capabilities, **but must not duplicate** Better Auth-owned identity rows merely to have its own table.
- Preferences owns general user preferences (theme, locale) only if the product genuinely has that capability. Product-domain settings belong to their domain module, e.g. in a learning app, Learning owns JLPT level, daily goal and progress; do not add these fields to a portable users/preferences module.

## Optional internal areas

| Area | Owns | Must avoid |
| --- | --- | --- |
| `http/` | Nest controllers, transport DTOs/validation, response mapping | SQL and meaningful business decisions |
| `application/` | Use-case coordination, permissions/policies at the proper boundary, transaction orchestration | HTTP specifics, ad-hoc external API clients and raw SQL scattered among operations |
| `domain/` | Pure invariants, policies, domain models when complexity warrants | Nest/Drizzle/vendor imports, transport types |
| `persistence/` | Drizzle tables, data access, repository implementations only when useful | HTTP response contracts, unrelated business workflows |
| `integrations/` | Module-owned library/vendor adapters, hooks and vendor-specific config | Unrelated feature policy, duplicate framework implementations |
| `cli/` | CLI parsing and presentation, calls into application behavior | Duplicated use-case logic |

Shared runtime facilities (database pool, external service client used by many modules, environment parsing) belong to `infrastructure/`, not `modules/<feature>/integrations/`. Keep feature-specific wiring and library hooks with the feature.

There is no compulsory `service.ts`, action class, repository interface, domain entity, mediator, or DTO-to-domain-to-row mapping for every operation. Transport data, application inputs and persistence records remain distinct **where their trust boundary or behavior differs**; avoid mechanical copies of identical types.

## Growth examples (conceptual)

```text
modules/diagnostics/
├── diagnostics.module.ts
└── diagnostics.controller.ts

modules/vocabulary/
├── vocabulary.module.ts
├── http/
│   └── vocabulary.controller.ts
├── application/
│   ├── create-word.ts
│   └── list-words.ts
└── persistence/
    └── vocabulary.schema.ts
```

If real business complexity develops, add `domain/`, targeted persistence helpers or integration adapters *without requiring a whole-app reorganization*. Moving a file can still be justified; growth compatibility is not a promise of zero refactors.

## Dependency directions

- `app` -> modules + infrastructure: composition only.
- `infrastructure` -> framework/external technical facilities; **never imports feature implementations** merely to aggregate schemas.
- Within a module: transport/CLI -> application; application -> domain and purpose-built persistence/integration providers; persistence/integrations may use the shared DB/client infrastructure. `domain` has no technical imports.
- Across modules: consumer -> **explicit public provider/contract** of owner. Export the provider from the owner Nest module and import that module; don't re-register another module's provider locally.
- Avoid direct imports of another module's `http/`, `persistence/`, `domain/` or implementation helpers. A narrowly exported value type is okay when it is part of a designed public contract.
- Avoid cycles. Prefer moving orchestration into the owning feature or a separate real use-case module over habitual `forwardRef()`.
- A public `index.ts` may help source consumers but is **optional**. Never use a module's own barrel for its internal Nest provider imports. Respect ESM specifiers and decorator metadata as configured.

## Portable boundary (only for suitable functionality)

A feature/system is a good candidate when it has stable responsibilities and likely reuse (auth, generic table/filter/modal mechanism, reusable storage integration). A highly product-specific view or operation need not be made portable.

A portable boundary should:

1. Keep owned implementation, vendor setup, schemas and tests close to the feature (subject to project migrations/test setup).
2. Depend on small, explicit integration requirements (DI providers, environment inputs, database interface, package versions), not on another app's business features.
3. Expose a concise public entrypoint. Consumers can configure/customize without editing domain-specific branches inside the implementation.
4. Separate generic mechanisms from domain-specific policies and views; do not put product-domain rules in Auth or a generic Table system.
5. State transfer steps and known limits. Portability means **copy + integrate**, not no-touch drag-and-drop.

No npm package, registry, install generator, special framework, or new monorepo is required. Extraction may become useful later, but is not a default requirement.

## Review checklist

- Can a new developer name the owner of each operation and business table?
- Are module exports small and stable, with internal providers hidden?
- Would a change in table layout, vendor SDK, or transport force unrelated modules to edit?
- Are new folders justified by existing behavior rather than future hypothetical extensions?
- Can a suitable reusable module be copied without stripping the product domain out of it?
