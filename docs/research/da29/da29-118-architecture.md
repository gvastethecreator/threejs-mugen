# DA29-118 architecture note

Wave 11 · revision 119e627410a4

## Decision surface

Define screen-reader semantics for live combat and diagnostics. Depends on DA29-111 and DA29-117.

## Acceptance

ADR separates high-rate visual state from concise announcements, names pause/verbosity controls, and prototypes round/KO/error output without flooding.

## Constraints

Live regions can overwhelm users. Allows semantics design only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
