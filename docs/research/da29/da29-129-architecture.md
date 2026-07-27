# DA29-129 architecture note

Wave 12

## Decision surface
Set actor, Helper, projectile, effect, trace, and evidence caps. Depends on DA29-060, DA29-122, and DA29-126.

## Acceptance
Limits have source/product rationale, deterministic refusal/degradation, visible diagnostics, telemetry, reset behavior, and adversarial tests.

## Constraints
Caps can alter compatibility. Allows explicit sandbox policy only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
