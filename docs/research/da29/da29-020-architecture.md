# DA29-020 architecture note

Wave 1

## Decision surface
Version the execution environment envelope. Depends on DA29-008 and DA29-009. Systems: tests, traces, browser and scanner outputs.

## Acceptance
Schema records seed, clock mode, locale, timezone, browser, GPU, Node, package lock, source pins, flags, and fixture digests; incompatible envelopes cannot merge.

## Constraints
Hidden environment drift. Allows comparable-run identity only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
