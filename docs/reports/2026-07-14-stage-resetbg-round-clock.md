# Report: Stage resetBG round clock

## Result

Entry 526 implements the official `StageInfo.resetBG` lifecycle boundary.
Imported stage metadata now carries `resetBackgroundBetweenRounds`; the
runtime publishes `StageSnapshot.backgroundTick`; and Three.js uses that clock
for BGCtrl projection and stage animation frame selection.

## Behavior

- `resetBG = 1`: background time resets when `startNextRound()` successfully
  opens the next numbered round.
- `resetBG = 0`: background time continues with the global match tick.
- Turns continuation: no reset, because the flow remains inside the current
  round.
- Full reset: background time returns to zero.

## Verification

- Focal Vitest: 3 files, 218 tests passed.
- TypeScript 7: `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- Broad suite/build/trace/browser verification: deferred to the next batch.

## Source and claim ceiling

The behavior is grounded in the [official Elecbyte 1.1b1 background
documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html) and the
[official stage tutorial](https://www.elecbyte.com/mugendocs/bg-tut.html).
The implementation does not claim complete MUGEN/IKEMEN stage parity; BGCtrl
coverage, exact animation timing, zoom/window/mask, motif/music, and full legal
stage-package evidence remain open.
