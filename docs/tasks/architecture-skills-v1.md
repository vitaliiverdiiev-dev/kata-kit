# KataKit — integrate Architecture v1 skills before Shiori M02

**Task:** Add the provided reusable skill files to the *existing KataKit plugin* and verify Claude Code can discover/use them across projects. This is **not** an instruction to build new agents, a new workflow router, or M02 Authentication itself.

## Starting point and ownership

Read the existing KataKit repository **before modifying anything**: `.claude-plugin/marketplace.json`, `plugins/kata-kit/.claude-plugin/plugin.json`, current `skills/`/`agents/` if present, `install.sh`, README, plugin tests and active architecture/workflow design. Preserve user-scoped installation and existing commands/agents/hooks; avoid duplication. This package assumes KataKit's plugin root is `plugins/kata-kit/`; if your actual plugin manifest points to a different root, adapt **paths**, not the skill names or contents, and report the deviation.

Three provided plugin skills (each a normal Claude Code `SKILL.md` with YAML frontmatter):

```text
plugins/kata-kit/skills/
├── frontend-architecture/SKILL.md
├── backend-architecture/SKILL.md
└── code-quality/SKILL.md
```

Skills must be registered/discovered through the **actual existing plugin structure**. Do not invent `.claude/rules/` under the plugin. Do not duplicate them under `~/.claude/skills/` or in Shiori's `.claude/` unless the user explicitly asks to distribute them a different way. Do not add all three documents to global `~/.claude/CLAUDE.md`.

## Architecture behavior

- `frontend-architecture`: React/TS `app/pages/domain/shared`, page and domain slices, `api/model/helpers/store/hooks/ui`, WHAT/HOW convention, strict main component file, shared UI and tests.
- `backend-architecture`: NestJS modular monolith, `app/infrastructure/modules`, DI contracts and feature ownership, typed persistence, backend/auth safety boundaries.
- `code-quality`: strict TS, naming and ESLint ordering, boundaries, `id`-first keys, JSX props, safe autofix and positive/negative lint tests.

These are **generic reusable defaults for supported stack(s)**, not Shiori-specific files. Do not change them into product-specific rules (`health`, `Japanese`, branded URLs, local server ports). For a different backend framework, do not automatically apply NestJS guidance. Skills carry conventions; the actual project's ESLint/TypeScript checks remain enforceable controls.

Keep skill descriptions short and relevant so Claude can choose the correct skill automatically; full body must load **only when invoked**. Leave the default model-invocable behavior on (no `disable-model-invocation: true`), and retain manual slash invocation. No `allowed-tools`, injected shell execution, hooks, scripts or forced subagent/fork context: these are advisory architecture standards, not autonomous operations.

## Integrate without duplicated policy

1. Confirm skill discovery from plugin manifest/default plugin layout. Existing marketplace/plugin names take precedence; do not rename `kata-kit@kata-kit` just for these skills.
2. Keep the existing KataKit workflow (quick/full/qa/ship) and any permissions/ship safety unchanged. Do not make skills choose workflow or automatically commit/push. These skills supplement an Implementer/Reviewer when such roles exist; they do **not** replace approval/review/verification.
3. Add the **smallest** necessary README documentation: three names, responsibilities, when they apply, explicit invocation, and how to update/reload the user-scoped plugin. Use current supported commands confirmed by the installed Claude version, not invented CLI flags.
4. Ensure project `CLAUDE.md` and local architecture docs remain understandable **without KataKit installed** (Shiori is a public repository). KataKit standards should be consistent with the project. The user may later consolidate duplicate portable docs; do not delete Shiori standards as part of this task.
5. Avoid a new global `/architecture` dispatcher or a separate authentication skill until a concrete repetitive need appears. Do not add a plugin-wide `CLAUDE.md` containing the entirety of these three skills.

## Functional verification

- Use the installed Claude Code version's plugin validation (for example `claude plugin validate` with the plugin root, if supported); record the exact command/results. Validate `SKILL.md` YAML/frontmatter and the skill discovery paths.
- In a fresh Claude Code session with the KataKit plugin enabled (after the user's explicit update/install/reload), verify commands that should be exposed for the plugin's actual name, normally:
  - `/kata-kit:frontend-architecture`
  - `/kata-kit:backend-architecture`
  - `/kata-kit:code-quality`
  If the plugin's manifest uses a different actual name, report the actual namespace instead of assuming.
- Test auto-discovery in representative tasks: React slice change suggests frontend, NestJS module change suggests backend, sorting/lint question suggests code quality. A non-React backend should not invoke the frontend standard; a non-Nest backend should not be forced into NestJS.
- Verify the skill body is loaded when invoked, not merely present in files. Review discovery/runtime behavior if plugin changes need reload/reinstall; don't falsely claim activation solely from valid directory names.
- Confirm no new always-on context bloat, automatic Git actions or tool permission grants.

## Ready-for-M02 contract (Shiori)

Before writing M02, run the small `M01.2-review-fixes.md` task in Shiori and pass its checks. Then **prepare and approve a separate M02 design/spec** covering actual auth library & Nest/Drizzle compatibility, persistent schema/migrations, owner bootstrap/registration policy, session/cookie security, API guards and endpoints, frontend login/logout/session UX, recovery and tests. Since M02 is a large security-sensitive feature, use an approved plan and independent review; do not interpret architecture skills as authorization to implement M02 automatically.

On M02 implementation explicitly instruct Claude to use the **three installed KataKit skills** plus the Shiori local architecture docs, and resolve differences before editing rather than silently selecting one. The public repository must still lint/build/test when KataKit isn't installed.

## Final report

List actual files changed, plugin manifest/version adjustments (if justified), validation command output, skill commands discovered, local user-scope update/reload result or exact unverified step, and any blockers. **Do not commit, push, install globally or change Claude user settings without explicit approval.** Do not implement authentication or modify Shiori from within the KataKit task.
