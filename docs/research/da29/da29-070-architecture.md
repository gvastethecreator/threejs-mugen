# DA29-070 architecture note

Wave 6

## Decision surface
Define the netplay and rollback claim fence. Depends on DA29-030 and DA29-061.

## Acceptance
ADR lists deterministic blockers, transport/auth out of scope, snapshot cadence, desync facts, spectator/reconnect questions, and gates before any network work.

## Constraints
Premature netplay promise. Allows architecture boundary only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
