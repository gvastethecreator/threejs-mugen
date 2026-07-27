# DA29-010 architecture note

Wave 0 · revision 119e627410a4

## Decision surface

Plan control-doc compaction and generated current views. Depends on DA29-006 and DA29-007. Systems: backlog, workplan, tracker, package milestones, supported features.

## Acceptance

Ownership map selects append-only ledgers versus generated current summaries, archive rules, stable anchors, and migration checks.

## Constraints

A rewrite could lose history. Allows an approved migration plan only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
