# ADR 0037: Runtime Round Phase

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The runtime exposed `RoundState` as the constant `2` even though the official
MUGEN trigger reference defines five values: pre-intro, intro, fight, pre-over,
and over. Existing runtime outcome state (`fight`, `ko`, `timeover`) and match
outcome state have separate owners and cannot be replaced with an arbitrary
integer without losing transition evidence.

## Decision

Add `RuntimeRoundPhase/v0` as a profile-labelled named-event state machine:

- `0 -> 1 -> 2` is available for future intro ownership;
- runtime startup remains at `2`;
- `round-finished` moves `2 -> 3`;
- bounded KO post-round completion moves `3 -> 4`;
- reset and next-round move any phase back to `2`;
- impossible transitions are rejected with stable diagnostics.

The round snapshot exposes `roundPhase` only outside the legacy fight phase so
normal snapshots and traces retain their existing shape. Actor runtime state is
synchronized at runtime boundaries, and `RoundState` reads that optional value
with fallback `2` for legacy or synthetic actors.

## Consequences

Round and actor evidence can now distinguish active fight from the bounded
close window without conflating score, state 5900, win poses, or MatchOver.
Time-over remains terminal at phase `3` in this slice because the existing
runtime has no time-over post-round animation window. No compatibility score
moves.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundPhaseSystem.ts`,
  `src/mugen/runtime/RuntimeRoundSystem.ts`,
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Tests: `src/tests/RuntimeRoundPhaseSystem.test.ts`,
  `src/tests/RuntimeRoundSystem.test.ts`,
  `src/tests/RuntimeExpressionContextSystem.test.ts`,
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `89403690`.
- Focused verification: `5` files / `295` tests; `pnpm typecheck` passed.

## Claim Ceiling

Allowed: typed local phase values and the current runtime's legal lifecycle.
Blocked: exact intro/motif timing, Common1/ZSS choreography, winpose execution,
MatchOver timing parity, Turns atomicity, rollback/netplay, and full
MUGEN/IKEMEN parity.
