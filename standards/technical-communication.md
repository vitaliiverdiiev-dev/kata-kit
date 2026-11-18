# KataKit Technical Communication Standard — v0.1

This standard adapts general principles of controlled technical English. It does **not** claim compliance with ASD-STE100 or use its controlled dictionary.

## Scope

Apply to human-readable instructions, plans, explanations, code reviews, handoffs, and implementation reports. Apply in the user's requested language. Preserve exact code, identifiers, file paths, commands, API contracts, quoted content, error messages, and tool output. Do not rewrite code to match prose rules.

## Writing rules

1. State the answer, decision, or result first. Add context only when it changes understanding or action.
2. Use one term for one concept. Define an unfamiliar term on first use. Do not alternate `module`, `capability`, and `component` as synonyms.
3. Prefer clear actors and active verbs: **who does what**. Use imperatives for instructions.
4. Give one independently verifiable action per step. Put prerequisites and conditions before the action.
5. Follow dependency order: prerequisite → action → expected result → verification.
6. Use exact file paths, symbol names, inputs, outputs, and acceptance criteria when known. Never invent them.
7. Replace vague qualifiers such as “properly”, “as needed”, or “obviously” with concrete conditions, or remove them.
8. Keep sentences and paragraphs focused. Remove repeated explanations, but preserve essential technical details.
9. Separate observed facts, reported results, assumptions, risks, and recommendations. State uncertainty explicitly.
10. Match response length and format to the task. Do not force a long template onto a simple question.

## Output conventions

- **Direct answer:** answer first; explain only the decisive reason or next action.
- **Plan:** goal → scope/constraints → ordered actions → verification → blockers, including only relevant sections. Do not present proposed actions as completed.
- **Review:** finding → evidence/location → impact → recommended action. Separate confirmed problems from potential risks. If there are no findings, say what was examined.
- **Implementation report:** changed files/behavior → commands executed and their results → remaining issues. Distinguish tests you ran from results another agent reported.
- **Handoff:** current state → completed decisions → next specific action → constraints and unverified assumptions.

## Evidence vocabulary

- **Verified:** independently checked through an actual tool or observed artifact; identify the check when useful.
- **Reported:** another person, process, or agent states the result; not independently checked.
- **Passed / Failed:** a named check was executed and its result is known.
- **Not run:** the check was not executed.
- **Assumption:** an unverified premise used for reasoning.
- **Risk:** a possible adverse outcome, not a confirmed defect.
- **Blocker:** a condition that prevents the next required action.

## Final check

Before sending technical prose, check terminology, sequence, evidence status, and unsupported claims. Prioritize correctness and the user's explicit requirements over stylistic uniformity. Do not claim formal ASD-STE100 certification or compliance.
