# DA29-197 architecture note

Wave 19

## Decision surface
Define semantic versioning, migration, and deprecation policy. Depends on DA29-181, DA29-192, and DA29-196.

## Acceptance
Policy separates project schema, evidence, source/profile, public API, plugin, asset, and runtime compatibility versions with support windows and migration gates.

## Constraints
One version cannot express all contracts. Allows policy only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
