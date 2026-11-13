---
name: testing
description: Apply pragmatic test strategy and test-driven development when building or changing behavior in TypeScript, React, NestJS or other supported applications; prioritize regression protection, real outcomes, useful coverage and maintainable tests.
---
# Testing - Evidence Before Coverage

Use while implementing behavior, fixing a bug, or changing a public contract. Architecture skills decide **where** tests belong; this skill decides **why, what and how** to test. Learn the actual test runner and project conventions before writing tests. Do not install a second runner because this skill mentions a tool.

## Value test: what earns its maintenance cost?

Tests are valuable when they guard a meaningful behavior, realistic failure mode, integration contract, security property, business invariant, or previous regression. Ask: **what broken behavior would this test detect?**

- Prefer observable behavior and public contracts over private functions, class internals, implementation-specific hook calls, library behavior, or mock implementation details.
- Avoid tautologies, tests of constants with no behavioral risk, snapshots of unstable UI, excessive mocking, and assertions that repeat the implementation instead of stating a requirement.
- Choose the lowest level that still proves the behavior: pure helpers at unit level; UI interaction at component level; API/DB/session at integration/e2e level. Don't demand all levels for every feature.
- Use realistic edge cases: invalid and missing input, error/retry, empty data, cancellation, permissions, stale state, concurrency when relevant.
- One meaningful focused test can outperform many low-signal tests. Do not invent tests to meet an arbitrary percentage.

## TDD for behavioral features

1. Understand the requirement and define the **minimal core behavior** and its observable acceptance outcome.
2. Write a small test that fails for the **intended missing behavior** (RED). Run it; make sure the failure is meaningful, not a broken test setup.
3. Implement the smallest **complete and safe** change that passes it (GREEN). Include required validation/security, not a knowingly insecure shortcut.
4. Refactor for naming, types, ownership and simplicity while keeping the test green.
5. Repeat for the next behavior. After the core works, review requirements and add the meaningful negative, integration, edge, and regression coverage still missing.
6. Run the affected suite after every meaningful change; before handoff invoke the relevant quality-gate process.

TDD is a **working discipline**, not ritual. For mechanical moves, documentation, dependency configuration or safe refactors, establish existing regression tests or characterization tests first rather than writing meaningless new tests. If a bug lacks a reproduction, write a failing regression test before fixing it when feasible.

## Stable, trustworthy test design

- Use Arrange → Act → Assert with descriptive scenario names. Test user-visible outcomes rather than intermediate implementation steps.
- Prefer real code inside the unit/system under test; mock at unavoidable boundaries (network, clock, external provider) rather than every collaborator. For HTTP frontends, prefer the project's MSW conventions where available.
- Avoid real network, production services, credentials, user data, nondeterministic sleeps and order-dependent fixtures. Reset state, timers and caches; isolate DB tests with a clearly nonproduction database.
- Component tests: interact through the UI using accessible roles, names and user events. Check loading, success, errors, retry, keyboard/focus when relevant. Don't assert CSS class strings as the primary behavioral result.
- API integration tests: verify status code, response contract, actual guard/authorization behavior, validation, persistence and error semantics. Test real DB behavior where the requirement depends on it.
- Keep the established file placement convention: `frontend-architecture` owns React test placement; backend follows the target project's conventions.
- Tests must fail when the intended regression is reintroduced. Spot-check this reasoning for important/high-risk cases.

## Coverage and regression policy

- Coverage is a **diagnostic**, not a target that justifies unhelpful assertions. Follow explicit project thresholds if configured; don't silently invent new global percentages.
- Review uncovered branches **by risk**: auth rules, validation paths, critical state transitions, error recovery, integration boundaries. Report meaningful gaps and why they're acceptable or blocking.
- When a test breaks after a change, inspect requirements and implementation first. Update the test only if the intended contract actually changed; don't weaken the test to achieve green.
- Keep fast local tests independent of Docker where the project already supports that. Run DB/e2e tests separately when needed and report unverified environment-dependent checks.

## Authentication/security-sensitive additions

For auth, permissions and sensitive operations, cover server-enforced denial (not just hidden UI), invalid credentials, invalid/missing/expired/revoked sessions, login/logout behavior, safe cookie/session integration, first-owner/registration policy if applicable, persistence, and key failure paths. Include abuse protections and CSRF/security contracts when present in scope. Never substitute mocked UI auth for backend authorization tests.

## Handoff

State **which behavior** each added test protects, which suites actually ran, which important paths remain untested, and any environment blockers. Do not report invented coverage numbers or claim tests passed without execution. Don't commit/push without explicit request.
