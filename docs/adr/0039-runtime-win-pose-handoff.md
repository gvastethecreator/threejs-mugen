# ADR 0039: Runtime Win-Pose Handoff

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The MUGEN trigger contract observes `MatchOver` when players start win pose
state `180`, and the AIR standard reserves `170`, `175`, and `180` for lose,
draw, and win presentation. The sandbox already reaches a bounded phase `4`
but had no owner for this state request. State entry is also asset-dependent:
the existing runtime must not claim a Common1 state that is not available to
the actor.

## Decision

Introduce `RuntimeRoundWinPose/v0`:

- phase `4` maps winner/loser/draw roles to states `180/170/175`;
- only the active normal/tag pair is considered;
- `RuntimeStateEntryWorld` remains the availability and mutation boundary;
- each actor is attempted once per round and exposes `started` or `unavailable`;
- duplicate winner labels fail closed with a stable diagnostic;
- actor and round snapshots carry the handoff evidence;
- score projection/commit, Common1 controller execution, `RoundNotOver`, motif
  timing, Turns, and exact phase timing remain separate owners.

## Consequences

Available character assets can now reach their reserved win/lose state through
the same state-entry path as other runtime transitions. Missing assets produce
evidence instead of a fabricated state, and ambiguous display labels cannot
silently assign the winner role to multiple actors. Existing trace routes remain
stable because their phase-4 fixtures do not provide these optional actions.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundWinPoseSystem.ts`,
  `src/mugen/runtime/PlayableMatchRuntime.ts`, and `src/mugen/runtime/types.ts`.
- Tests: `src/tests/RuntimeRoundWinPoseSystem.test.ts` and
  `src/tests/PlayableMatchRuntime.test.ts`.
- Commits: `4d9d6f76`, `2bb4a476`.
- Focused verification: `2` files / `266` tests; `pnpm typecheck` passed.
- Full checkpoint: `233` files / `2453` tests; build, TypeScript 7,
  boundaries, redirect boundary, and `633/633` traces passed.
- Sources: [Elecbyte MatchOver trigger](https://www.elecbyte.com/mugendocs-11b1/trigger.html),
  [Elecbyte AIR reserved actions](https://www.elecbyte.com/mugendocs-11b1/air.html).

## Claim Ceiling

Allowed: bounded phase-4 reserved state handoff for available active normal/tag
actors. Blocked: exact state-180 timing, Common1/ZSS execution, persistent
`RoundNotOver`, time-over, motif/dialogue/fade timing, Turns/effective-loss,
Simul, rollback/netplay, and full MUGEN/IKEMEN round-end parity.
