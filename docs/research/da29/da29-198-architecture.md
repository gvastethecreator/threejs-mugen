# DA29-198 architecture note

Wave 19 · revision 119e627410a4

## Decision surface

Design hosted-preview deployment and rollback. Depends on DA29-146…148, DA29-188, and DA29-197.

## Acceptance

Architecture covers static hosting, headers/CSP, cache keys, asset limits, privacy, artifact promotion, smoke, rollback, status, and domain/secret authority; no deployment occurs.

## Constraints

Local readiness differs from production. Allows deployment plan only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
