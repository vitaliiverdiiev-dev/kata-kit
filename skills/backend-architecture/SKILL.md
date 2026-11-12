---
name: backend-architecture
description: Apply the reusable KataKit Architecture standard to NestJS and TypeScript backend feature development, authentication modules, database infrastructure, module boundaries, testing, and architectural reviews.
---

# Backend Architecture — NestJS Modular Monolith

Use for NestJS/TypeScript backend work. First inspect the target repo's framework, `CLAUDE.md`, current module structure, migrations, configuration and tests. This skill defines a **default** for compatible projects; documented exceptions override the default. Do not force Nest conventions onto a FastAPI/Hono backend or rewrite an existing architecture unrequested.

## Top-level ownership

```text
src/
├── app/                   # app.module.ts, app.config.ts; composition and global Nest setup
├── infrastructure/        # config, database, transport/storage adapters as actually required
├── modules/               # independently owned functional Nest modules
└── main.ts                # bootstrap, no business logic
```

- `app/`: Nest app composition and global framework configuration; registers feature modules and infrastructure. `app.config.ts` configures the **Nest application** (distinct from environment validation).
- `infrastructure/`: env parsing/validation, persistence provider/pool, external system clients, lifecycle management. **No dependency on product feature internals.** Avoid generic repositories, base services, or invented adapters without consumers.
- `modules/<feature>/`: own controllers, services/application logic, schemas, DTOs, guards, policies and tests **as needed**. Modules can start with two files. Do not scaffold all possible folders.
- `main.ts`: validated startup and app bootstrap; no business behavior.
- Repository `infra/` (Docker/Compose/CI/deployment artifacts) is separate from runtime backend `src/infrastructure/`.

## Module boundaries

- Nest application composition imports feature module entry classes. Other modules access a feature through **explicit exported providers / public contracts**, not deep-import its private controllers/helpers or reach across directly into its schema.
- Use dependency injection; keep controllers primarily about HTTP parsing/response mapping/guards; move meaningful business actions to focused services when warranted. Never create a service merely for symmetry with another module.
- Keep migrations and database schemas with actual owners; for Drizzle-based projects follow the project's `*.schema.ts` glob and reviewable SQL migration workflow. Never introduce an extra connection pool or run schema push automatically on startup unless specifically designed and approved.
- Avoid circular Nest module dependencies and habitual `forwardRef()`. A module should have a coherent responsibility, not a name based on one technical file type.
- Prefer explicit typed validation at runtime boundaries and never log passwords, tokens, connection strings or internal error stacks in public endpoints.

## Authentication-specific architecture considerations

When implementing authentication, **do not invent a custom crypto/session protocol**. Respect the actual selected auth library and its integration contract. Decide ownership explicitly: auth/session module, user/profile module only when distinct, persistence schema owner, auth guards, HTTP adapter, public endpoints, and frontend API contracts. Design for secure server-side enforcement (not only frontend route hiding), least privilege, safe cookie/session configuration, CSRF/CORS decisions, rate limiting of sensitive endpoints, safe password/session handling, and clearly documented self-hosted bootstrap/registration policy. Validate the current library/Nest/ORM version compatibility and official documentation before committing to an integration. Avoid security promises unsupported by tests. Never expose secrets through logging or API status endpoints.

## Tests and completion

- Test public HTTP behavior, 4xx/5xx handling, guards, invalid inputs, authorization denials, session expiry/revocation, DB failure/cleanup, and actual persistence when applicable. Follow repo's existing backend test structure; no forced frontend folder conventions.
- Distinguish unit/e2e/database tests; keep fast unit tests runnable without Docker if already supported. Use isolated test DBs and preserve local data by default.
- Strict TypeScript: no `any`, unsafe/non-null assertions. Keep named exports and clear interfaces. Preserve ESM import specifiers and Nest decorator metadata as required by the configured compiler/runtime.
- Verify lint, typecheck, tests, build, migrations and startup with **actual command results**; explain unrun checks. Do not alter CI, permissions or Git state without authorization.
