# DA29-171 architecture note

Wave 17

## Decision surface
Automate upstream source-authority refresh and semantic review. Depends on DA29-016, DA29-090, and current dual pins.

## Acceptance
Tool verifies pinned objects, fetch policy, dirty/shallow cache state, changed source families, reviewer decisions, source digests, and selector update without silent pin drift.

## Constraints
Mutable cache can replace normative source. Allows reviewed source-epoch updates only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
