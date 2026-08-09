# Issue 110 — IKEMEN `RoundState` changed semantics

Status: closed-bounded
Lane: I1 round lifecycle
Priority: P1

## Objective

Compare the port's `RoundState` timing/read model with the current Ikemen
changed-trigger contract and close the bounded read seam with a deterministic
round-transition fixture.

## Source decision

The official Ikemen changed-trigger reference documents a changed `RoundState`
contract in which the Fight-screen value is no longer the legacy `2`. Pin the
exact source/commit and compare it with the current `RuntimeRoundContext` /
`RuntimeRoundPhase` read path before implementation.

Reference: [Ikemen changed triggers](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29).

The imported phase machine already matches the changed contract: phase `1`
is the control-locked Fight screen and phase `2` starts the main fight. The
legacy M.U.G.E.N trigger reference uses the same numeric lifecycle values.

## Implemented boundary

- `runtimeRoundStateFromPhase` is the named typed projection used by
  `ExpressionEvaluator`; an actor without a projection keeps the ordinary
  Fight value `2`.
- The phase and round-system tests compare `mugen-1.1` and `ikemen-go` across
  pre-intro `0`, control-locked intro `1`, Fight `2`, KO/pre-over `3`, over
  `4`, and the next-round reset.
- Round announcement choreography remains independent from this trigger read;
  no `IntroState`, `FightScreenState`, timer, pause, HUD, Tag, rollback/netplay,
  or full round-flow parity is claimed.

## Evidence

- Focused Vitest: 3 files / 65 tests passed.
- The existing runtime trace corpus is unchanged; no new trace artifact is
  promoted because this is a typed read projection and lifecycle regression.

## Claim ceiling

Do not infer complete round-flow, timer, pause, HUD, Tag, rollback/netplay, or
M.U.G.E.N/IKEMEN parity from the source note alone.
