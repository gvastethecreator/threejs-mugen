# Wayfinder 136 - TeamRoundHandoff/v0

Status: resolved bounded transaction cut

Dependency: Wayfinder 135 / `RuntimeTeamRoundDecision/v0`.

## Answer

`RuntimeTeamRoundHandoffWorld/v0` now consumes the team decision read model and
commits explicit Turns `standby/overKo` promotion only after every outgoing
KO actor and incoming healthy standby candidate passes preflight. Both sides
are ordered and atomic.

## Evidence

- `src/mugen/runtime/RuntimeTeamRoundHandoffSystem.ts`
- `src/mugen/runtime/RuntimeMatchRoundSystem.ts`
- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/mugen/runtime/MatchWorld.ts`
- `src/tests/RuntimeTeamRoundHandoffSystem.test.ts`
- `src/tests/RuntimeTeamRoundHandoffIntegration.test.ts`
- `docs/research/2026-07-13-team-round-handoff.md`
- `docs/adr/0005-runtime-team-round-handoff.md`

## Claim allowed

Deterministic ordered team-state promotion for explicitly supplied Turns
actors, with two-side atomicity and stale-preflight rejection.

## Claim blocked

Automatic round scheduling, Ikemen slot/ref remapping, life/resource reset,
active P1/P2 ownership transfer, lifebars, win poses, ZSS/Lua, rollback,
netplay, and full MUGEN/IKEMEN parity.
