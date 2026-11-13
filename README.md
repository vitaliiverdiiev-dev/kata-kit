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

Advisory engineering standards. Claude loads a skill's full text only when the task matches its description (automatic) or when you type its slash command (manual). Long reference files inside a skill load only when needed.

| Skill | Covers | Loads automatically for |
|---|---|---|
| `/kata-kit:frontend-architecture` | `app/pages/domain/shared` layers, slices (`api/model/helpers/store/hooks/ui`), component boundaries, imports, test placement | React + TypeScript frontend changes |
| `/kata-kit:backend-architecture` | `app/infrastructure/modules` modular monolith, DI and feature ownership, typed persistence, auth safety boundaries | NestJS backends only, not FastAPI, Hono etc. |
| `/kata-kit:code-quality` | minimal complete diffs, comment discipline, strict TypeScript (sole owner, details in `references/typescript.md`), import/export ordering, `id`-first keys, JSX props, safe autofix | Implementing or reviewing TypeScript / React / NestJS code |
| `/kata-kit:testing` | what is worth testing, TDD (red → green → refactor), regression tests, test doubles, coverage as a diagnostic | Building or changing behavior, fixing bugs |
| `/kata-kit:quality-gate` | final evidence-based verification: types, lint, format, tests, build, runtime, security; PASS / FAIL / NOT RUN / BLOCKED and a READY / NOT READY decision | Explicit checkpoints: before a commit or PR, release, or "done" |
| `/kata-kit:ui-design` | mobile-first UX, design-system tokens, accessibility (WCAG 2.2 AA), visual states, UI review checklist | New or significantly changed UI, UI/UX reviews |

**testing vs quality-gate:** `testing` guides writing tests while you build. `quality-gate` runs once at a checkpoint to verify the finished change and report what actually passed. Neither one commits, pushes or installs anything. A READY report is not permission to commit.

These are defaults. A project's own `CLAUDE.md`, documented exceptions and ESLint/TypeScript config take precedence and stay the enforced checks.

## Update

```
claude plugin marketplace update kata-kit
claude plugin update kata-kit@kata-kit
```

Then restart Claude Code to load the new version.

## License

[MIT](LICENSE)
