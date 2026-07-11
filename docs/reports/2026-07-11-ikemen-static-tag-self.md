# IKEMEN static Tag self checkpoint

## Outcome

Exact static Tag `self = 0|1` now combines with optional static partner using IKEMEN omission defaults and one atomic standby transition.

## Evidence

- Compiler coverage proves parameterless self, partner-only default, explicit self-only, and self-plus-partner forms.
- Dynamic, negative, non-boolean, and unimplemented optional parameters fail closed.
- Imported fixtures prove combined activation, missing-partner rollback, successful self-zero no-op, and wrapped-target deduplication.
- Gates: 168 files / 1632 tests, TypeScript 7 typecheck/build, boundaries, diff check, and 538/538 traces (507 required, 31 optional).

## Blocked

Dynamic parameters, state/control/leader/member options, redirected callers, gameplay ownership, reserve telemetry projection, and full IKEMEN parity.
