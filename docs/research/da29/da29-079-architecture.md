# DA29-079 architecture note

Wave 7

## Decision surface
Define audio decode, cache, voice, and lifecycle policy. Depends on DA29-071 and DA29-083.

## Acceptance
ADR covers AudioContext creation/resume/close, buffers, voice stealing, pan/volume, pause, reset, errors, cache caps, and deterministic telemetry.

## Constraints
Browser gesture and leaks. Allows architecture only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
