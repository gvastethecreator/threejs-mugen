# DA29-141 architecture note

Wave 14

## Decision surface
Define the required-check matrix. Depends on DA29-009, DA29-011, DA29-018, and DA29-019.

## Acceptance
Change classes map to fast, full, trace, browser, accessibility, performance, security, source, and release gates with time budgets and owners.

## Constraints
Too many gates slow feedback; too few hide faults. Allows policy only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
