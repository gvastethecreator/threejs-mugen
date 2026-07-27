# DA29-009 architecture note

Wave 0

## Decision surface
Define the gate taxonomy. Depends on DA29-008. Systems: QA docs, reports, scorecard.

## Acceptance
Schema distinguishes unit, focused, trace, global, browser route, accessibility, performance, source review, release, and production gates plus valid inheritance rules.

## Constraints
Gate mixing. Allows taxonomy adoption only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
