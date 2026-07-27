# DA29-168 architecture note

Wave 16

## Decision surface
Define MUGEN 1.0, 1.1, and sandbox profile deltas. Depends on DA29-031, DA29-032, DA29-161, and DA29-167.

## Acceptance
Versioned profile matrix covers formats, expressions, controllers, localcoord, palettes, stage/FightScreen rules, diagnostics, and downgrade/fail rules.

## Constraints
A blended profile hides incompatibility. Allows profile contract only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
