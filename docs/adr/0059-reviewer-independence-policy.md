# ADR 0059 — Reviewer identity and independence (DA30-015)

- **Status:** Accepted

## Policy fields

author, runner, reviewer, tool/agent provenance, conflict, reviewTime, changedFacts.

## Rules

- Same human/agent as author and reviewer ⇒ label **self-review** (not independent).
- Independent review requires distinct reviewer identity recorded before claim promotion.
- Accepted example: author=implementer, reviewer=audit-agent-B, conflict=none.
- Rejected example: author=agent-X, reviewer=agent-X, claim labeled independent.
