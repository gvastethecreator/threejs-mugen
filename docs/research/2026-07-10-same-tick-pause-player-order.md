# Same-tick Pause player order

Date: 2026-07-10
IKEMEN GO source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

What is the smallest source-backed scheduling change that removes the sandbox's P1-started same-tick Pause bias without allowing automatic guard-state entry during later paused ticks?

## Answer

Snapshot pause eligibility for both players before either active-state controller pass, then let both prepared player passes finish. A Pause or SuperPause started by P1 becomes effective for branch selection on the next tick; it must not cancel P2's already-prepared active pass on the current tick.

## Primary sources

- IKEMEN GO `Char.actionPrepare`, `Char.actionRun`, and `CharList.action`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L11766>, <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13150-L13175>
- Elecbyte Pause controller reference: <https://www.elecbyte.com/mugendocs/sctrls.html#pause>
- Elecbyte SuperPause controller reference: <https://www.elecbyte.com/mugendocs/sctrls.html#superpause>

## Findings

- IKEMEN computes each character's `pauseBool` in the all-character `actionPrepare` loop before entering the sequential `actionRun` loop.
- `actionRun` consults that prepared flag. A Pause created by an earlier character during the same `actionRun` loop does not retroactively change a later character's prepared flag.
- The sandbox instead checked global Pause immediately after P1 and skipped P2. That made active-state execution depend on fixed player slot rather than the prepared tick boundary.
- Existing paused-tick behavior remains separate: on the next tick the Pause/SuperPause branch runs, and current automatic guard checkpoints are absent from that branch.

## Decision impact

- Remove the mid-pair `isPaused` cutoff and obsolete `advancedP2` result from `RuntimeMatchFighterAdvanceWorld`.
- Preserve P1-then-P2 active execution and both pre/post automatic guard checkpoints.
- Prove P2 controllers and post guard checkpoint execute on the Pause-start tick, then prove P2 animation freezes on the next paused tick.

## Uncertainty and blocked claims

This matches the source-backed two-player preparation boundary. It does not prove dynamic `RunOrder`, simultaneous competing Pause/SuperPause ownership, helpers appended during the action loop, team/simul/tag scheduling, rollback timing, or full IKEMEN actor scheduling parity.
