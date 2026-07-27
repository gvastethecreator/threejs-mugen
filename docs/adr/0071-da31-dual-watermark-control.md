# ADR 0071 — DA31 dual watermark control

Status: accepted  
Date: 2026-07-27

## Context

DA30 machine status set `closedThrough = DA30-120` from a fixed accepted map
and file presence. Written-clause review cannot treat that field as full
adjudication. Post-DA30-120 audit needs separate machine and human cursors.

## Decision

Control carries:

- `recordedThrough` — last machine series watermark (legacy alias: `closedThrough`)
- `adjudicatedThrough` — last consecutive ID whose original written clauses pass
- `reviewedThrough` — audit sampling watermark (may trail or match recorded)

Independent HEAD / formal / global / focal / visual / product / source / backlog
cursors stay separate.

## Consequences

- Generated tools may advance `recordedThrough` without claiming adjudication.
- Human and agent claims use `adjudicatedThrough` for consecutive written-clause
  progress.
- Migration keeps `closedThrough === recordedThrough` for older consumers.
- Claim ceiling: control-model design and migration only until DA31-008 re-gates.
