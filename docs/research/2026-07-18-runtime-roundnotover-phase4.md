# Research: Runtime phase-4 RoundNotOver hold

Date: 2026-07-18
Ticket: [T274](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/274-runtime-roundnotover-phase4.md)

## Question

Which runtime boundary must open phase `4` early enough for an imported win
pose to execute, and which boundary must keep the post-KO round alive while
`AssertSpecial RoundNotOver` is active?

## Primary sources

- [Elecbyte MatchOver trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html): `MatchOver` becomes true only after a player starts win pose state `180`.
- [Elecbyte AssertSpecial reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html): `roundnotover` must be asserted every tick while the win pose is active.
- [Elecbyte AIR reserved actions](https://www.elecbyte.com/mugendocs-11b1/air.html): actions `170`, `175`, and `180` are the lose, time-over draw, and win presentation slots.
- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683): phase `4` begins after the bounded `over_waittime` boundary, distinct from the pre-over phase.
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3330): win-pose readiness is evaluated before reserved state entry, and the round-end state advances only after its terminal window.

## Local findings

- Before T274, `RuntimeRoundSystem` entered phase `4` only when the complete
  bounded post-KO clock expired. `RuntimeMatchStepWorld` then stopped normal
  ticks because `round.isOver` was already true, so a reserved state `180`
  could not own a live `RoundNotOver` controller loop.
- `RuntimeRoundWinPose/v0` already owns the state-entry request and uses the
  existing availability boundary. The missing piece was temporal ownership,
  not another state-entry path.
- `RuntimeGlobalAssertSpecialWorld` already normalizes actor-local and global
  `roundnotover` into one snapshot. `RuntimeMatchRoundWorld` is therefore the
  smallest owner for holding the post-KO clock without coupling the round
  system to CNS parsing.

## Decision

1. Open runtime phase `4` at bounded post-KO frame `45`, while keeping
   `RuntimeRoundSystem.isOver === false` until the existing `255`-frame
   terminal window completes.
2. In phase `4`, when the round is KO and the global AssertSpecial projection
   reports `roundNotOver`, return a typed `{ frozen: false, held: true }`
   result and do not decrement the post-KO clock or stop playing.
3. When the flag disappears, resume the same post-KO clock. This preserves
   the current terminal owner and avoids inventing a release transition.
4. Verify the public `PlayableMatchRuntime` path with an imported state `180`
   whose CNS asserts `RoundNotOver` every active tick.

## Uncertainty and claim ceiling

The local `45`/`255` values are a bounded sandbox adaptation, not a claim of
exact `over_waittime`, `over_wintime`, readiness, Common1, ZSS, or motif timing.
Time-over state `175`, Turns/effective-loss, Simul, rollback, and full
MUGEN/IKEMEN round-system parity remain separate work.

## Verification

- Focused runtime/playable coverage: `4` files / `287` tests passed.
- `pnpm typecheck` passed.
- `git diff --check` passed before the implementation commit.

## Next action

Use the held phase-4 boundary as input for a later Common1/ZSS readiness slice.
Keep exact timing and match-score commit ownership separate.
