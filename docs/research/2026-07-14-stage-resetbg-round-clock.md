# Research: Stage resetBG round clock

## Question

How should the Three.js stage runtime model the official MUGEN `StageInfo.resetBG`
switch without conflating stage animation time with fighter gameplay time?

## Primary sources

- [Elecbyte 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [Elecbyte stage/background tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html)
- [Elecbyte 1.1b1 state-controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)

The official stage material describes `resetBG = 1` as resetting stage
animations and background controllers between rounds. The same documentation
also treats background elements as ordered stage data and documents controller
timing, which makes a dedicated stage clock the smallest compatible boundary.

## Decision

Use two clocks:

- `tick`: global playable match time, preserved across the existing next-round
  reset transaction for runtime trace continuity.
- `backgroundTick`: stage presentation time. It follows `tick` when `resetBG`
  is disabled; when enabled it is `tick - stageRoundStartTick` and resets at a
  real numbered round boundary.

Turns continuation intentionally does not advance `stageRoundStartTick`: it is
an intra-round replacement flow. Full reset establishes both clocks at zero.
The renderer consumes `backgroundTick` for BGCtrl and embedded AIR action frame
selection, while existing callers without the field retain the old tick
fallback.

## Evidence and limits

Focused parser, projection, and Playable tests pass 218/218; TypeScript 7
typecheck passes. This is a lifecycle contract, not a claim of exact stage
render parity. Complete controller semantics, reset interactions with all
stage assets, zoom/window/mask behavior, motif/music, and browser proof remain
open for the legal stage/package route.
