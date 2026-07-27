# DA29-101 architecture note

Wave 10

## Decision surface
Version AssetProvenance with cryptographic content digests. Depends on DA29-008 and DA29-081.

## Acceptance
Schema covers inputs/outputs, SHA-256, canonical metadata, permission, license, creator/tool, timestamps, transforms, and subject revision; migration is explicit.

## Constraints
Weak digest may imply integrity. Allows provenance schema only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
