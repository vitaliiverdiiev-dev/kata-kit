# Module contracts, capabilities and responsibilities

Use when a change creates/refactors a Nest module or capability, places a file, introduces a cross-module or cross-capability dependency, or turns an implementation into a potentially portable system. These are *decision rules*, not a requirement to scaffold a directory tree. Paths, aliases, file suffixes enforced by tooling, and ORM/vendor conventions are project decisions recorded in project docs.

## Decide ownership first

1. Name the **business capability** or technical facility being changed.
2. Choose exactly one module responsible for its invariants and writes.
3. Inside that module, choose the capability (or the module root for a single-capability module) and the responsibility the code plays.
4. Identify any data/APIs it consumes from other modules or capabilities. Use their existing public API (`index.ts` / exported providers) or capability `application/`, or ask for a deliberate new public operation.
5. Select the *smallest implementation* that keeps actual responsibilities separate. Only add a directory for real code.
6. Check for cycles, private imports, shared-state duplication, or feature-specific dependencies in a portable implementation.

Ownership examples:

- Auth owns identities, credentials, sessions, invitation/registration lifecycle when delegated to the selected auth library.
- Users may own a distinct profile and account-facing operations, **but must not duplicate** auth-library-owned identity rows merely to have its own table.
- Preferences owns general user preferences (theme, locale) only if the product genuinely has that capability. Product-domain settings belong to their domain module, e.g. in a learning app, Learning owns learning level, daily goal and progress; do not add these fields to a portable users/preferences module.

## Capabilities

A capability is a cohesive functional area: a set of operations around one business concept that the team names consistently (invitations, sessions, decks, reviews). Use these questions, not line counts:

- Does it have its own operations and usually its own entry points (routes, commands, hooks) or data?
- Does it change for reasons independent of the module's other areas?
- Would a newcomer look for it by that name?

If the module has one such area, it is a **single-capability module**: responsibility directories sit at the module root. If it has several, each gets a kebab-case directory named after the business concept, never a reserved responsibility name. Adding a second capability to a single-capability module is a deliberate restructuring step: move the existing responsibilities into a named capability in the same change.

A capability never gets its own Nest module, `index.ts` or barrel. Its providers are registered in `<module>.module.ts`, the module's composition root.

## Responsibility contracts

| Responsibility | Owns | Must avoid |
| --- | --- | --- |
| `http/` | Nest controllers, request/response DTOs, guards, pipes, transport-level response mapping | SQL, runtime calls into vendor SDKs or integration internals, meaningful business decisions |
| `application/` | Use cases, workflows, orchestration, permission checks at the proper boundary, transaction boundaries | HTTP specifics, SQL/query-builder code, vendor SDK details, supporting type/constant/helper collections |
| `model/` | Business contracts, validation schemas, constants, policies and pure logic, business mappers | Nest, HTTP, ORM/query builder, vendor SDK imports; I/O of any kind |
| `persistence/` | Database schema/table definitions, queries and data-access providers, row↔model mapping | HTTP contracts, business workflows, vendor SDK calls |
| `integrations/` | External SDKs, auth/library plugins, adapters, vendor callbacks and vendor-specific config/types | Product policy, raw SQL for module data, duplicated framework behavior |
| `cli/` | Module-wide command routing/dispatching, commands, handlers, terminal prompts/output; lives at the module root even in multi-capability modules | Duplicated use-case logic, direct persistence access |
| `tests/` | Unit tests that don't sit adjacent; `tests/integrations/` for the boundary of that directory | Shared harnesses for the whole app (project-level `test/`) |

Shared runtime facilities (database pool, external client used by many modules, environment parsing) belong to `infrastructure/`, not `modules/<module>/integrations/`. Keep module-specific wiring and library hooks with the module.

There is no compulsory `service.ts`, action class, repository interface, domain entity, mediator, or DTO-to-model-to-row mapping for every operation. A Nest repository/data-access provider is acceptable when DI is useful; an interface for it is not required.

## Model

`model/` is module-wide and contains only category subdirectories; no file sits directly in `model/`.

| Category | Contents | File naming |
| --- | --- | --- |
| `types/` | Business contracts: entities, value types, operation inputs/results, error unions | `<concept>.types.ts` |
| `schemas/` | Runtime validation of business contracts using the project's validation library | `<concept>.schema.ts` (see naming collisions) |
| `constants/` | Allowed values, limits, durations, defaults | `<concept>.constants.ts` |
| `helpers/` | Pure business logic: policies, invariant checks, calculations, normalizers | `<concept>.policy.ts`, `<purpose>.ts` |
| `mappers/` | Pure conversion between business contracts, only when genuinely required | `<concept>.mapper.ts` |

- Name files by concept, not capability folder: `invitation.types.ts`, not `invitations/types.ts`. Categories stay flat; one coherent file per concept is preferred over one file per function.
- A framework-neutral validation library already used by the project is allowed in `model/`; Nest decorators, ORM table objects and vendor types are not.
- Distinguish contracts by boundary: HTTP DTOs live in `http/` and may be derived from or validated by a model schema; database schemas and inferred row types live in `persistence/`; vendor types live in `integrations/` and are mapped at that boundary. Reuse one shape where the boundaries genuinely coincide rather than copying it.
- Backend `model/` groups helpers and mappers as categories; this intentionally differs from frontend slices, where `helpers/` is a sibling segment.
- Persistence-specific mapping (row ↔ business contract) belongs in `persistence/`; transport mapping belongs in `http/`. `model/mappers/` is only for conversions that are business logic.

## Other responsibilities: files and naming

Responsibility directories are flat except `tests/`, the role directories of `http/`, and one `integrations/<vendor>/` folder per external system (with its own role directories when needed). No other subdirectories (`application/types/`, `persistence/queries/`) unless the project documents the exception.

- `http/`: role directories created only when used — `controllers/<capability>.controller.ts`, `dto/<action>-<concept>.dto.ts`, `guards/<name>.guard.ts`, `pipes/<name>.pipe.ts`; other Nest roles (`decorators/`, `filters/`, `interceptors/`) follow the same pattern.
- `application/`: one file per use case named `<verb>-<concept>.ts` (`accept-invitation.ts`); `<name>.workflow.ts` for multi-step orchestration; `<capability>.service.ts` only when a single Nest provider grouping a few small operations reads better than separate files. Supporting types, schemas, constants and pure helpers go to `model/`.
- `persistence/`: `<concept>.table.ts` for database schema/table definitions, `<concept>.queries.ts` for queries, `<concept>.mapper.ts` for row mapping, `<concept>.repository.ts` only for an injectable data-access provider. Application calls these; it never builds SQL.
- `integrations/<vendor>/`: `<vendor>` names the external system or library, not the product. A small integration may hold flat files (`<vendor>.config.ts`, `<vendor>.adapter.ts`, `<vendor>.types.ts`); once a role has several files, use predictable role directories — `config/`, `plugins/`, `hooks/`, `adapters/`, `types/` — created only when used.
- **Integration ownership:** an integration serving several capabilities lives once at module level, with its configuration, plugins, callbacks and vendor types together under `integrations/<vendor>/`; do not scatter one provider's setup and plugins across capabilities. A capability-level `integrations/<vendor>/` is only for an integration used by that capability alone.
- `cli/` (module root): `<module>.cli.ts` for routing/dispatch when there are several commands, `<name>.command.ts` per command, `<name>.handler.ts` when handling is substantial, `<name>.prompts.ts` for terminal interaction. Commands call capability `application/`.

### Naming collisions

- Never reuse one filename for unrelated responsibilities inside a module (two `invitation.ts`, or `model/schemas/x.schema.ts` and `persistence/x.schema.ts`). The suffix states the responsibility.
- Validation schemas and database schemas must have distinct suffixes, and the ORM's schema discovery must not match validation files. Defaults: `*.schema.ts` for validation, `*.table.ts` for database definitions. A project whose tooling already uses `*.schema.ts` for database schemas may keep it and use another validation suffix (e.g. `*.validation.ts`); record the choice in project docs and apply it everywhere.
- Main implementation should be obvious from the filename. Do not split every small function into its own file; split when a file mixes responsibilities, not when it reaches a length.

## Dependency directions

Default allowed imports (anything not listed is disallowed unless documented):

| From | May import |
| --- | --- |
| `http/` | own capability `application/`, module `model/`, transport-specific decorators/guards from Nest or a vendor's transport package, **type-only** imports of vendor/integration contracts |
| `cli/` (module root) | any capability's `application/`, module `model/` |
| `application/` | module `model/`, own capability `persistence/` and `integrations/`, module-level shared `persistence/`/`integrations/`, another capability's `application/`, other modules' public entrypoints |
| `persistence/` | module `model/`, shared DB infrastructure; another owner's **table definition** only for FK/relation declarations (see table ownership) |
| `integrations/` (outbound adapters) | module `model/`, shared infrastructure, vendor SDKs |
| `integrations/` (inbound callbacks/hooks, module- or capability-level) | additionally the capability `application/` they drive, like a transport, provided no import cycle results |
| `model/` | other `model/` files of the same module, framework-neutral libraries only |
| `tests/` | the code they verify and shared test harnesses |

- **Across capabilities:** only through the other capability's `application/`; never its `http/`, `persistence/` or `integrations/`. Keep capability dependencies acyclic; if two capabilities need each other, the shared part belongs in `model/`, a shared module-level directory, or an orchestrating use case in one of them.
- **Table ownership:** every table belongs to exactly one owner — a capability's `persistence/`, or module-level `persistence/` only for data owned by the module as a whole. Another capability's (or module's) table definition may import it **solely** to declare an FK or ORM relation. That narrow schema reference does not permit queries, writes or row-type reuse through it; data still flows through the owner's `application/` or public API. Do not move a table to module level just because others reference it.
- **Module-level shared directories** must not import capability internals, except entry points: module-level `cli/` and inbound callbacks in module-level `integrations/<vendor>/` may call capability `application/`. Module-level `persistence/` never imports capabilities.
- **HTTP and integrations:** business operations from `http/` go through `application/`. A type-only import (`import type`) of a vendor or integration contract, or a required transport decorator/guard, is allowed; it is not permission to call integration internals at runtime. Do not create an application file solely to re-export a type HTTP needs.
- **Vendor callbacks and cycles:** an inbound callback may import the `application/` it drives; application may import outbound adapters. Neither may close a loop: application never imports the callback, nor a vendor setup file that imports the callback. When the vendor setup needs the callback and application needs the configured vendor, connect them at a composition root instead of by import — `<module>.module.ts` (DI registration, a provider factory when DI is the natural fit) or the project's established setup function that receives callbacks as arguments. Plain imports remain the default whenever they are acyclic; no factory is required per integration. Composition roots are explicit: `app/app.module.ts` for the app, `<module>.module.ts` for each module.
- **Across modules:** consumer → owner's **public entrypoint** and exported providers only. Export the provider from the owner Nest module and import that module; don't re-register another module's provider locally. A narrowly exported model type is fine when it is part of the designed public contract.
- `app` → modules + infrastructure for composition only; `infrastructure` → framework/external technical facilities, **never** feature implementations (not even to aggregate schemas).
- Avoid cycles. Prefer moving orchestration into the owning module/capability or a separate real use-case module over habitual `forwardRef()`. Respect ESM specifiers and decorator metadata as configured.

## Worked examples (conceptual)

**Auth — multiple capabilities and external integrations.**

```text
modules/auth/
├── auth.module.ts
├── index.ts                       # exports session guard, current-user contract
├── model/
│   ├── types/       invitation.types.ts, session.types.ts
│   ├── schemas/     invitation.schema.ts
│   ├── constants/   invitation.constants.ts
│   └── helpers/     invitation.policy.ts
├── integrations/<auth-library>/   # one shared provider, kept together
│   ├── config/      <auth-library>.config.ts
│   ├── plugins/     <plugin-name>.plugin.ts
│   └── hooks/       invitation.hooks.ts      # inbound callback → invitations/application
├── cli/             auth.cli.ts, create-owner.command.ts   # module-wide CLI
├── invitations/
│   ├── http/        controllers/invitations.controller.ts, dto/create-invitation.dto.ts
│   ├── application/ create-invitation.ts, accept-invitation.ts
│   ├── persistence/ invitation.table.ts, invitation.queries.ts
│   └── tests/integrations/accept-invitation.spec.ts
├── sessions/
│   ├── http/        controllers/sessions.controller.ts, guards/session.guard.ts
│   └── application/ get-current-session.ts
├── bootstrap/
│   └── application/ create-owner.ts
└── tests/integrations/auth.spec.ts   # module-wide flow
```

Vendor types stay in `integrations/`; `model/types/session.types.ts` holds the product's session contract that other modules see through `index.ts`. Library-owned tables are not duplicated in `persistence/`. `cli/create-owner.command.ts` calls `bootstrap/application/create-owner.ts`. `hooks/invitation.hooks.ts` imports `invitations/application/`. If application code also imports the configured library, the config must not import the hook; it receives it at the composition root (`auth.module.ts` or the config's setup function), so no cycle forms. If no application code imports the config, a plain import from config to hook is fine. Session controllers may use the library's transport decorators and `import type` its session contract, but session lookups go through `sessions/application/`.

**Vocabulary — several functional capabilities.**

```text
modules/vocabulary/
├── vocabulary.module.ts
├── index.ts
├── model/
│   ├── types/     word.types.ts, deck.types.ts, review.types.ts
│   ├── schemas/   word.schema.ts
│   └── helpers/   review-schedule.ts          # pure spacing algorithm
├── words/   { http/, application/, persistence/ word.table.ts, word.queries.ts }
├── decks/   { http/, application/, persistence/ deck.table.ts, deck-word.table.ts }
└── reviews/ { http/, application/ submit-review.ts, persistence/ review.queries.ts }
```

`reviews/application/submit-review.ts` uses `model/helpers/review-schedule.ts` and calls `words/application/` to load words; it does not import `words/persistence/`. `words/` owns `word.table.ts`. `decks/persistence/deck-word.table.ts` imports it only to declare the FK/relation; decks never query or write words through it and use `words/application/` for word data.

**Preferences — single capability.**

```text
modules/preferences/
├── preferences.module.ts
├── index.ts                 # only if another module consumes preferences
├── http/          controllers/preferences.controller.ts, dto/update-preferences.dto.ts
├── application/   get-preferences.ts, update-preferences.ts
├── model/
│   ├── types/     preferences.types.ts
│   ├── schemas/   preferences.schema.ts
│   └── constants/ preferences.constants.ts
└── persistence/   preferences.table.ts, preferences.queries.ts
```

No capability directory, no `mappers/`, no `integrations/`: none has code.

Moving a file can still be justified as a module grows; growth compatibility is not a promise of zero refactors.

## Portable boundary (only for suitable functionality)

A module/system is a good candidate when it has stable responsibilities and likely reuse (auth, generic table/filter mechanism, reusable storage integration). A highly product-specific view or operation need not be made portable.

A portable boundary should:

1. Keep owned implementation, vendor setup, schemas and tests close to the module (subject to project migrations/test setup).
2. Depend on small, explicit integration requirements (DI providers, environment inputs, database interface, package versions), not on another app's business features.
3. Expose a concise public entrypoint. Consumers can configure/customize without editing domain-specific branches inside the implementation.
4. Separate generic mechanisms from domain-specific policies and views; do not put product-domain rules in Auth or a generic Table system.
5. State transfer steps and known limits. Portability means **copy + integrate**, not no-touch drag-and-drop.

No npm package, registry, install generator, special framework, or new monorepo is required. Extraction may become useful later, but is not a default requirement.

## Review checklist

- Can a new developer name the owner module and capability of each operation and business table?
- Does every directory under a module resolve to a reserved responsibility or a named capability, with only the Nest module and public entrypoint at the root? Any ad-hoc folder or duplicated `model` category?
- Is `model/` free of Nest, HTTP, ORM and vendor imports? Is SQL confined to `persistence/`?
- Are cross-capability imports limited to `application/`, and cross-module imports to public entrypoints?
- Are module exports small and stable, with internal providers hidden?
- Would a change in table layout, vendor SDK, or transport force unrelated modules or capabilities to edit?
- Are new folders justified by existing behavior rather than hypothetical extensions?
- Can a suitable reusable module be copied without stripping the product domain out of it?
