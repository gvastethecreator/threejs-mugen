# Wayfinder ticket 174: stage layer scaling

## Destination

Carry the official stage `scalestart`, `scaledelta`, and `zoomdelta` fields
through import, compatibility reporting, Studio inspection, and the Three.js
stage projection.

## Decision

Use one immutable resolver for normal, animated, asset, and placeholder layers.
Scale sprite dimensions around the SFF axis. Treat the Three.js camera as the
default `zoomdelta=1` owner and compensate only explicit authored zoom deltas.

## Evidence

- Stage/parser/report focal gate: 3 files / 21 tests.
- TypeScript 7 typecheck passes.
- Official Elecbyte and IKEMEN-GO stage references are recorded in
  `docs/research/2026-07-14-bg-layer-scaling.md`.

## Boundaries

Exact parallax deformation, legacy `xscale`/`yscalestart`, window/mask zoom,
camera-anchor/localcoord normalization, and full MUGEN/IKEMEN parity remain
separate.

## Next

Run the accumulated stage quality gate after another independent slice.
