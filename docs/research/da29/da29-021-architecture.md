# DA29-021 architecture note

Wave 2

## Decision surface
Define input authority across keyboard, gamepad, UI, demo, and replay. Depends on DA29-020. Systems: MatchInputPolicy and App.

## Acceptance
ADR defines seat ownership, focus, merge order, edge/hold semantics, disconnect, and deterministic sampling; conflict table has tests planned.

## Constraints
Double input or focus leaks. Allows architecture only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
