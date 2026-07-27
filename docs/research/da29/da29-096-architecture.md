# DA29-096 architecture note

Wave 9

## Decision surface
Design multi-file project transactions. Depends on DA29-095.

## Acceptance
ADR defines write set, preimages, staging, commit marker, compensation order, partial external failures, concurrency, and user choice; prototype evidence measures cost.

## Constraints
File APIs lack cross-file atomicity. Allows architecture/prototype only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
