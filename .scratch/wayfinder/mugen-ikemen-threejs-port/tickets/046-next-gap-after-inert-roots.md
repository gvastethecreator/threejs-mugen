# Choose next gap after inert roots

Type: research
Status: open
Blocked by: None

## Question

What explicit activation contract can move one reserve root out of standby and into an active-roots read model without yet entering input, scheduling, combat, round, effect-store, or presentation phases?

## Candidate Inputs

- `reserveRoots`, `teamState`, `RuntimeMatchActorRosterWorld`, and `MatchWorld.teamRoster`.
- IKEMEN `TagIn` / `TagOut`, standby flag transitions, root slot ownership, and partner selection.
- Stable P1/P2 schedule and trace checksums.
- Reset and lifecycle behavior for reserve roots.

## Answer

Pending activation-state and active-root projection audit.
