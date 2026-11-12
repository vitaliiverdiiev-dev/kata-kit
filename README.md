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

Advisory Architecture standards. Claude loads a skill's full text only when the task matches it or when you invoke it.

| Skill | Covers | Applies to |
|---|---|---|
| `/kata-kit:frontend-architecture` | `app/pages/domain/shared` layers, slices (`api/model/helpers/store/hooks/ui`), component boundaries, imports, test placement | React + TypeScript frontends |
| `/kata-kit:backend-architecture` | `app/infrastructure/modules` modular monolith, DI and feature ownership, typed persistence, auth safety boundaries | NestJS backends only, not FastAPI, Hono etc. |
| `/kata-kit:code-quality` | strict TS, naming, import/export ordering, `id`-first keys, JSX props, safe autofix, lint tests | TypeScript / React / NestJS code |

These are defaults. A project's own `CLAUDE.md`, documented exceptions and ESLint/TypeScript config take precedence and stay the enforced checks.

## Update

```
claude plugin marketplace update kata-kit
claude plugin update kata-kit@kata-kit
```

Then restart Claude Code to load the new version.

## License

[MIT](LICENSE)
