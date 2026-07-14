# Wayfinder ticket 176: legacy stage vertical scale

## Destination

Carry official legacy `yscalestart`/`yscaledelta` values through import,
reporting, Studio inspection, and bounded Three.js stage scale resolution.

## Decision

Use the documented reciprocal formula only when general `scalestart` or
`scaledelta` is absent. Clamp singular/non-positive results to zero and leave
full parallax geometry separate.

## Evidence

- Stage/parser/report focal gate: 3 files / 25 tests.
- TypeScript 7 typecheck passes.
- Official Elecbyte and IKEMEN-GO references are recorded in
  `docs/research/2026-07-14-stage-legacy-vertical-scale.md`.

## Boundaries

Exact `parallax`/`xscale` deformation, camera/window/mask behavior,
localcoord normalization, and full stage parity remain separate.

## Next

Run the accumulated stage quality gate after the next independent slice.
