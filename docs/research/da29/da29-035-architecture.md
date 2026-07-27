# DA29-035 architecture note

Wave 3 · revision 119e627410a4

## Decision surface

Version the canonical trigger capability registry. Depends on DA29-032 and DA29-033.

## Acceptance

Each trigger maps context, redirects, coercion, timing, evaluator owner, tests, traces, and unsupported branches.

## Constraints

Evaluator context may be incomplete. Allows capability mapping only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
