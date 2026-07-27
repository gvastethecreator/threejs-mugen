# DA29-106 architecture note

Wave 10

## Decision surface
Define generated audio provenance and safety. Depends on DA29-101 and DA29-079.

## Acceptance
Schema and policy cover source/permission, model/tool/version, prompt, seed, duration, sample rate, loudness, peak, trims, transforms, and output digest.

## Constraints
Audio source rights and unsafe peaks. Allows policy only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
