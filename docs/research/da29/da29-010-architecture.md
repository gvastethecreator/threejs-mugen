# DA29-010 architecture note

Wave 0

## Decision surface
Plan control-doc compaction and generated current views. Depends on DA29-006 and DA29-007. Systems: backlog, workplan, tracker, package milestones, supported features.

## Acceptance
Ownership map selects append-only ledgers versus generated current summaries, archive rules, stable anchors, and migration checks.

## Constraints
A rewrite could lose history. Allows an approved migration plan only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
