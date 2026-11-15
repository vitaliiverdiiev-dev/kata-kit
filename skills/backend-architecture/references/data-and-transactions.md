# Data ownership, read composition and transaction contracts

Use for Drizzle schema changes, inter-module data access, multi-step writes, concurrency invariants, and auth lifecycle integration. These are default decisions for a NestJS + PostgreSQL + Drizzle modular monolith; inspect the installed versions and existing app conventions first.

## Data ownership

- A functional module owns its business invariants, writes and the schema definitions of its data. Different modules may share one PostgreSQL database and one Drizzle connection/pool.
- Owning a capability is not the same as owning duplicate rows: e.g., a Users module can expose profile-facing operations while Better Auth remains the source of truth for its identity fields.
- Foreign keys between owner tables are allowed where DB integrity warrants them. A foreign key does not grant permission for consumer business writes.
- Keep `*.schema.ts` with its owner when compatible with existing tooling. Discover schemas via Drizzle Kit's supported multi-file globs/paths or **composition in an app-level root**, rather than making shared `infrastructure/` import feature internals. A narrow schema-to-schema import for a real FK is an intentional compile-time exception, not a runtime permission to read/write other module data.
- Prefer one reviewed, ordered migration history for one application database, even when schema definitions are module-local. Treat a new starter project as a fresh migration baseline only when appropriate; never rewrite already-applied history in a running installation.
- Existing migrations, schema globs, Drizzle relation declarations, Better Auth adapter schemas and runtime query requirements must be checked before any move. `relations()` is not a substitute for actual DB FK constraints.

## Cross-module reads — decision order

1. **Public provider API:** use owner-provided read operations for ordinary business queries. Pass stable identifiers/results, not the other module's repository or DB handle.
2. **Batched composition:** for pages combining data from modules, obtain a primary page and batch-load supplementary information; avoid per-row N+1 calls. Do not merge paginated subsets if global filtering/sorting must happen first.
3. **Specialized read-only query:** allow a cross-module JOIN only for justified read models (e.g., pre-pagination cross-domain filters/order, aggregate analytics, demonstrable performance). Place it in the specific owner of the composite read scenario (e.g., an admin/report feature), not inside a portable base module. Record dependencies, enforce access control, and test against a real DB.

Read-model exception does not permit cross-module writes, reliance on private repository methods for domain decisions, or bypassing authorization. Do not introduce a CQRS library or global `queries` subsystem for a single query.

## Transactions — smallest correct mechanism

### One module

Use the existing ORM's native `db.transaction(...)` for a real multi-write atomic invariant. Keep transaction lifetime short. Honor the selected driver and its TypeScript types.

### Multiple modules (only if **all** writes must be atomic)

- Identify a **single business coordinator** that owns the operation. If the scenario belongs clearly to a feature, keep it in that feature's `application/`; create a new feature coordinator module only if there is a real separate capability.
- The coordinator opens exactly **one** database transaction. Every participating data-access operation must use that same transaction connection/context, with no independent `db.transaction()` or implicit pool query escaping it.
- Prefer a small **explicit** typed transaction-scoped contract required only for participating operations. Keep driver-level details behind persistence where practical, while acknowledging that a same-stack infrastructure contract may be needed at the module integration boundary.
- Choose the exact `TransactionScope`/runner API **only when the first cross-module atomic operation exists**; validate it with runnable rollback and concurrent-write integration tests. Do not prescribe a fictitious universal API in the skill and do not introduce ALS/CLS, a generalized Unit of Work, saga or outbox by default.
- Nested transactions/savepoints, isolation levels and automatic retries are deliberate per-use-case choices. A nested independent transaction is not a shared transaction. Retry only when the entire operation is safely repeatable and the driver error has been identified.

### Multi-module operations that do **not** need atomicity

Avoid coupling registration to unrelated product features unnecessarily. Prefer defaults/lazy initialization where valid. After-commit callbacks, email, and external API requests cannot be rolled back with PostgreSQL; document partial-failure behavior. Use durable events/outbox only if a proven business requirement needs reliable asynchronous processing.

### Security and concurrency

- Enforce unique/foreign key/check constraints and atomic conditional updates where appropriate; default transaction isolation does not eliminate lost updates or all races.
- Use row locks or stronger isolation only when necessary; test meaningful races (one-time invitations, reservations, uniqueness).
- Never assume Better Auth hooks, adapters and application Drizzle transactions share one transaction. Check the **installed** Better Auth version, adapter behavior, and lifecycle ordering (including whether `after` hooks run before or after commit) in its source/docs before designing atomic invitation/registration flows. Never treat hook writes as part of an application transaction without evidence and a rollback test.
- Never log credentials, session tokens, DB connection URLs or private errors when diagnosing transaction failures.

## Targeted architectural tests

- Unauthorized business writes fail through module public contracts.
- Module integration tests check FKs, unique constraints, rollbacks, races and real migration compatibility where relevant.
- If an operation claims multi-module atomicity, cause a failure in the **second** write and verify the **first** write was rolled back.
- Check concurrency using controlled isolated DB state (not production data). Ensure test isolation and cleanup.

## Official reference material

- NestJS modules: https://docs.nestjs.com/modules
- Drizzle schema organization: https://orm.drizzle.team/docs/sql-schema-declaration
- Drizzle Kit schema config: https://orm.drizzle.team/docs/drizzle-config-file
- Drizzle transactions/savepoints: https://orm.drizzle.team/docs/transactions
- Better Auth database hooks: https://www.better-auth.com/docs/concepts/database
