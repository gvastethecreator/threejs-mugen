# IKEMEN PlayerPush state size boxes report

## Outcome

PlayerPush Y admission now selects stand, crouch, air, or down size geometry from current state type instead of using one height-only rectangle.

## Evidence

- Parser tests preserve all four `stand.sizebox` edges.
- Runtime tests prove official defaults, legacy air width/height, crouch override, and reversed-edge normalization.
- Full tests: 180 files / 1886 tests passed.
- TypeScript 7 typecheck, build, and boundaries passed; existing large-chunk advisory remains.
- Trace QA: 563/563 artifacts, 532 required and 31 optional; no checksum drift.

## Global port state

PlayerPush root geometry now includes state-specific size Y admission and current Clsn2 contact. Remaining constraint work centers on Clsn overrides/proxies, SizePushOnly, width/height controller deltas, minimum-width behavior, helpers, ties/interpolation, and pause/reset ordering.
