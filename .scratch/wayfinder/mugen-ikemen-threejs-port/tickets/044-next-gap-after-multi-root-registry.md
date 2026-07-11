# Choose next gap after multi-root registry

Type: research
Status: open
Blocked by: None

## Question

How should live root `disabled`, `standby`, `overKo`, and player-type state enter `MugenSnapshot` and `MatchWorld.teamRoster` before the first multi-root scheduler cut?

## Candidate Inputs

- `CharacterRuntimeState`, `ActorSnapshot`, `RuntimeSnapshotWorld`, and `MatchWorldActorRecord`.
- IKEMEN `SCF_disabled`, `SCF_standby`, `SCF_over_ko`, tag/turns transitions, and root/helper player-type semantics.
- Current `RuntimeTeamRoster/v0` flags and P1-P4 synthetic public-registry fixture.
- Stable 1v1 snapshot/trace checksums.

## Answer

Pending state ownership and checksum audit.
