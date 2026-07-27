# DA29-034 architecture note

Wave 3

## Decision surface
Version the canonical controller capability registry. Depends on DA29-014, DA29-031, and DA29-033.

## Acceptance
Each controller maps official parameters to parser/compiler/runtime/trace owners and explicit claim ceiling; code/docs generation uses the same revision.

## Constraints
Registry rows can become checkbox claims. Allows capability mapping only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
