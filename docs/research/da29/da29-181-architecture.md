# DA29-181 architecture note

Wave 18

## Decision surface
Version the saved-project schema and migrations. Depends on DA29-091, DA29-092, and DA29-109.

## Acceptance
Schema covers package refs, revisions, settings, analysis/evidence refs, asset graph, source handles, UI state, extensions, migration, export, and unknown-version refusal.

## Constraints
Project upgrades can lose author work. Allows schema contract only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.
