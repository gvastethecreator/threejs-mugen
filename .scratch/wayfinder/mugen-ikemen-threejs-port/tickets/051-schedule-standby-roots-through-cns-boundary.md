# Schedule standby roots through CNS boundary

Type: implementation
Status: open
Blocked by: None

## Question

How can explicit IKEMEN actor run order include P3-P8 and call `RuntimeRootCnsExecutionWorld` with standby participation while avoiding auto-guard, physics, animation, effects, combat, round, and presentation ownership?

## Acceptance

- P3-P8 receive deterministic RunOrder and controller-only schedule rows.
- P1/P2 and all 538 trace checksums remain stable.
- Side-effect attempts are blocked and observable.
- Input/combat/round/presentation/effect-store flags remain false for reserves.
