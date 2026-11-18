# kata-kit

A small, growing toolkit of agents, skills and configs for maintaining code with [Claude Code](https://claude.com/claude-code).

The goal is one installable package that sets up the same Claude Code workflow on any machine, for work and personal projects alike, and that friends and colleagues can install too. It starts deliberately minimal and grows one tested piece at a time.

## Install

In Claude Code:

```
/plugin marketplace add vitaliiverdiiev-dev/kata-kit
/plugin install kata-kit@kata-kit
```

## Skills

Advisory engineering standards. Claude may load a skill's full text when the task matches its description (not guaranteed) or loads it when you type its slash command. Long reference files inside a skill load only when needed.

| Skill | Covers | Loads automatically for |
|---|---|---|
| `/kata-kit:frontend-architecture` | `app/pages/domain/shared` layers, slices (`api/model/helpers/store/hooks/ui`), component boundaries, imports, test placement | React + TypeScript frontend changes |
| `/kata-kit:backend-architecture` | `app/infrastructure/modules` modular monolith, Module → Capability → Responsibility (`http/application/model/persistence/integrations/cli`), module-level `model/`, dependency directions, module public API, data ownership and cross-module reads, transactions, test placement, portability, auth safety (details in `references/`) | NestJS backends only, not FastAPI, Hono etc. |
| `/kata-kit:code-quality` | minimal complete diffs, canonical comment policy, strict TypeScript (sole owner, details in `references/typescript.md`), import/export ordering, `id`-first keys, JSX props, safe autofix | Implementing or reviewing TypeScript / React / NestJS code |
| `/kata-kit:testing` | what is worth testing, TDD (red → green → refactor), regression tests, test doubles, coverage as a diagnostic | Building or changing behavior, fixing bugs |
| `/kata-kit:quality-gate` | final evidence-based verification: types, lint, format, tests, build, runtime, security; PASS / FAIL / NOT RUN / BLOCKED and a READY / NOT READY decision | Explicit checkpoints: before a commit or PR, release, or "done" |
| `/kata-kit:ui-design` | mobile-first UX, design-system tokens, accessibility (WCAG 2.2 AA), visual states, UI review checklist | New or significantly changed UI, UI/UX reviews |

**testing vs quality-gate:** `testing` guides writing tests while you build. `quality-gate` runs once at a checkpoint to verify the finished change and report what actually passed. Neither one commits, pushes or installs anything. A READY report is not permission to commit.

**Comment policy:** `code-quality` owns the single comment policy (zero comments by default, five narrow prefixes). `quality-gate` verifies compliance at the checkpoint.

**Skills are not guaranteed to load automatically.** For consequential work, invoke them explicitly: `code-quality` + `testing` (+ the architecture skill) before coding, `quality-gate` at the end. Confirm they actually loaded.

These are defaults. A project's own ESLint/TypeScript config stays the enforced check. Its `CLAUDE.md` holds project context, commands and documented exceptions; it should not redefine these standards. A conflict between the two should be raised and decided, not silently ignored.

## Update

```
claude plugin marketplace update kata-kit
claude plugin update kata-kit@kata-kit
```

Then restart Claude Code to load the new version.

## License

[MIT](LICENSE)
