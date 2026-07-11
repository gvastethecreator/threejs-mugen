# IKEMEN static Tag partner checkpoint

## Outcome

Static non-negative Tag `partner` now selects and mutates a caller-relative cyclic same-side root without changing the caller.

## Evidence

- Pure selector proves side-interleaved order, caller-relative offsets, wrapping, helper exclusion, and invalid-input rejection.
- Imported partner-only TagIn activates P3 from P1 while P1 and opposite-side P4 remain unchanged.
- Missing same-side partner blocks mutation and successful telemetry.
- Dynamic, negative, and mixed unsupported parameters fail compilation.
- 168 test files / 1628 tests, TypeScript 7 typecheck/build, boundaries, diff check, and 538/538 traces pass.

## Blocked

Static/dynamic self combinations, dynamic partner, state/control/leader/member-order parameters, redirected callers, gameplay ownership, and full IKEMEN parity.
