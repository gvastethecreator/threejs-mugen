# Wayfinder 137 - Required TeamRoundHandoff Trace/v0

Status: resolved bounded evidence cut

Dependency: Wayfinder 136 / `RuntimeTeamRoundHandoff/v0`.

## Answer

The aggregate runtime gate now executes a real lethal imported contact in an
explicit IKEMEN Turns `MatchWorld`, preserves the pre-handoff KO sample, then
applies the public typed handoff on the next trace step. Required frame
sequences and phase logs prove outgoing p2 and incoming p4 ordering.

## Evidence

- `src/mugen/runtime/RuntimeTraceGatePresets.ts`
- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/tests/RuntimeTraceGatePresets.test.ts`
- `scripts/qa_traces.cjs`
- `docs/research/2026-07-13-team-round-handoff-trace.md`
- `docs/reports/2026-07-13-team-round-handoff-trace.md`

Required artifact: `synthetic-imported-team-round-handoff`, checksum
`150f1d03`; aggregate `582/582`, `548` required, `34` optional.

## Claim allowed

Required aggregate evidence for lethal KO, ordered typed Turns handoff, and
active/reserve team-state transitions.

## Claim blocked

Automatic KO scheduling, slot/reference remapping, life/resource reset, round
continuation, P1/P2 ownership transfer, lifebars, win poses, rollback, netplay,
and full MUGEN/IKEMEN parity.
