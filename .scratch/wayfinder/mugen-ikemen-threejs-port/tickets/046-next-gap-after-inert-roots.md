# Choose next gap after inert roots

Type: research
Status: resolved
Blocked by: None

## Question

What explicit activation contract can move one reserve root out of standby and into an active-roots read model without yet entering input, scheduling, combat, round, effect-store, or presentation phases?

## Candidate Inputs

- `reserveRoots`, `teamState`, `RuntimeMatchActorRosterWorld`, and `MatchWorld.teamRoster`.
- IKEMEN `TagIn` / `TagOut`, standby flag transitions, root slot ownership, and partner selection.
- Stable P1/P2 schedule and trace checksums.
- Reset and lifecycle behavior for reserve roots.

## Answer

`RuntimeRootParticipation/v0` is the prerequisite contract. It publishes stable ordered root rows with separate owned, disabled, standby, structurally-active, scheduled, input, combat, round, presentation, and effect-store axes. Current explicit-profile P1/P2 roots own every executable axis; P3-P8 remain owned standby roots with every executable axis false. Storage and behavior remain unchanged. Next ticket must define atomic plural standby mutation and active-root projection without scheduling.
