# Choose next gap after live team state

Type: research
Status: open
Blocked by: None

## Question

What minimal inert P3/P4 root construction can enter `PlayableMatchRuntime` ownership and snapshots without joining input, scheduling, combat, round, effect-store, or presentation phases?

## Candidate Inputs

- `PlayableMatchRuntime` constructor/options, `RuntimeFighterStateWorld`, `RuntimeSnapshotWorld`, and public registry snapshot.
- Current `teamState` and `RuntimeTeamRoster/v0` contracts.
- IKEMEN root slot creation, initial standby state, and turns/simul limits.
- Stable P1/P2 trace checksums and lifecycle evidence.

## Answer

Pending inert-root ownership and construction audit.
