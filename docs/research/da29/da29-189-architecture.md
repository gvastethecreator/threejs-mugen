# DA29-189 architecture note

Wave 18 · revision 119e627410a4

## Decision surface

Define install/offline cache and update recovery. Depends on DA29-123, DA29-181, and DA29-188.

## Acceptance

ADR/prototype covers service worker scope, immutable app assets, user projects, storage estimates, update prompt, old-version rollback, offline import/play limits, and cache purge.

## Constraints

Stale app code can open new project data. Allows offline architecture/prototype only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
