# DA29-175 architecture note

Wave 17

## Decision surface
Define IKEMEN module packaging and capability permissions. Depends on DA29-172…174.

## Acceptance
ADR covers manifest, identity, version, dependencies, requested capabilities, signatures/digests, trust, updates, isolation, diagnostics, and uninstall cleanup.

## Constraints
Extension power expands attack surface. Allows package design only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
