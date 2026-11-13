# K02 — KataKit Engineering Quality Skills

**Status:** Ready for implementation. **Scope:** KataKit repository only. **Goal:** establish a small, tested, reusable engineering process **before** planning Shiori M02 Authentication.

**Important:** The files accompanying this task contain the initial full skill content. **Do not regenerate them from scratch**, rewrite established frontend/backend architecture, or create an orchestration system. Integrate and validate them against the current repository and Claude Code capabilities.

## Current baseline (verify first)

At task authoring, public KataKit used:

```text
.claude-plugin/plugin.json         # name kata-kit, version 0.2.0
.claude-plugin/marketplace.json
skills/frontend-architecture/SKILL.md
skills/backend-architecture/SKILL.md
skills/code-quality/SKILL.md
README.md
```

Skills belong in **repository-root `skills/`**, not in `plugins/kata-kit/skills/`. Inspect the current tree and any newer changes before modifying anything. Existing plugin/marketplace metadata and installation commands must remain valid.

## Files supplied with K02

| Path | Action | Responsibility |
| --- | --- | --- |
| `skills/code-quality/SKILL.md` | Update existing | Minimal complete diffs, meaningful comments, typed TS, ESLint and safe autofix |
| `skills/code-quality/references/typescript.md` | Add | Single canonical, detailed reusable TS guidance |
| `skills/testing/SKILL.md` | Add | Value-based tests, TDD cycle, regression discipline, test levels and coverage |
| `skills/quality-gate/SKILL.md` | Add | Evidence-based verification at pre-commit/pre-PR/completion checkpoint |
| `skills/ui-design/SKILL.md` | Add | Human-centered minimal UI/UX, mobile-first native feel, tokens, accessibility |
| `skills/ui-design/references/review-checklist.md` | Add | On-demand screen/form/design audit checklist |

The supplied versions are implementation inputs. Preserve their intent and completeness. Make only justified edits for actual Claude Code format, incompatible guidance, or a test-proven problem; explain such edits in the final report.

## Single-source-of-truth boundaries — mandatory

- **`frontend-architecture`** owns layers `app/pages/domain/shared`, slice public APIs/`index.ts`, `api/model/helpers/store/hooks/ui`, React component-file contract, frontend test *placement*, styling file ownership, shadcn layout. Do not duplicate the tree or detailed placement rules in new skills.
- **`backend-architecture`** owns NestJS modular monolith, infrastructure/feature ownership, persistence module boundaries and server-side auth security architecture. Its existing auth section remains canonical for backend boundaries.
- **`code-quality`** owns all code-style decisions, TypeScript, comments, naming, minimal-change discipline, import/export sorting, object key order, magic numbers and ESLint strategy. Detailed TS material lives only in `code-quality/references/typescript.md`.
- **`testing`** owns whether and how to write tests, TDD, meaningful coverage, regression protection, test doubles and levels. Architecture controls where test files live.
- **`quality-gate`** owns *when and how to verify the finished change*, concrete command discovery, smoke/build/security/dependency verification and the READY/NOT READY decision. It must not replace `testing` or automatically commit.
- **`ui-design`** owns design quality, mobile touch/keyboard UX, visual states, system tokens, accessibility and interface review. It does not redefine frontend folder structure or TypeScript patterns.
- Project `CLAUDE.md`, tested ESLint/TS/CI configs and documented project exceptions constrain the generic KataKit defaults. Never silently override a project to satisfy generic examples.

A skill's body loads only when relevant; keep SKILL.md focused and move long details into linked references loaded on demand. No additional `rules/` component, agents, hooks, MCP, workflows, CI modifications, dependency installations or automated shipping for K02.

## Implementation steps

1. Review the current repo, plugin manifest, marketplace source and installed skill layout. Check for edits that conflict with supplied files. Preserve any newer valid improvements.
2. Install the six supplied files at **exactly** the paths above. No copy of the same skill inside `.claude/skills` or a nested `plugins/` directory.
3. Preserve existing `frontend-architecture` and `backend-architecture` content unless a demonstrable bug/contradiction demands a small change. Do not rewrite them merely to mention the new skills.
4. If a cross-skill reference is needed, make it a short pointer, not duplicate paragraphs. Ensure all skill descriptions target appropriate use and don't cause every skill to activate for trivial tasks.
5. Update root `README.md` to list **all six skills** with brief use cases, explicit/manual and relevant automatic invocation, the difference between testing and quality-gate, and the exact installation/update instructions already appropriate for this repository.
6. Review `.claude-plugin/plugin.json`: if this is released as an additive feature set and the version is still `0.2.0`, bump it to `0.3.0` (minor feature release), preserving all other metadata. If the existing version has advanced, choose a consistent next release number and document the choice. Don't alter marketplace identity.
7. Ensure `quality-gate` is invocable at the right checkpoint and **does not create a commit**, change Git state or claim automatic Git-hook enforcement. We deliberately use a skill now; future shipping automation/CI enforcement is a separate task.
8. Keep Shiori unchanged. Do not create M02 Authentication code or plans as part of K02.

## Required verification

### Structural validation

- Confirm exactly the expected six skills exist with correct names/descriptions and YAML frontmatter.
- Validate the plugin with the official CLI, preferably `claude plugin validate .` (or equivalent documented command from the repo root). Run `--strict` if the installed CLI supports it and address genuine warnings; report environment/CLI blockers.
- Confirm no unexpected duplicate plugin skills/commands, missing reference files, broken Markdown links, accidental subdirectory `index.ts`, or plugin manifest changes that break installation.
- Verify that the repo remains dependency-free unless it already had dependencies. Markdown/reference skills alone do not need npm packages.
- Review the diff for secrets, personal configs, generated artifacts and unrelated changes. No `node_modules` or private `.env` files.

### Routing and behavior smoke tests

Run actual Claude Code (with the plugin loaded) if available and verify that:

| Prompt / use case | Expected relevant skills; avoid the rest |
| --- | --- |
| Implement a strictly typed React sign-in form | frontend-architecture, code-quality, testing, ui-design; backend only if needed |
| Implement NestJS session validation and guards | backend-architecture, code-quality, testing; UI design not needed |
| Review a cramped mobile settings screen | ui-design (and frontend-architecture only if structural edits are involved) |
| Fix a small pure TS helper with a regression | code-quality and testing; no full quality-gate during each edit |
| Run final checks before a requested commit | quality-gate plus any specific checks applicable; **no commit** |
| Correct a Markdown typo | No unrelated UI/design/architecture/test skill loading |

For each check, verify the content actually guided a representative answer rather than merely appearing in a menu. For testing, validate RED → GREEN → REFACTOR and regression-aware updates. For code quality, validate an intentionally obvious explanatory comment is deleted while a necessary security rationale is retained. For quality-gate, validate PASS/FAIL/NOT RUN/BLOCKED honesty on a project with unavailable integration infrastructure. For UI, validate visual hierarchy and accessible mobile form behavior without inventing screenshots.

If automatic selection is uncertain or CLI/eval tooling is unavailable, report exactly what was manually/structurally checked; don't fabricate a successful invocation. Use the built-in plugin eval tooling only if already available; no custom test harness or dependency required. A task-specific dry run must be safe and must not perform Git mutations.

### Regression and duplication review

- Existing `/kata-kit:frontend-architecture`, `/kata-kit:backend-architecture`, `/kata-kit:code-quality` still work.
- New `/kata-kit:testing`, `/kata-kit:quality-gate`, `/kata-kit:ui-design` load and can be invoked.
- TypeScript guidance has one owner; test strategy and quality-gate do not overlap into duplicated checklists; UI standards do not define architecture folder names.
- Comments policy permits meaningful WHY comments, TODO/FIXME/WORKAROUND, public API docs where warranted, and essential security notices without inviting noise.
- TDD is behavioral, pragmatic and test-first when practical; not a requirement to test every line or reach an invented coverage percentage.
- Quality-gate never reports green for skipped/blocked checks and never implicitly commits/pushes.
- No Ponytail plugin code copied wholesale, no additional always-on hooks, and no line-count metric used as a proxy for correctness.

## Completion report

Provide a concise final report including:

1. Changed/added paths and plugin version.
2. All six callable skills and what invokes them.
3. Structural validation commands and actual results.
4. The routing/behavior scenarios actually checked vs not checked.
5. Any conflicts/risks or permissions/tooling blockers, with no invented success.
6. Clear confirmation: **Shiori unchanged, M02 not started, no commit/push/deploy without explicit user authorization.**

Do not ask for another architecture approval loop. Complete the scoped work and stop.
