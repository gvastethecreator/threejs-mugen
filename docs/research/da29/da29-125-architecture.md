# DA29-125 architecture note

Wave 12

## Decision surface
Decide Worker/OffscreenCanvas boundaries. Depends on DA29-124 and DA29-071.

## Acceptance
ADR compares worker transfer/copy cost, abort, progress, deterministic errors, browser support, rendering needs, and fallback; prototype covers the highest-cost phase.

## Constraints
Thread split adds copy and ownership bugs. Allows architecture/prototype only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
