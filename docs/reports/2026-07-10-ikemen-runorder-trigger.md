# IKEMEN root RunOrder trigger closeout

Date: 2026-07-10
Area: IKEMEN runtime profile / expression VM / scheduling traces

## Outcome

Explicit `ikemen-go` matches stamp one-based `RunOrder` indices for the two sorted roots before frame triggers. The expression VM returns that value and falls back to `-1` when no supported order exists. Non-IKEMEN profiles clear the diagnostic.

## Evidence

- Required artifact: `synthetic-imported-ikemen-runorder.json`.
- Trace checksum `04d433de`; final checksum `390fb921`.
- Final P2 evidence: `runOrder = 1`, state `282` through `RunOrder = 1`.
- Aggregate QA: 531/531 artifacts, 500 required and 31 optional.
- Focused RunOrder tests and TypeScript 7 typecheck pass.
- Full suite passes 158 files / 1562 tests; production build and architecture boundaries pass.
- Source decision: `docs/research/2026-07-10-ikemen-runorder-trigger.md`.

## Global area report

- IKEMEN runtime: root scheduler order is now observable inside bounded CNS expressions.
- Scanner: `RunOrder` no longer appears as unsupported when detected.
- Trace infrastructure: the artifact couples routed-state evidence to exact schedule-phase actor order.
- MUGEN/native: `unknown` and `mugen-1.1` clear the profile-specific value; aggregate traces remain green.
- Studio/renderer/assets: unchanged; no visual gate applies.
- Scores: unchanged.

## Claims

Allowed: explicit IKEMEN two-root matches expose one-based sorted root `RunOrder` before frame triggers.

Blocked: helpers/appended actors, teams/simul/tag, exact Pause/hitpause ordering, redirects beyond stamped roots, rollback, and full IKEMEN actor-list parity.
