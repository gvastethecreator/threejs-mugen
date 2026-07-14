# Research - TeamRoundHandoff/v0

Date: 2026-07-13
Status: source-backed bounded implementation

## Question

What is the smallest executable transaction after the team-round decision
read model, without widening input, rendering, effects, resources, or the
pair-owned `RuntimeRoundSystem`?

## Primary evidence

- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  defines `TeamMode` as an explicit team context and includes `turns` as a
  distinct mode.
- [Elecbyte State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  requires `RoundNotOver` to be asserted every tick during a win pose, so a
  blocked round decision must not be latched into a handoff.
- [Pinned Ikemen-GO system source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go)
  computes effective team loss in `roundEndDecision`, then promotes the next
  Turns member in a later `activateNextTurnsFighters` step. Its
  `setBGTurnsSlotState` helper separates active and inactive slot state.

## Decision

`RuntimeTeamRoundHandoffWorld/v0` owns a narrow two-phase transaction:

1. Read the already-computed `RuntimeTeamRoundDecision/v0`.
2. Preflight every outgoing KO actor and every healthy, explicit
   `replacementEligible` standby candidate for both sides.
3. Commit `standby` and `overKo` changes for all sides only after every side
   passes preflight.
4. Emit an ordered phase trace: decision read, replacement decision,
   preflight, commit, and completion.

The public runtime boundary accepts `teamMode: "turns"` and exposes
`getTeamRoundDecision()` plus `applyTeamRoundHandoff()` through
`PlayableMatchRuntime` and `MatchWorld`. The transaction does not alter life,
player slots, state ownership, command buffers, effects, presentation, round
timer, HUD, or resources.

## Local evidence

- `src/mugen/runtime/RuntimeTeamRoundHandoffSystem.ts` implements the typed
  plan/apply boundary and atomic preflight.
- `src/tests/RuntimeTeamRoundHandoffSystem.test.ts` covers one-side,
  two-side, missing-current, `RoundNotOver`, side-defeat, stale replacement,
  malformed decision, and ordered phase behavior.
- `src/tests/RuntimeTeamRoundHandoffIntegration.test.ts` proves the public
  `PlayableMatchRuntime` and `MatchWorld` boundaries expose Turns facts without
  widening the pair snapshot.

## Claim boundary

Allowed: deterministic ordered team-state promotion for explicitly supplied
Turns actors and a validated decision, including atomic failure behavior.

Blocked: exact Ikemen slot swapping and reference remapping, life/resource
reset, round restart/continue flow, active P1/P2 gameplay ownership transfer,
lifebars, win poses, ZSS/Lua, rollback/netplay, and full MUGEN/IKEMEN parity.
