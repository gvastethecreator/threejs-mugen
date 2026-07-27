# DA29-091 architecture note

Wave 9

## Decision surface
Choose the authoritative Studio storage model. Depends on DA29-008, DA29-009, and the IDB audit.

## Acceptance
ADR compares IndexedDB authority, file authority, and port-backed hybrid; it names consistency, offline, recovery, quota, migration, and permission tradeoffs.

## Constraints
Dual authority can diverge. Allows storage decision only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
