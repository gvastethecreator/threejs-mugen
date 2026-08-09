# Issue 104 — IKEMEN pause sampling and auxiliary resource ownership

Status: closed-bounded
Lane: I2 pause / resources
Priority: P1

## Current boundary

T529 now reduces global AssertSpecial from all live roots and Helpers for round,
snapshot, lifebar, and resource projections. The pause runtime still advances
root/Helper CNS through `RuntimePausedMatchWorld` without a versioned global
AssertSpecial sample, and `LifeShare`/`PowerShare` intentionally keep Helpers
local.

## Source decision

The repository's pinned research confirms that `TimerFreeze` applies to the
fight timer, while the post-KO clock advances independently; `NoKOSnd` is
sampled for KO-flow ownership, not as a pause-tick timer override. Therefore
the pause sample is diagnostic at this stage and must not mutate the paused
timer or post-KO clock. See `docs/research/2026-07-12-post-ko-nokoslow.md`,
`docs/research/2026-07-13-global-assertspecial-ownership.md`, and the pinned
IKEMEN pause-order research.

## Next bounded cut

Define `RuntimePauseGlobalAssertSpecial/v0` with explicit tick, pause kind,
actor ids, active global flags, and sampling phase. Consume it only for pause
timer/display and `NoKOSnd`/`NoKOSlow` decisions; do not change Helper resource
banks or team replacement in the same cut. Follow with a separate resource
ownership decision for Helper red-life/power.

## Implemented in this slice

- Added `RuntimePauseGlobalAssertSpecial/v0` as a stateless, versioned reducer.
- Added `RuntimeMatchRoundWorld.snapshotPauseGlobalAssertSpecial(...)` as the
  named integration seam for pause consumers.
- `PlayableMatchRuntime` now samples the reducer on every active pause tick and
  exposes the immutable diagnostic through `getPauseGlobalAssertSpecialSnapshot()`.
- Added `pauseGlobalAssertSpecialPolicy(...)`: `TimerFreeze` maps only to the
  fight timer, pause countdown remains independent, and KO/display decisions
  stay explicit fields.
- Team lifebar snapshot visibility now consumes pause display policy, and the
  per-tick sample is cleared before the next normal tick to prevent stale UI.
- Reset/stale rejection, root/reserve/Helper sampling, and unknown-flag tests
  are covered without changing active gameplay.

## Verification for this slice

- `RuntimePauseGlobalAssertSpecialSystem` + `RuntimeMatchRoundSystem` +
  `MugenRuntime`: 25/25.
- `pnpm qa:trace`: 684/684 artifacts (650 required, 34 optional).
- `pnpm typecheck`: pass.
- `git diff --check`: pass.

## Closure

The pause reducer and policy are complete for the bounded contract. Remaining
Helper resource ownership is explicitly split into Issue 105 and is not part of
this closure.

## Required evidence

- Source-pinned M.U.G.E.N/Ikemen pause sampling table.
- Focused pause reducer tests: root, reserve, Helper, reset, and stale-flag
  rejection.
- Required trace only if pause behavior changes; stable 684/684 trace baseline
  otherwise.
- No score or team replacement movement.
