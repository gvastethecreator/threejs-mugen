# Schedule standby roots through CNS boundary

Type: implementation
Status: resolved
Blocked by: None

## Question

How can explicit IKEMEN actor run order include P3-P8 and call `RuntimeRootCnsExecutionWorld` with standby participation while avoiding auto-guard, physics, animation, effects, combat, round, and presentation ownership?

## Acceptance

- P3-P8 receive deterministic RunOrder and controller-only schedule rows.
- P1/P2 and all 538 trace checksums remain stable.
- Side-effect attempts are blocked and observable.
- Input/combat/round/presentation/effect-store flags remain false for reserves.

## Answer

Explicit IKEMEN actor RunOrder now includes P3-P8 roots. `RuntimeMatchActorAdvanceWorld` receives explicit playable/standby participation, skips auto-guard for standby roots, and routes them to `advanceStandbyRootCns`. That path advances state time and executes the standby CNS capability profile only. Active and pause branches share it; input, physics, animation, lifecycle, target binding, stage clamp, combat, round, presentation, and effect stores remain P1/P2. Tick schedule records only `fighter:controllers` for reserve ids.
