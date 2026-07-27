# DA29-008 architecture note

Wave 0

## Decision surface
Define fingerprint and cryptographic digest vocabulary. Depends on DA29-001. Systems: evidence, Studio, assets, scanner, source manifests.

## Acceptance
ADR names SHA-256 content uses, stable behavior fingerprints, canonical bytes, version fields, and migration rules; misleading fields are inventoried.

## Constraints
Hash names may imply security. Allows terminology and migration design only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
