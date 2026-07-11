# Choose next gap after team eligibility

Type: research
Status: resolved
Blocked by: None

## Question

What minimal public multi-root registry can feed `RuntimeTeamTopologyWorld` and snapshots while preserving the current two-root scheduler, effect-store ownership, round logic, and trace checksums?

## Candidate Inputs

- `RuntimeMatchActorRosterWorld`, `PlayableMatchRuntime.matchRoster()`, `MatchWorld`, and runtime snapshots.
- `RuntimeTeamRoster/v0` diagnostic and P1-P4 synthetic topology fixture.
- IKEMEN root-slot creation, standby transitions, and character-list ownership.
- Stable two-root scheduling, combat, round, presentation, and trace requirements.

## Answer

Keep the scheduler-facing `RuntimeMatchActorRoster.actors` as the existing `[p1, p2]` tuple. Add a parallel `createCharacterRegistry(...)` expand path with stable order, unique-id enforcement, topology lookup, and `RuntimeTeamRoster/v0` diagnostics. `MatchWorldActorRegistrySnapshot.teamRoster` consumes that registry from all player/helper snapshot records, so synthetic P1-P4 snapshots prove the public route without entering scheduling, combat, round, presentation, or effect-store mutation.

Evidence: focused roster/MatchWorld tests, TypeScript 7 typecheck, and full gates recorded in the 2026-07-11 multi-root registry report.
