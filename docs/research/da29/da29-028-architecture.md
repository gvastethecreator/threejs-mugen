# DA29-028 architecture note

Wave 2

## Decision surface
Assign deterministic RNG streams. Depends on DA29-020 and DA29-027.

## Acceptance
ADR separates gameplay, AI, visual, audio, and asset randomness; reset/snapshot rules and seed derivation have tests.

## Constraints
Visual calls can perturb combat. Allows RNG ownership design only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
