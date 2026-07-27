# DA29-163 architecture note

Wave 16 · revision 119e627410a4

## Decision surface

Define UI text, motif strings, and localization ownership. Depends on DA29-161, DA29-162, and DA29-116.

## Acceptance

ADR distinguishes authored motif text, engine copy, locale selection, fallback, encoding, bidi, truncation, accessible names, and evidence snapshots.

## Constraints

Localization can alter layout and authored meaning. Allows architecture only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.
