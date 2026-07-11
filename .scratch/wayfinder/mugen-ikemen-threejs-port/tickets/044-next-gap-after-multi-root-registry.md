# Choose next gap after multi-root registry

Type: research
Status: resolved
Blocked by: None

## Question

How should live root `disabled`, `standby`, `overKo`, and player-type state enter `MugenSnapshot` and `MatchWorld.teamRoster` before the first multi-root scheduler cut?

## Candidate Inputs

- `CharacterRuntimeState`, `ActorSnapshot`, `RuntimeSnapshotWorld`, and `MatchWorldActorRecord`.
- IKEMEN `SCF_disabled`, `SCF_standby`, `SCF_over_ko`, tag/turns transitions, and root/helper player-type semantics.
- Current `RuntimeTeamRoster/v0` flags and P1-P4 synthetic public-registry fixture.
- Stable 1v1 snapshot/trace checksums.

## Answer

Add optional `CharacterRuntimeState.teamState` as the snapshot-owned contract for `disabled`, `standby`, `overKo`, and `playerType`. Runtime roots initialize active/player-type; Helpers own an explicit state with active/non-player defaults until Helper `type = player` compiles. `RuntimeSnapshotWorld` and helper snapshots clone this state, `MatchWorldActorRecord` normalizes legacy snapshots, and `teamRoster` consumes it. This makes live state observable without changing the pair scheduler or behavior checksum projection.

Evidence: focused Helper/MatchWorld/roster tests, TypeScript 7 typecheck, and full gates recorded in the 2026-07-11 team-state report.
