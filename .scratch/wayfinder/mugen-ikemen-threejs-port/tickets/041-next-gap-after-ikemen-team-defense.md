# Choose next gap after IKEMEN SuperPause team defense

Type: research
Status: resolved
Blocked by: None

## Question

What minimal match-team topology can replace the pair-only roster so IKEMEN opposing-team semantics work for simul/tag roots and helpers without destabilizing current 1v1 scheduling, target selection, and presentation?

## Candidate Inputs

- Pinned IKEMEN GO team-side and character-list ownership.
- Current pair-only `RuntimeMatchActorRosterWorld` and root/helper RunOrder candidates.
- Target, EnemyNear, TeamSide, pause-defense, actor registry, and presentation consumers.
- Required migration traces that preserve current 1v1 checksums while adding one bounded multi-root team fixture.

## Answer

Model one stable complete-character topology before changing pair scheduling. Root slots follow IKEMEN's interleaved player-number parity (`P1/P3/P5/P7` side 1; `P2/P4/P6/P8` side 2), while helpers inherit side from `rootId`. Complete team enumeration remains distinct from active opponent selection, which later must account for disabled/standby state and nearest-root rules. `RuntimeTeamTopologyWorld` now drives CNS `TeamSide` and explicit-IKEMEN SuperPause opposing-character projection with 538/538 trace parity. Ticket 042 owns active/standby eligibility plus the first public multi-root roster diagnostic; scheduling/combat follow after that evidence.
