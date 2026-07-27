# DA29-118 architecture note

Wave 11

## Decision surface
Define screen-reader semantics for live combat and diagnostics. Depends on DA29-111 and DA29-117.

## Acceptance
ADR separates high-rate visual state from concise announcements, names pause/verbosity controls, and prototypes round/KO/error output without flooding.

## Constraints
Live regions can overwhelm users. Allows semantics design only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
