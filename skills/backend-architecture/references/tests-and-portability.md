# Backend test placement and portability review

This reference owns **placement**, not test-selection policy: `testing` decides what/why/how; `quality-gate` decides which verification to run at handoff.

## Unit test placement (same rule as frontend)

Compare the immediate parent directory name with the source filename **segment before its first dot**. Equal → test is **adjacent**; otherwise → **`tests/` in that same directory**.

| Source | Unit test |
| --- | --- |
| `auth/auth.controller.ts` | `auth/auth.controller.spec.ts` |
| `auth/auth.service.ts` | `auth/auth.service.spec.ts` |
| `auth/invitations.ts` | `auth/tests/invitations.spec.ts` |
| `application/create-user/create-user.ts` | `application/create-user/create-user.spec.ts` |
| `application/create-user.ts` | `application/tests/create-user.spec.ts` |

- Do not create `tests/` until a real test exists. No forced `__tests__/` or one file per helper.
- Preserve the repository's established unit-test suffix (`.spec.ts`, `.test.ts`), runner configuration and documented exceptions. The rule is about location, **not forced renaming**.
- The rule applies to new tests. Do not relocate existing tests solely to satisfy it.

## Integration and e2e

- Where compatible with discovery and lifecycle setup, module-owned DB/integration tests belong under `modules/<feature>/tests/integrations/`. They should test the module against meaningful real integration boundaries: DB constraints, transaction rollback, actual Nest providers, vendor hooks, etc.
- Application-spanning e2e and shared harness setup can remain in project-level `test/` or `tests/` according to the target repository. Do not make a second mirrored tree by default.
- `integrations/` here means **integration tests**, whereas `modules/<feature>/integrations/` means **production vendor adapters**.
- **Never silently move test files:** update test runner include/exclude patterns, DB config, scripts and any CI paths before deciding to relocate. Confirm both unit and DB suites discover their tests. Keep unit runs independent of Docker where already supported.

Example after a feature becomes substantial:

```text
modules/auth/
├── auth.module.ts
├── application/
│   ├── create-invitation.ts
│   └── tests/
│       └── create-invitation.spec.ts
├── persistence/
│   └── invitation.schema.ts
├── integrations/
│   └── better-auth/
│       └── auth.config.ts
└── tests/
    └── integrations/
        └── invitation.spec.ts
```

This is an illustration, not required scaffolding for every feature. Use whatever suffix/path the project's DB runner config already selects. If unit and DB tests share a suffix, the unit runner must exclude `**/tests/integrations/**`. A trivial module can keep its simple tests adjacent and have no `tests/` directory.

## Portable-module readiness checklist

A module's *source boundary* should be self-contained enough that copying its root folder is the main step. Explicit external integration steps are normal; a standalone package is not required.

- [ ] No product-specific table/UI business fields in the reusable mechanism.
- [ ] The public Nest module/providers/contracts are clear; no imports from other feature internals.
- [ ] Required external npm dependencies, version constraints and config inputs are discoverable.
- [ ] Module-owned library hooks, guards, schemas, domain rules and tests live inside its source boundary where feasible.
- [ ] Shared DB/pool, environment config, logging, HTTP adapter and other runtime facilities are supplied via known integration points.
- [ ] Existing target migrations are preserved; generate/review migrations for the target schema rather than copying another app's migration history blindly.
- [ ] Test files and runner setup can be relocated without accidental test exclusions.
- [ ] The module works without removing product-domain conditions scattered through its internals.

If a feature is unlikely to be transferred (e.g., a product-specific editor), its clean ownership still matters, but adding general-purpose plugin layers just for hypothetical portability is a failure of minimalism.
