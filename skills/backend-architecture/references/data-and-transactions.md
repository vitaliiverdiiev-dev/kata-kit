# Data ownership, read composition and transaction contracts

Use for schema changes, inter-module data access, multi-step writes, concurrency invariants, and auth lifecycle integration. These are default decisions for a NestJS modular monolith on a relational database, independent of the ORM and auth library; notes marked **Drizzle** or **Better Auth** are examples that apply only to projects using them. Inspect the installed versions and existing app conventions first.

## Data ownership

- A functional module owns its business invariants, writes and the schema definitions of its data. Within a module, a table belongs to one capability's `persistence/`, or to module-level `persistence/` only when the module as a whole owns it; being referenced by other capabilities does not change its owner. Different modules may share one database and one connection/pool.
- Owning a capability is not the same as owning duplicate rows: e.g., a Users module can expose profile-facing operations while the auth library remains the source of truth for its identity fields.
- Foreign keys between owner tables are allowed where DB integrity warrants them. A foreign key does not grant permission for consumer business writes.
- Keep schema definitions with their owner when compatible with existing tooling. Discover them via the ORM's supported multi-file configuration (**Drizzle:** Drizzle Kit globs/paths) or **composition in an app-level root**, rather than making shared `infrastructure/` import feature internals. Discovery patterns must match database definitions in `persistence/` only, never `model/schemas/` validation files; the file suffix is a project decision (see module contracts, naming collisions). A narrow schema-to-schema import for a real FK or ORM relation is an intentional compile-time exception, across modules or capabilities, not a runtime permission to query or write the owner's data.
- Prefer one reviewed, ordered migration history for one application database, even when schema definitions are module-local. Treat a new starter project as a fresh migration baseline only when appropriate; never rewrite already-applied history in a running installation.
- Existing migrations, schema globs, ORM relation declarations, auth-library adapter schemas and runtime query requirements must be checked before any move. ORM-level relations (**Drizzle:** `relations()`) are not a substitute for actual DB FK constraints.

## Cross-module reads — decision order

1. **Public provider API:** use owner-provided read operations for ordinary business queries. Between capabilities of one module, the same rule applies through the owning capability's `application/`. Pass stable identifiers/results, not the other module's repository or DB handle.
2. **Batched composition:** for pages combining data from modules, obtain a primary page and batch-load supplementary information; avoid per-row N+1 calls. Do not merge paginated subsets if global filtering/sorting must happen first.
3. **Specialized read-only query:** allow a cross-module JOIN only for justified read models (e.g., pre-pagination cross-domain filters/order, aggregate analytics, demonstrable performance). Place it in the specific owner of the composite read scenario (e.g., an admin/report feature), not inside a portable base module. Record dependencies, enforce access control, and test against a real DB.

Read-model exception does not permit cross-module writes, reliance on private repository methods for domain decisions, or bypassing authorization. Do not introduce a CQRS library or global `queries` subsystem for a single query.

## Transactions — smallest correct mechanism

### One module

Use the existing ORM's native transaction API (**Drizzle:** `db.transaction(...)`) for a real multi-write atomic invariant. The use case in `application/` decides the boundary; each query lives in `persistence/` and accepts the transaction context as a parameter, so SQL never moves into orchestration code. Keep transaction lifetime short. Honor the selected driver and its TypeScript types.

### Multiple modules (only if **all** writes must be atomic)

- Identify a **single business coordinator** that owns the operation. If the scenario belongs clearly to a module, keep it in the owning capability's `application/`; create a new coordinator module only if there is a real separate functional ownership, never just for file organization.
- The coordinator opens exactly **one** database transaction. Every participating data-access operation must use that same transaction connection/context, with no independent `db.transaction()` or implicit pool query escaping it.
- Prefer a small **explicit** typed transaction-scoped contract required only for participating operations. Keep driver-level details behind persistence where practical, while acknowledging that a same-stack infrastructure contract may be needed at the module integration boundary.
- Choose the exact `TransactionScope`/runner API **only when the first cross-module atomic operation exists**; validate it with runnable rollback and concurrent-write integration tests. Do not prescribe a fictitious universal API in the skill and do not introduce ALS/CLS, a generalized Unit of Work, saga or outbox by default.
- Nested transactions/savepoints, isolation levels and automatic retries are deliberate per-use-case choices. A nested independent transaction is not a shared transaction. Retry only when the entire operation is safely repeatable and the driver error has been identified.

### Multi-module operations that do **not** need atomicity

Avoid coupling registration to unrelated product features unnecessarily. Prefer defaults/lazy initialization where valid. After-commit callbacks, email, and external API requests cannot be rolled back with the database transaction; document partial-failure behavior. Use durable events/outbox only if a proven business requirement needs reliable asynchronous processing.

### Security and concurrency

- Enforce unique/foreign key/check constraints and atomic conditional updates where appropriate; default transaction isolation does not eliminate lost updates or all races.
- Use row locks or stronger isolation only when necessary; test meaningful races (one-time invitations, reservations, uniqueness).
- Never assume auth-library hooks, adapters and application ORM transactions share one transaction (**Better Auth:** database hooks). Check the **installed** library version, adapter behavior, and lifecycle ordering (including whether `after` hooks run before or after commit) in its source/docs before designing atomic invitation/registration flows. Never treat hook writes as part of an application transaction without evidence and a rollback test.
- Never log credentials, session tokens, DB connection URLs or private errors when diagnosing transaction failures.

## Targeted architectural tests

- Unauthorized business writes fail through module public contracts.
- Module integration tests check FKs, unique constraints, rollbacks, races and real migration compatibility where relevant.
- If an operation claims multi-module atomicity, cause a failure in the **second** write and verify the **first** write was rolled back.
- Check concurrency using controlled isolated DB state (not production data). Ensure test isolation and cleanup.

## Official reference material

- NestJS modules: https://docs.nestjs.com/modules
- Drizzle (when used), schema organization: https://orm.drizzle.team/docs/sql-schema-declaration
- Drizzle (when used), Drizzle Kit schema config: https://orm.drizzle.team/docs/drizzle-config-file
- Drizzle (when used), transactions/savepoints: https://orm.drizzle.team/docs/transactions
- Better Auth (when used), database hooks: https://www.better-auth.com/docs/concepts/database
