# Issue 106 — IKEMEN Helper TagOut control and leader rotation

Status: closed-bounded
Lane: I2 teams
Priority: P1

## Scope

Allow Helper-owned `TagOut` to carry authored caller-control and leader
rotation payloads through the existing Ikemen team topology, while keeping
replacement and rollback semantics separate.

## Implemented in this slice

- `callerControl` on Helper-owned TagOut updates the owning root control state.
- `leaderPlayerNo` and its expression variant use the existing validated team
  order/leader rotation world for TagOut as well as TagIn.
- After a successful self TagOut, active roots are recomputed deterministically
  by team side and player order before the next frame; if no valid pair exists,
  the previous active pair is preserved and a diagnostic is logged.
- Self TagOut now preflights the post-standby active pair before mutating the
  Helper/root state. A missing replacement blocks the operation transactionally.
- Root-owned TagOut now refreshes the same active-root projection, keeping
  normal CNS TagOut and Helper RedirectID TagOut on one handoff boundary.
- Root-owned TagOut now also preflights the post-standby pair before applying
  `rootStandbyTransitionWorld`, so missing replacements fail without mutation.
- Root- and Helper-owned TagIn now refresh the active-root projection after
  clearing standby, keeping both directions coherent without changing the
  underlying team handoff policy.
- `PlayableMatchRuntime.getActiveRootIds()` now exposes the post-handoff pair
  directly for QA and future resource/replacement reconciliation.
- `MatchWorld` and the browser diagnostics bridge now expose the same
  `activeRootIds` seam for runtime/browser gates.
- `pnpm qa:browser:fighter-lab` asserts the bridge starts with `[p1,p2]` and
  keeps the probe present across Timeline, Gallery, and Showcase views.
- The same gate now asserts `helperTeamResourceBindings` is present, so the
  deferred Helper resource contract is visible end-to-end even when no Helpers
  are spawned in the lab fixture.
- `PlayableMatchRuntime.applyTeamRoundHandoff()` now reconciles team life,
  power, and red-life banks immediately after a committed handoff, keeping the
  replacement owner aligned with the active-root transition.
- Invalid side, disabled leader, unavailable member, and unsupported profile
  routes remain fail-closed.

## Verification

- Focused TagIn/TagOut/Helper-owned tests: 47/47 (13 direct Playable TagOut
  cases remain green).
- `pnpm qa:trace`: 685/685 artifacts passed after active-root refresh.
- `pnpm typecheck`: pass.
- `git diff --check`: pass.

## Remaining

- Full replacement handoff and rollback semantics remain outside this bounded
  slice and must not be inferred from leader rotation alone.
