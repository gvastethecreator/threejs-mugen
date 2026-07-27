# DA29-181 architecture note

Wave 18 · revision 119e627410a4

## Decision surface

Version the saved-project schema and migrations. Depends on DA29-091, DA29-092, and DA29-109.

## Acceptance

Schema covers package refs, revisions, settings, analysis/evidence refs, asset graph, source handles, UI state, extensions, migration, export, and unknown-version refusal.

## Constraints

Project upgrades can lose author work. Allows schema contract only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
