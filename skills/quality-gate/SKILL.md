---
name: quality-gate
description: Run a scoped, evidence-based final verification at an explicit pre-commit, pre-PR, release, or implementation-completion checkpoint; check types, lint, format, tests, coverage, builds, relevant runtime behavior and security without committing.
---
# Quality Gate - Verify Before Commit

Use at a **completion / pre-commit / pre-PR checkpoint**, not after every trivial edit. Can be explicitly invoked as `/kata-kit:quality-gate`. This skill is a verification procedure, **not an automatic Git hook or authorization to commit**. Never commit, push, deploy, alter CI, or silently fix unrelated code.

## 0. Discover the real project

Read `CLAUDE.md`, package/workspace manifests, lockfile, scripts, CI, build/test config and changed file list. Determine affected workspaces and dependencies. Use the project's actual package manager/runtime; **never assume PNPM, Docker, Vitest or particular commands exist**. If project-specific checks exceed this generic list, follow those too.

Capture `git status --short`, relevant working-tree/staged diffs, `git diff --check`, and changed-files context. Avoid printing sensitive contents to logs or reports. Distinguish staged, unstaged and untracked files. Don't modify the index.

## 1. Risk and scope

- Routine inner-loop: focused tests/lint/typecheck for changed code; full gate isn't necessary after each file edit.
- Before a commit or handoff: verify **all affected deployable components** and their interactions. A shared library change may require testing downstream apps.
- Raise scrutiny for authentication, authorization, sessions, migrations, money, user data, configuration, permissions, dependency changes, and public API contracts.
- Check for unintended changes, large unrelated rewrites, missing files, build artifacts, secrets, logs, debug statements, disabled checks and unjustified TODO/FIXME workarounds.

## 2. Run applicable checks; do not invent commands

1. **Types:** typecheck the affected workspaces and compile paths.
2. **Static quality:** nonmutating ESLint/architecture checks, formatter check, import boundaries, lint negative fixtures if architecture rules changed.
3. **Tests:** affected unit/component suites and relevant API/DB/e2e integration suites; broaden to regression tests for shared or security-sensitive changes.
4. **Coverage:** use the configured coverage runner if available and relevant; examine risky uncovered behavior/branches; respect existing thresholds rather than inventing a global number.
5. **Build:** actual production build for affected applications/packages; Storybook build or component check when UI primitives/stories change.
6. **Runtime:** start and verify app/health/critical user flow when tools and environment permit. A successful test/build does not prove a running app works; use the runtime/browser workflow if available. Never claim runtime verification without observing it.
7. **Data & deploy readiness:** migrations/schema compatibility, isolated test DB, startup/shutdown and data preservation when changed; do not run migrations against unknown or production-like databases.
8. **Security:** inspect changed trust boundaries, permission enforcement, cookie/session/CSRF/CORS and validation as relevant; review dependency audit/lockfile changes and execute the repo's configured audit/scanner when available. Never claim a scan is complete when it was skipped or offline. No unreviewed supply-chain upgrades merely to obtain a green scan.
9. **Diff hygiene:** check for secret-like files, leaked tokens, local config, unnecessary comments, incomplete TODOs, unused imports, generated artifacts, stale docs and tests changed only to hide a regression.

Use exact project commands (examples only when they exist: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:db`, `pnpm build`, `pnpm format:check`, `pnpm build-storybook`). Do not run mutating `--fix`, `install`, destructive database commands, or code rewriting automatically as part of a supposed *read-only* gate. If a check requires setup, request approval or report blocker.

## 3. Failures, retries, evidence

- If a check fails, identify whether the failure is caused by this change or pre-existing. Report both; do not misclassify a baseline failure as green.
- Run the appropriate tests/checks again after a fix, and repeat any final checks invalidated by new edits.
- Distinguish `PASS`, `FAIL`, `NOT RUN`, and `BLOCKED` for each applicable check. A missing Docker/browser/network capability is **BLOCKED**, not PASS. Mark genuinely inapplicable checks `N/A` with a reason.
- Never make up CI outcomes, coverage values, npm audit results or successful builds. A local scan and build cannot guarantee zero vulnerabilities or a safe future production deployment.

## 4. Decision report (concise)

Report:

- Scope and changed components.
- Commands actually executed and observed results (with failures/blockers).
- Coverage assessment and meaningful untested risks, not just a percentage.
- Security/dependency/runtime checks that did or did not run.
- Diff hygiene and remaining risks.
- **Decision: READY / NOT READY**. READY only when all **applicable required** checks passed, with no blocking risk. If a required check is blocked, say NOT READY; the user may make an explicit exception decision but this skill must not silently approve it.

A clean report is not permission to commit. Only a separate explicit user request authorizes Git mutations. Do not add a new agent, background watcher, automatic commit hook or CI pipeline as part of this skill.
