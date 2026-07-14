# Wayfinder 138 - TeamRoundLifebar/v0

Status: resolved bounded read model

Dependency: Wayfinder 137 / required team-round handoff trace.

## Answer

The runtime now publishes a renderer-independent team lifebar diagnostic for
IKEMEN non-Single modes. It keeps stable per-side slots, leader/member roles,
plural active roots, per-actor life/max-life ratios, explicit standby/KO/
disabled state, and `NoBarDisplay` visibility separate from resources and
pair-owned round mutation.

## Evidence

- `src/mugen/runtime/RuntimeTeamRoundLifebarSystem.ts`
- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/mugen/runtime/RuntimeSnapshotSystem.ts`
- `src/mugen/runtime/RuntimeTrace.ts`
- `src/mugen/runtime/RuntimeTraceArtifact.ts`
- `src/app/DebugPanel.ts`
- `src/tests/RuntimeTeamRoundLifebarSystem.test.ts`
- `docs/research/2026-07-13-team-round-lifebar.md`
- `docs/reports/2026-07-13-team-round-lifebar.md`

## Claim allowed

Stable team slot ordering and bounded life presentation data for current
IKEMEN Tag/Turns/Simul snapshots, including explicit bar visibility policy.

## Claim blocked

Motif/AIR lifebar rendering, red-life interpolation, power/stun/shared
resources, automatic Turns continuation, exact Tag switching, KO/win timers,
rollback/netplay, and full MUGEN/IKEMEN parity.
