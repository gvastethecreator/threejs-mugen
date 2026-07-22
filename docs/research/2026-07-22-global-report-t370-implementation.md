# Runtime implementation report: T370

Date: 2026-07-22

Head: `6bbeb6f7`

## Status

T370 closes the bounded current first-generation Helper PosFreeze and
RedirectID contract. This report records a focused implementation result, not a
global quality checkpoint.

## Delivered

- Helpers now retain one-frame PosFreeze state through runtime snapshots and
  writeback.
- Static compiler operations retain `RedirectID`; dynamic and static caller
  values materialize typed bounds dispatch before verified resource leases.
- Local Helper motion restores captured X/Y/Z before the existing current stage
  constraints.
- Redirected root and already-advanced Helper targets restore match-frame
  positions. A Helper target that runs later keeps the incoming freeze through
  reset.
- The required imported Helper-to-root trace proves typed
  `bounds:posfreeze` telemetry and destination freeze state.

## Evidence

- Focused runtime suite: 4 files / 407 tests pass.
- Focused required trace gate: pass.
- Diff hygiene: pass before commit.

## Deferred checkpoint gates

The user-selected batch policy defers the TypeScript typecheck, complete
Vitest suite, trace aggregate, build, and boundary checks until several runtime
slices accumulate. No global green claim follows from this report.

## Global state

Compatibility scores remain 65 / 36 / 20 / 10-12 / 6-8 / 25. The change does
not alter Studio or Three.js renderer surfaces, so browser smoke is N/A.

## Claim ceiling

Allowed: bounded current first-generation Helper PosFreeze state and verified
RedirectID writeback under the current actor order.

Blocked: exact corner push, pause/hitpause, source scheduler parity, nested or
recursive Helper ownership, spawned-this-tick starts, renderer/upstream
differentials, rollback/netplay, score movement, and full MUGEN/IKEMEN parity.
