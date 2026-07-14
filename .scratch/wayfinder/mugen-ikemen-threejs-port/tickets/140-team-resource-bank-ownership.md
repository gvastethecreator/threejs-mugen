# Wayfinder 140 - RuntimeTeamResourceBank/v0

Status: resolved bounded ownership boundary

Dependency: Wayfinder 139 / visible team lifebar projection.

## Answer

The runtime now resolves life and power ownership explicitly for IKEMEN
non-Single team snapshots. Non-shared resources remain actor-local; each
share switch independently maps its side to `team:1` or `team:2`. Tag active /
standby changes do not transfer ownership.

## Evidence

- `src/mugen/runtime/RuntimeTeamResourceBankSystem.ts`
- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/mugen/runtime/RuntimeSnapshotSystem.ts`
- `src/mugen/runtime/RuntimeTrace.ts`
- `src/mugen/runtime/RuntimeTraceArtifact.ts`
- `src/tests/RuntimeTeamResourceBankSystem.test.ts`
- `docs/research/2026-07-13-team-resource-bank.md`
- `docs/reports/2026-07-13-team-resource-bank.md`

## Claim allowed

Stable explicit resource-bank ids and `resourceOwnerId` bindings for the
bounded root-local and side-shared policy projections.

## Claim blocked

Shared mutation, damage/power routing, round reset, Pause/SuperPause,
target/helper redirects, red-life, guard/stun sharing, variable-map sharing,
rollback/netplay, and full IKEMEN resource parity.
