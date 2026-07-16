# Characterize Redirected Target Dispatch

Type: task
Status: open
Blocked by: None

## Question

What must be recorded before accepting ADR 0006's redirected-target dispatch
lease or widening `TargetScoreAdd`?

## Scope

Instrument the existing target dispatcher and compatibility telemetry for four
successful routes:

- root active CNS -> root destination;
- root State -1 setup -> root destination;
- helper caller -> root destination;
- helper caller -> helper destination.

Record caller, destination, state owner, requested target id, selected targets,
operation class, and concrete mutation actor ids. Keep helper-destination
`TargetState` fail-closed.

## Evidence required

- dispatcher selection/mutation projection tests;
- compatibility session identity tests for the four routes;
- existing target/helper focused suites;
- TypeScript 7 and later batch QA;
- closeout report with explicit claim boundary.

## Current decision

Open. Implement the characterization boundary before the proposed
`RuntimeRedirectedTargetDispatch` lease. Do not widen `TargetScoreAdd` in this
ticket.

## Next

After the four-route evidence is green, review ADR 0006 and select the first
lease migration adapter.
