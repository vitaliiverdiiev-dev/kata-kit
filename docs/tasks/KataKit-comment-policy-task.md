# K03 — Strict Comment Policy & Quality-Gate Alignment

**Repository:** `vitaliiverdiiev-dev/kata-kit`  
**Scope:** targeted improvements to existing skills; **not** a new skill, agent, workflow, hook, or architecture.  
**Status:** ready for Claude Code implementation, subject to inspecting the current checkout first.

## Objective

KataKit must be the **single source of truth for reusable engineering rules**. We have observed that Claude retains many comments merely because it classifies every Better Auth/NestJS setting as an "integration constraint." This defeats our clean-code policy. Make comments **prohibited by default**, with a narrow, reviewable exception system. Preserve important security/compatibility knowledge and technical directives; do not encourage destructive, indiscriminate comment removal.

A project may document its concrete architecture, configuration, commands, and genuinely exceptional deviations, and enforce rules using ESLint or other local tools. It must **not redefine or duplicate** KataKit's generic comment, TypeScript, testing, or verification standards. Existing project compiler/linter configuration is executable and must be respected; a conflict with these reusable standards must be surfaced and resolved deliberately, not silently ignored.

## Files to inspect and change

1. **`skills/code-quality/SKILL.md` — mandatory primary change.** Replace/strengthen its existing **"Code should explain itself"** section rather than appending a contradictory second policy. Preserve minimal-complete-diff, strict TypeScript, sorting, and skill ownership sections. Update `description` frontmatter only if useful to improve relevant activation; keep the skill name.
2. **`skills/quality-gate/SKILL.md` — mandatory small change.** Make final verification check comment-policy compliance explicitly; refer to `code-quality` as the canonical policy rather than repeating the five category definitions. Keep the gate *read-only* and scoped to a completion checkpoint, not an automatic code rewriter.
3. **`README.md` — optional minimal change if current usage guidance needs clarification.** State that `code-quality` owns the policy and `quality-gate` verifies compliance; an installed skill is **not guaranteed to load automatically**, so consequential tasks should invoke the relevant skills explicitly and confirm they were loaded. Do not paste the policy into README.
4. **Plugin metadata/version:** inspect existing versioning conventions; apply a **patch** version bump only if that is the established convention for changing skill behavior. Do not change marketplace/plugin identity or add installation machinery.

Do **not** create another `comments` skill, reference document, duplicated standard, plugin hook, CI workflow, or agent. Leave `testing`, UI and architecture skills unchanged unless an actual contradiction is identified; report any such contradiction before extending scope.

## Canonical comment policy to implement in `code-quality`

### Default: zero comments

Names, types, control flow, tests, and well-structured functions should explain the code. Comments explaining **what a file/class/function does**, restating a setting or next statement, advertising a milestone, describing JSX layout/styling, or repeating a test assertion are prohibited. Technical truth alone is insufficient value.

The only **ordinary human-authored source-code comment categories** are:

| Prefix | Narrow purpose | Minimum content |
| --- | --- | --- |
| `TODO` | Concrete, genuinely deferred work, not required for the current acceptance criteria | The remaining action; task reference when available |
| `FIXME` | A known, precisely identified defect that cannot be resolved in the current authorized scope | The defect and required correction; risk/task reference when available |
| `WORKAROUND` | Temporary workaround for a real constraint | Why it exists, affected dependency/system, removal condition |
| `INVARIANT` | Critical *non-obvious* correctness/security/state constraint that code and names cannot sufficiently convey | The invariant and what breaks if violated; ideally backed by a test |
| `COMPAT` | Verified version-specific behavior of an external dependency, runtime, protocol, or platform | Name/version or specific external contract, the non-obvious behavior, and why the workaround/configuration is necessary |

Preferred concise examples (illustrative, **not** mandatory comments to add):

```ts
// TODO(SHI-123): Add recovery emails when SMTP setup is supported.
// FIXME(SHI-124): Prevent duplicate invitations under concurrent requests.
// WORKAROUND(package@1.2.3): Use X until upstream fixes Y; remove after upgrade.
// INVARIANT: Consume an invitation atomically with user creation to prevent reuse.
// COMPAT(better-auth@1.7.23): Test mode disables Origin verification by default.
```

Require a **substantive explanation** after the marker. Adding `INVARIANT:` or `COMPAT:` to ordinary narration does **not** make it valid. No additional categories such as `NOTE`, `INFO`, `IMPORTANT`, `HACK`, `WHY`, `M02.1`, or free-form JSDoc prose. One short line is preferred; extend only if essential.

### Mandatory decision process — before *each* comment

1. Can naming, types, code structure, a named function/constant, or a test make the reason clear? **If yes, write no comment.**
2. Would removing the comment realistically cause a maintainer to miss an important fact not evident from the code or the repository's normal documentation? **If no, remove it.**
3. Does it fit one of the five narrow categories, with a factual, specific reason? **If no, remove or move the explanation to product/architecture documentation** when appropriate.
4. Is the wording as short and precise as possible? Remove redundant prose and stale version/milestone references.
5. For `COMPAT`/`WORKAROUND`/`INVARIANT`, look for concrete evidence (source behavior, test, cited upstream restriction, relevant security requirement). Do not invent an integration quirk to justify a comment.

**Explicit examples of invalid rationale:** `transaction: true` "because it enables transactions"; `session.expiresIn` "seven-day session"; `disableSignUp: true` "signup disabled until next milestone"; method JSDoc that paraphrases its name; explaining a touch target already defined by a design token; `api:check` header that repeats its CLI name. A concise note explaining an *unexpected upstream behavior that code would otherwise tempt someone to remove* may pass.

### Necessary technical exceptions (not an escape hatch)

Preserve legally required license/copyright notices; generated code (do not hand-edit); tool-required pragmas/triple-slash references when objectively required; and type-bearing JSDoc in JavaScript (`.js/.mjs/.cjs`) where it is actually needed for TS checking. These are **technical metadata**, not permission for narrative JSDoc. Disabling ESLint/TS errors is **not** an acceptable shortcut; any unavoidable targeted directive requires explicit justification and project review. Avoid adding an exemption merely because a parser/linter finds a comment inconvenient.

A necessary published API contract may be documented in dedicated reference/API documentation; do not turn every exported function into JSDoc. Prefer types and named parameters for local TypeScript APIs.

### Scope and enforcement ownership

This policy applies to all **maintained source and configuration** to the extent the language/tool supports comments. Do not alter generated code, licenses or vendored dependencies. KataKit owns **semantic judgment**. The actual project's ESLint tooling should reject unclassified ordinary JS/TS comments, with narrow, tested exceptions; never ship a mass-delete fixer. ESLint can check format/category, **not whether the claimed `COMPAT` or `INVARIANT` is true**. Code review must still assess necessity.

Keep changes minimal: do not mandate a custom ESLint implementation for every language/project, and do not inject a generic ESLint config from KataKit into each repository.

## `quality-gate` integration

Amend the existing comment/diff hygiene check so that for relevant source changes it requires:

- The repository's comment-policy lint/check (if configured) is executed and passes with zero errors/warnings; if missing, manually review comments and disclose that enforcement is not automated.
- Review **new and retained** comments in the affected source for actual value, including misuse of prefixes. A passing marker regex is **not** proof of compliance.
- Explain technical exceptions, generated-code exclusions, or outstanding violations in the report; no silent waivers.
- Formatting, lint, types, tests, generation drift and builds stay independently verified according to the existing skill. A nonzero security audit is reported separately, with exact advisories and risk acceptance requiring explicit user decision; never relabel a failed command as PASS.
- Pre-existing lint/format failures are failures, not automatically exempt. Make a separate fix pass before rerunning the **read-only** quality gate; avoid unrelated destructive refactors without approval.

Do not make the gate rewrite comments or run `lint:fix`/`format --write` as part of its read-only verification.

## KataKit skill invocation and scope

Ensure the skills still advertise accurate loading criteria. For a substantial TS/React/NestJS implementation: invoke `code-quality` and `testing` **before code changes**, plus the relevant architecture skill; invoke `quality-gate` at the final checkpoint. For a comment-policy audit: invoke `code-quality`, then `quality-gate` to verify. The model must confirm actual skill loading rather than infer loading from prior conversation or project docs. No promise that Markdown alone makes skill activation compulsory.

Project `CLAUDE.md` files should contain only project-specific product context, executable commands, decisions, and exceptions; they do not replace or reproduce universal KataKit instructions. Do not install a new agent/hook just to enforce this task.

## Acceptance criteria

1. One unambiguous canonical comment policy exists in `skills/code-quality/SKILL.md`; five categories, clear reject cases, limited technical exceptions, and a decision process.
2. `skills/quality-gate/SKILL.md` references the policy and requires evidence-based final compliance reporting without duplicating its substance.
3. All six skills remain valid and discoverable; no contradictory wording about comment freedom or ownership; no new skills/rules/hooks/agents.
4. Validate plugin metadata and skill frontmatter using available Claude Code tools; if unavailable, mark **NOT RUN**, not PASS. Perform realistic examples of allowed/rejected comments and demonstrate the skill rules can distinguish them.
5. Report exact files modified, plugin version if changed, validation actually performed, and remaining limitations. **No code or configuration changes in Shiori in this task.**

**Git safety:** Do not commit, push, publish, or install/update the user's global plugin without explicit authorization. Stop for review.
