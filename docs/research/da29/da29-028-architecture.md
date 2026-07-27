# DA29-028 architecture note

Wave 2 · revision 119e627410a4

## Decision surface

Assign deterministic RNG streams. Depends on DA29-020 and DA29-027.

## Acceptance

ADR separates gameplay, AI, visual, audio, and asset randomness; reset/snapshot rules and seed derivation have tests.

## Constraints

Visual calls can perturb combat. Allows RNG ownership design only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
