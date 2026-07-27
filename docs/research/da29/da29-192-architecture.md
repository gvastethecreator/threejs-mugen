# DA29-192 architecture note

Wave 19

## Decision surface
Define versioned public APIs for proven engine ports. Depends on DA29-140 and DA29-191.

## Acceptance
API review covers types, lifecycle, errors, async/cancel, events, deterministic contracts, browser support, compatibility policy, examples, and excluded domain owners.

## Constraints
Public API freezes weak seams. Allows candidate API only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
