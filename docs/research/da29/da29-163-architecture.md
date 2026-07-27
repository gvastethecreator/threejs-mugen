# DA29-163 architecture note

Wave 16

## Decision surface
Define UI text, motif strings, and localization ownership. Depends on DA29-161, DA29-162, and DA29-116.

## Acceptance
ADR distinguishes authored motif text, engine copy, locale selection, fallback, encoding, bidi, truncation, accessible names, and evidence snapshots.

## Constraints
Localization can alter layout and authored meaning. Allows architecture only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
