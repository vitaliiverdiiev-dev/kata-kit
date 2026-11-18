# Backend test placement and portability review

This reference owns **placement**, not test-selection policy: `testing` decides what/why/how; `quality-gate` decides which verification to run at handoff.

## Unit test placement (same rule as frontend)

Compare the immediate parent directory name with the source filename **segment before its first dot**. Equal → test is **adjacent**; otherwise → **`tests/` in that same directory**.

| Source | Unit test |
| --- | --- |
| `auth/auth.module.ts` | `auth/auth.module.spec.ts` |
| `sessions/http/controllers/sessions.controller.ts` | `sessions/http/controllers/tests/sessions.controller.spec.ts` |
| `invitations/application/accept-invitation.ts` | `invitations/application/tests/accept-invitation.spec.ts` |
| `model/helpers/invitation.policy.ts` | `model/helpers/tests/invitation.policy.spec.ts` |
| `integrations/mailer/mailer.adapter.ts` | `integrations/mailer/mailer.adapter.spec.ts` |

- Do not create `tests/` until a real test exists. No forced `__tests__/` or one file per helper.
- Preserve the repository's established unit-test suffix (`.spec.ts`, `.test.ts`), runner configuration and documented exceptions. The rule is about location, **not forced renaming**.
- The rule applies to new tests. Do not relocate existing tests solely to satisfy it.

## Integration and e2e

Integration tests belong to the **boundary of the behavior they verify**: put them in `tests/integrations/` of the smallest directory that contains that boundary.

| Verified behavior | Location |
| --- | --- |
| One persistence operation against a real DB (constraint, query, locking) | `<capability>/persistence/tests/integrations/` |
| A capability's behavior through its real providers, DB or vendor hooks | `<capability>/tests/integrations/` |
| A flow across several capabilities, or the module's public contract | `modules/<module>/tests/integrations/` |
| A single-capability module | `modules/<module>/tests/integrations/` (module root is the capability) |

- Test against meaningful real boundaries: DB constraints, transaction rollback, actual Nest providers, vendor hooks. Cover a behavior once at the level that proves it; do not duplicate it at every level.
- Application-spanning e2e and shared harness setup can remain in project-level `test/` or `tests/` according to the target repository. Do not make a second mirrored tree by default.
- `tests/integrations/` means **integration tests**, whereas `integrations/` as a responsibility means **production vendor adapters**.
- Existing integration tests under `modules/<module>/tests/integrations/` remain valid; do not relocate them solely to match a narrower boundary.
- **Never silently move test files:** update test runner include/exclude patterns, DB config, scripts and any CI paths before deciding to relocate. Confirm both unit and DB suites discover their tests. Keep unit runs independent of Docker where already supported.

Example after a module becomes substantial:

```text
modules/auth/
├── auth.module.ts
├── model/
│   └── helpers/
│       ├── invitation.policy.ts
│       └── tests/
│           └── invitation.policy.spec.ts
├── invitations/
│   ├── application/
│   │   ├── accept-invitation.ts
│   │   └── tests/
│   │       └── accept-invitation.spec.ts
│   ├── persistence/
│   │   ├── invitation.queries.ts
│   │   └── tests/
│   │       └── integrations/
│   │           └── invitation.queries.spec.ts
│   └── tests/
│       └── integrations/
│           └── accept-invitation.spec.ts
└── tests/
    └── integrations/
        └── registration-flow.spec.ts
```

This is an illustration, not required scaffolding. Use whatever suffix the project's DB runner config already selects; the DB runner should include `**/tests/integrations/**` at any depth. If unit and DB tests share a suffix, the unit runner must exclude `**/tests/integrations/**`. A module whose tests are all adjacent has no `tests/` directory.

## Portable-module readiness checklist

A module's *source boundary* should be self-contained enough that copying its root folder is the main step. Explicit external integration steps are normal; a standalone package is not required.

- [ ] No product-specific table/UI business fields in the reusable mechanism.
- [ ] The public Nest module/providers/contracts are clear; no imports from other feature internals.
- [ ] Required external npm dependencies, version constraints and config inputs are discoverable.
- [ ] Module-owned library hooks, guards, schemas, `model/` rules and tests live inside its source boundary where feasible.
- [ ] Shared DB/pool, environment config, logging, HTTP adapter and other runtime facilities are supplied via known integration points.
- [ ] Existing target migrations are preserved; generate/review migrations for the target schema rather than copying another app's migration history blindly.
- [ ] Test files and runner setup can be relocated without accidental test exclusions.
- [ ] The module works without removing product-domain conditions scattered through its internals.

If a feature is unlikely to be transferred (e.g., a product-specific editor), its clean ownership still matters, but adding general-purpose plugin layers just for hypothetical portability is a failure of minimalism.
