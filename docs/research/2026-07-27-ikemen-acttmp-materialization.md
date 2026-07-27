# IKEMEN `acttmp` Materialization Research

## Question

Which part of IKEMEN's action phase can the local runtime carry before
connecting `stchtmp`, camera gates, and the full pause scheduler?

## Answer

The bounded slice is the source `actionPrepare`/`actionRun` arithmetic. The
runtime now stores the prepared value before fighter mutation and the finished
value after mutation. An unpaused action goes from `0` to `1`; hitpause applies
the `-1` adjustment; global pause starts at `-2` and keeps that value. When
both pause signals are present, the local `-3` result preserves the source
arithmetic instead of hiding one signal. The shared root fighter path and the
IKEMEN/legacy paused root bridge use the same system.

## Pinned source

- Repository: `ikemen-engine/Ikemen-GO`
- Commit: `4aa0ba38f851c52549ba182310e9e53361cd472a`
- [`acttmp` field and source comment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L3183-L3191)
- [`actionPrepare` pause seed](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10961-L10979)
- [`actionRun` finished adjustment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11400-L11412)
- [`acttmp > 0` camera movement gate](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11480-L11512)
- [`stchtmp` state-change lifecycle](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L6286-L6306)

## Findings

1. The source seeds `acttmp` to `-2` when `pauseBool` is active and to `0`
   otherwise.
2. At the end of `actionRun`, the source adds one only when neither pause nor
   hitpause is active and subtracts one when hitpause is active.
3. The source uses the positive result as a movement gate for camera tracking.
   The local slice materializes the value but does not claim that camera gate.
4. The source comment lists `-2` as the pause value. The local `-3` value is
   the direct arithmetic result when both booleans are true; it is recorded as
   an explicit local edge case, not as a new upstream enum member.

## Local implementation contract

- `RuntimeActTmpWorld.prepare` owns the source seed.
- `RuntimeActTmpWorld.finish` owns the source adjustment.
- `RuntimeFighterAdvanceWorld` calls the hooks before and after fighter
  mutation, then keeps the existing `hitTmp` synchronization order.
- `PlayableMatchRuntime` supplies the live pause query so a Pause controller
  created during the frame is visible to the finish step.
- The legacy and IKEMEN paused root bridges pass the same query.
- Helpers and the branch that bypasses normal fighter advance during global
  hitpause remain outside this slice.

## Implementation result

Commit `ce6e2b81` adds:

- `src/mugen/runtime/RuntimeActTmpSystem.ts`
- optional `actTmp` state on `CharacterRuntimeState`
- root fighter advance prepare/finish hooks
- live pause context in active and paused root paths
- focused arithmetic and ordering coverage

## Evidence

- Focused closure: 4 files / 328 tests passed.
- `node --check scripts/qa_traces.cjs` passed.
- `git diff --check` passed.
- `pnpm typecheck` reaches only the unrelated pre-existing unused
  `advanced` at `src/mugen/da32/ClauseAdjudicationSample.ts:149`.

## Claim ceiling

This evidence supports bounded `acttmp` materialization around the shared root
fighter advance and paused root bridges. It does not establish the full
hitpause branch, Helper action timing, `stchtmp`, camera movement gates,
state-change persistence, exact scheduler order, MUGEN parity, teams/clashes,
global checkpoints, score parity, or full MUGEN/IKEMEN compatibility.
