---
name: backend-architecture
description: Apply KataKit's NestJS/TypeScript modular-monolith architecture when designing, implementing, reviewing, or refactoring backend modules, persistence, auth, module contracts, tests, and portable features.
---
# Backend Architecture — NestJS Modular Monolith

Use for NestJS/TypeScript backend work. First inspect the target repository's `CLAUDE.md`, actual framework/runtime, existing module conventions, DB configuration, migrations, tests, and documented exceptions. This is a **default for compatible projects**, not a command to restructure established code. Do not apply NestJS conventions to Hono/FastAPI services.

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
- `modules/<feature>/` owns the feature's behavior, delivery adapters, persistence schemas, module-local integrations, and relevant tests.
- Root `infra/` (Compose/deployment/CI) is distinct from runtime `src/infrastructure/`.

## Module design and public contracts

- Assign each operation and persisted business fact one owning module. Keep modules cohesive and acyclic.
- Use `http/`, `application/`, `domain/`, `persistence/`, `integrations/`, and `cli/` as **responsibility names, not mandatory folders**; add only those justified by actual code. A tiny module may have just its Nest module and a controller/provider.
- Keep controllers/CLI thin; coordinate application operations outside transports; place pure business invariants in `domain` when a separate domain boundary earns its cost. Domain logic must not depend on Nest, the ORM/query builder, HTTP, or a vendor SDK.
- A feature's internals are private by default. Other modules import its Nest module and use explicitly exported providers/public contracts, not private controllers, helpers, or repositories. Use narrow public types and avoid re-exporting everything.
- When a module exposes providers, tokens or types to other modules, those public contracts must be importable through one explicitly designated public source entrypoint (`index.ts` or a dedicated public contract file); consumers import only from it. A module without external consumers needs no entrypoint. Inside the module, use direct file imports, never its own entrypoint, to avoid barrels and cycles.
- Prefer direct provider calls for synchronous cross-module operations. Resolve cycles by reconsidering ownership/orchestration before using `forwardRef()`.

Read [Module contracts](references/module-contracts.md) when creating modules, deciding layer placement, cross-module dependencies, ownership, or portable boundaries.

## Data ownership and cross-module reads

- A module owns writes and invariants for its data. A shared database and one database infrastructure are compatible with independent ownership.
- Keep schema/model definitions with their owner when the project's ORM and tooling support it, and let the project's schema configuration discover them. Keep **one reviewed migration history** for one database. Never rewrite applied migrations or automatically push/sync schemas on production startup.
- Cross-module FKs are allowed when necessary for integrity; they do **not** authorize cross-module business writes. Coordinate shared schema references explicitly.
- Read through public APIs by default. For multi-module views prefer batched read composition. Permit specialized **read-only** cross-module JOINs only when justified (e.g., filtering/sorting across all rows, aggregation, measured performance), isolated and DB-integration-tested. Never bypass authorization or business invariants through reporting queries.

Read [Data ownership and transactions](references/data-and-transactions.md) for schema composition, read exceptions, transaction boundaries, concurrency, Drizzle specifics, and Better Auth caveats.

## Transaction policy

- For one-module atomic work, use the project's native ORM/driver transaction facility.
- For genuinely atomic multi-module writes, one explicit coordinator owns **one shared transaction context**; participating persistence operations must use that context, not independent transactions. Choose and test a small concrete typed contract **when a real use case requires it**; do not scaffold `TransactionRunner`, Unit of Work, ALS/CLS, or outbox in advance.
- Do not assume third-party auth/database hooks participate in an application transaction. Verify actual adapter and lifecycle semantics for the installed versions.
- Protect concurrency invariants with DB constraints, atomic statements/locking where needed, and isolated database tests. Avoid external network calls inside DB transactions.

## Tests, security, and completion

- Unit-test placement for **new** tests: if the source filename's segment before its first dot equals the parent directory name, the test is adjacent (`auth/auth.service.ts` -> `auth/auth.service.spec.ts`); otherwise it goes in that directory's `tests/` (`auth/invitations.ts` -> `auth/tests/invitations.spec.ts`). Use the project's existing suffix and runner.
- Keep module-owned integration tests under `modules/<feature>/tests/integrations/` where the runner supports it, using the project's naming; application-spanning e2e and shared harnesses may live at project-level `test/` or `tests/`. Do **not** relocate existing tests solely to satisfy this convention; any deliberate move must update runner globs, scripts and CI and confirm discovery.
- `testing` owns test selection/TDD; `code-quality` owns general TypeScript and comment rules; `quality-gate` owns final verification. Do not duplicate their procedures here.
- For auth, respect the selected proven library; do not invent password/session crypto. Check the installed library/Nest/ORM versions against official docs before committing to an integration. Enforce permissions on the server, validate at trust boundaries, review cookie/CSRF/CORS/rate-limit policies, document the self-hosted bootstrap/registration policy, and never expose credentials, secrets or internal error stacks.
- Verify with actual project commands and report pass/fail/blocked. Authorized test suites may modify an explicitly configured, isolated nonproduction test database. Never modify production, staging, unknown or user-data databases, and never run destructive migrations, schema push or database resets outside that isolated test environment, without explicit authorization. Do not change CI, Git history, or ship without explicit authorization.

Read [Tests and portability](references/tests-and-portability.md) when placing tests, moving reusable modules, or assessing extraction into another compatible application.
