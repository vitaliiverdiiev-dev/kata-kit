---
name: backend-architecture
description: Apply KataKit's NestJS/TypeScript modular-monolith architecture when designing, implementing, reviewing, or refactoring backend modules, persistence, auth, module contracts, tests, and portable features.
---
# Backend Architecture — NestJS Modular Monolith

Use for NestJS/TypeScript backend work. First inspect the target repository's `CLAUDE.md`, actual framework/runtime, existing module conventions, DB configuration, migrations, tests, and documented exceptions. This is a **default for compatible projects**, not a command to restructure established code. Do not apply NestJS conventions to Hono/FastAPI services. Rules here are ORM- and vendor-neutral; project paths, aliases, ORM conventions and library behavior belong in project documentation and tooling.

## Non-negotiable principles

- **Human-first:** a developer unfamiliar with KataKit should be able to identify ownership, dependencies, and the path of a request without learning a custom framework.
- **Feature ownership:** organize application behavior around cohesive functional modules, not technical-type folders spanning the entire project.
- **Small now, extensible later:** establish clear responsibilities but create only files and directories used by current behavior. Avoid mandatory repository interfaces, action classes, base services, event buses, or elaborate scaffolds.
- **Portable when valuable:** keep reusable systems and suitable feature modules locally cohesive; keep domain-specific behavior out of reusable implementations. Do not require npm packaging, installers, or a KataKit runtime dependency.
- **Nest-native:** prefer Nest modules, exported providers, DI, and established library APIs over custom frameworks.

## Top-level ownership

```text
src/
├── app/                # app.module.ts, app.config.ts; composition and app-wide setup
├── infrastructure/     # env validation, DB connections, shared external clients
├── modules/            # independently owned functional modules
└── main.ts             # validated startup and bootstrap only
```

- `app/` composes modules/providers and global Nest behavior; it may depend on feature modules. `app.config.ts` configures the Nest application, distinct from environment validation.
- `infrastructure/` owns shared technical facilities and **must not depend on product module internals**. Avoid an unnecessary connection pool per feature.
- `modules/<module>/` owns the module's behavior, delivery adapters, persistence schemas, module-local integrations, and relevant tests.
- Root `infra/` (Compose/deployment/CI) is distinct from runtime `src/infrastructure/`.

## Module organization: Module → Capability → Responsibility

- **Module** — functional ownership and public API boundary; one Nest module (`<module>.module.ts`) is its composition root.
- **Capability** — a cohesive functional area inside a module (e.g. invitations, sessions) with its own operations. A capability is a directory, **not** a Nest module; its providers are registered in the module's Nest module.
- **Responsibility** — the technical role of code: `http/`, `application/`, `model/`, `persistence/`, `integrations/`, `cli/`, `tests/`. These names are reserved; any other directory directly under a module is a capability.

```text
modules/<module>/                      modules/<module>/        # single capability
├── <module>.module.ts                 ├── <module>.module.ts
├── index.ts         # public API      ├── index.ts
├── model/           # module-wide     ├── http/
├── persistence/     # module-owned    ├── application/
├── integrations/    # shared only     ├── model/
├── cli/             # module CLI      ├── persistence/
├── <capability>/                      ├── cli/
│   ├── http/                          └── tests/
│   ├── application/
│   ├── persistence/
│   └── tests/
└── tests/
```

- Split a module into capabilities when it has several cohesive functional areas whose operations change independently; never split by technical type or line count alone. A single-capability module places responsibility directories at its root.
- In a multi-capability module, `http/` and `application/` live inside capabilities. The module root holds only `model/`, `cli/` (module-wide command routing and commands, calling capability `application/`), `tests/`, `persistence/` for data owned by the module as a whole rather than one capability, and `integrations/` for vendor setup shared by several capabilities.
- `model/` exists **once per module**, with category subdirectories `types/`, `schemas/`, `constants/`, `helpers/`, and `mappers/` only when genuinely required. Never duplicate these categories inside capabilities or `application/`; never add ad-hoc folders such as `application/types/`.
- Create a responsibility or category directory only when it has real code, but code always lives in its responsibility location: only `<module>.module.ts` and the public entrypoint sit at the module root. Even a lone controller goes to `http/controllers/` (`diagnostics/http/controllers/diagnostics.controller.ts`); no empty directories or extra abstractions are required.
- Do not create extra Nest modules purely for filesystem organization.

Read [Module contracts](references/module-contracts.md) when creating a module or capability, placing a file, or adding a cross-module/cross-capability dependency; it covers responsibility contracts, file naming, dependency directions, capability decisions, worked examples and portable boundaries.

## Public contracts and dependencies

- Assign each operation and persisted business fact one owning module. Keep modules and capabilities acyclic.
- A module's internals are private. Other modules import its Nest module and use explicitly exported providers/public contracts, never capability directories, controllers, helpers or persistence.
- When a module exposes providers, tokens or types to other modules, they are importable through one explicitly designated public entrypoint (`index.ts` or a dedicated public contract file); consumers import only from it. A module without external consumers needs no entrypoint. Inside the module, use direct file imports, never its own entrypoint or per-capability barrels.
- Default direction: `http`/`cli` → `application` → `model`, `persistence`, `integrations`; `persistence`/`integrations` → `model` + shared infrastructure; `model` → nothing technical. A capability uses another capability of the same module only through that capability's `application/`. Each table belongs to one owner; another table definition may reference it only for FK/relation declarations, never to query or write it.
- An inbound vendor callback may call the `application/` it drives, but imports must stay acyclic: application never imports that callback or a vendor setup that imports it. When the vendor setup needs the callback and application needs the vendor, wire them at the composition root (`<module>.module.ts` or the project's established setup point) instead of importing in a loop.
- `model/` must not depend on Nest, HTTP, the ORM/query builder or vendor SDKs. Keep business contracts (`model/types`) distinct from HTTP DTOs, database schemas and vendor types where their trust boundary or behavior differs; avoid mechanical copies of identical shapes.
- No repository interfaces or dependency inversion unless a real second implementation or test boundary requires it. Prefer direct provider calls for synchronous cross-module operations; resolve cycles by reconsidering ownership/orchestration before using `forwardRef()`.

## Data ownership and cross-module reads

- A module owns writes and invariants for its data. A shared database and one database infrastructure are compatible with independent ownership.
- Keep schema/model definitions with their owner when the project's ORM and tooling support it, and let the project's schema configuration discover them. Keep **one reviewed migration history** for one database. Never rewrite applied migrations or automatically push/sync schemas on production startup.
- Cross-module FKs are allowed when necessary for integrity; they do **not** authorize cross-module business writes. Coordinate shared schema references explicitly.
- Read through public APIs by default. For multi-module views prefer batched read composition. Permit specialized **read-only** cross-module JOINs only when justified (e.g., filtering/sorting across all rows, aggregation, measured performance), isolated and DB-integration-tested. Never bypass authorization or business invariants through reporting queries.

Read [Data ownership and transactions](references/data-and-transactions.md) when changing schemas, reading across modules or capabilities, or writing multi-step/atomic operations; it covers schema composition, read exceptions, transaction boundaries, concurrency, and ORM/auth-library caveats.

## Transaction policy

- For one-module atomic work, use the project's native ORM/driver transaction facility. `application/` decides the transaction boundary; queries stay in `persistence/` and accept the transaction context.
- For genuinely atomic multi-module writes, one explicit coordinator owns **one shared transaction context**; participating persistence operations must use that context, not independent transactions. Choose and test a small concrete typed contract **when a real use case requires it**; do not scaffold `TransactionRunner`, Unit of Work, ALS/CLS, or outbox in advance.
- Do not assume third-party auth/database hooks participate in an application transaction. Verify actual adapter and lifecycle semantics for the installed versions.
- Protect concurrency invariants with DB constraints, atomic statements/locking where needed, and isolated database tests. Avoid external network calls inside DB transactions.

## Tests, security, and completion

- Unit-test placement for **new** tests: if the source filename's segment before its first dot equals the parent directory name, the test is adjacent (`auth/auth.module.ts` -> `auth/auth.module.spec.ts`); otherwise it goes in that directory's `tests/` (`application/create-invitation.ts` -> `application/tests/create-invitation.spec.ts`). Use the project's existing suffix and runner.
- Integration tests belong to the boundary of the behavior they verify: `tests/integrations/` in the smallest directory containing that boundary — a persistence operation, a capability, or the whole module. Application-spanning e2e and shared harnesses may live at project-level `test/` or `tests/`. Do **not** relocate existing tests solely to satisfy this convention or add redundant tests per level; any deliberate move must update runner globs, scripts and CI and confirm discovery.
- `testing` owns test selection/TDD; `code-quality` owns general TypeScript and comment rules; `quality-gate` owns final verification. Do not duplicate their procedures here.
- For auth, respect the selected proven library; do not invent password/session crypto. Check the installed library/Nest/ORM versions against official docs before committing to an integration. Enforce permissions on the server, validate at trust boundaries, review cookie/CSRF/CORS/rate-limit policies, document the self-hosted bootstrap/registration policy, and never expose credentials, secrets or internal error stacks.
- Verify with actual project commands and report pass/fail/blocked. Authorized test suites may modify an explicitly configured, isolated nonproduction test database. Never modify production, staging, unknown or user-data databases, and never run destructive migrations, schema push or database resets outside that isolated test environment, without explicit authorization. Do not change CI, Git history, or ship without explicit authorization.

Read [Tests and portability](references/tests-and-portability.md) when placing tests, moving reusable modules, or assessing extraction into another compatible application.
