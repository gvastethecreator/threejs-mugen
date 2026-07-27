# DA29-137 architecture note

Wave 13

## Decision surface
Define a renderer/resource port. Depends on DA29-071…075 and DA29-123.

## Acceptance
Port separates scene facts, camera, resources, lifecycle, metrics, and capture from MUGEN sprites/stages; Three.js adapter passes ownership tests.

## Constraints
Abstraction can hurt performance. Allows renderer port only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
