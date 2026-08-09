# Issue 103 — IKEMEN global AssertSpecial team-root ownership

Status: closed-bounded
Lane: I2 runtime / round ownership
Priority: P1

## Scope

Global AssertSpecial reduction must observe the complete live actor set in an
explicit IKEMEN team match, not only the active P1/P2 pair. Reserve roots and
live Helpers may assert `RoundNotOver`, `TimerFreeze`, `NoKOSlow`, or global
presentation flags; the round world consumes the reducer snapshot while
M.U.G.E.N and single-mode fallbacks retain the existing pair path.

## Implemented

- `RuntimeMatchRoundFinishOptions.globalActors` accepts roots and Helpers.
- `PlayableMatchRuntime` passes all live roots plus non-destroyed Helpers for
  team gameplay.
- Round finish now reduces global flags before KO/time-over adjudication.
- Match snapshots and team round/resource projections use the same live
  root-plus-Helper reducer input, preventing UI/resource drift from round state.
- A reserve-root `RoundNotOver` regression proves a KO candidate remains in
  `fight` without mutating score or playing state.

## Verification

- `pnpm exec vitest run src/tests/RuntimeMatchRoundSystem.test.ts src/tests/RuntimeSnapshotSystem.test.ts src/tests/MugenRuntime.test.ts`: 30/30.
- `pnpm typecheck`: pass.
- `pnpm qa:trace`: 684/684 artifacts (650 required, 34 optional) after the
  snapshot/resource consumer unification.

## Claim ceiling

This closes only live actor-set observation at round-finish ownership. Helper
global flags outside the round reducer, exact IKEMEN team/shared-resource
policy, pause layering, and full M.U.G.E.N/IKEMEN parity remain unsupported.
