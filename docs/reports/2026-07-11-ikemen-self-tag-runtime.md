# IKEMEN self TagIn/TagOut checkpoint

## Outcome

Parameterless self-only TagIn and TagOut now compile and execute as typed caller standby mutations under the explicit IKEMEN profile.

## Evidence

- Parser-backed compilation ignores only the structural `type` key and rejects every real optional parameter.
- P3 TagIn clears only P3 standby.
- P1 TagOut followed by P3 TagIn makes P4 resolve P3 through P2Name in the same tick.
- Legacy profile blocks mutation and does not record successful operation telemetry.
- Input, combat, round, presentation, resources, and effect stores remain unchanged.
- 167 test files / 1624 tests, TypeScript 7 typecheck/build, boundaries, diff check, and 538/538 traces pass.

## Blocked

Partner/helper targets, state/control/leader/member-order parameters, implicit tag-mode cardinality, gameplay participation, reserve compatibility-session projection, and full IKEMEN parity.
