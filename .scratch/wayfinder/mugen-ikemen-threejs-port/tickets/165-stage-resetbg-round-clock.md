# Stage resetBG round clock

## Status

Resolved as a bounded runtime cut in Entry 526.

## Source contract

The official MUGEN stage documentation defines `StageInfo.resetBG`: enabled
stages reset background animations and background controllers between rounds;
disabled stages continue them. Background elements and controllers remain a
separate stage clock from fighter gameplay state in this port.

Sources:

- [Elecbyte 1.1b1 background docs](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [Elecbyte stage tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html)
- [Elecbyte 1.1b1 state-controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)

## Implemented

- `StageInfo.resetBG` parses to `resetBackgroundBetweenRounds`.
- `PlayableMatchRuntime` retains global gameplay tick continuity and publishes
  a round-local `backgroundTick` when the switch is enabled.
- Real numbered `startNextRound()` resets the stage clock; Turns continuation
  does not because it stays inside the current round.
- Full reset starts the stage clock at zero.
- `AxisRenderer` consumes the stage clock for BGCtrl projection and embedded
  stage animation frame selection.

## Evidence

- `StageDefParser.test.ts`, `stageProjection.test.ts`, and
  `PlayableMatchRuntime.test.ts`: 218 tests pass.
- `pnpm exec tsc -p tsconfig.json --noEmit`: pass.
- Broad regression/build/trace/browser gates are intentionally deferred to the
  next batch, per the implementation cadence requested for this project.

## Claim ceiling

This does not claim exact MUGEN/IKEMEN stage parity. BGCtrl parameter breadth,
controller side effects, stage zoom/window/mask behavior, z ordering, motif,
music, and full stage package compatibility remain separate gates.
