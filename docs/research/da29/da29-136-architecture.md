# DA29-136 architecture note

Wave 13

## Decision surface
Define a storage port from proven Studio behavior. Depends on DA29-091…100 and DA29-133.

## Acceptance
Port covers transaction, revision, watch/conflict, permission, recovery, export, and errors; IDB/file adapters pass the same contract suite where applicable.

## Constraints
Lowest-common-denominator API. Allows port design and conformance only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
