# Wayfinder Ticket 158: Automatic Turns Continuation

## Status

Implementation complete as Entry 519 on 2026-07-14; final repository closeout
is pending the broad audit gate.

## Decision

Connect the verified IKEMEN Turns boundary in one ordered transaction:

```text
KO/post-round complete
  -> decision
  -> handoff preflight and commit
  -> resource reset
  -> active-root identity switch
  -> state 5900 preflight and entry
  -> continuation
```

The continuation keeps the current sequential round context. It is not a new
numbered round: a replacement enters after the current post-round flow, while
the next ordinary round remains owned by the existing `startNextRound()` path.

## Implementation

- Added `RuntimeTurnsContinuationWorld` with versioned plan/result data,
  deterministic phases, typed diagnostics, resource reset, and state-5900
  availability checks.
- Added active-pair identity to `PlayableMatchRuntime`; the playable pair is
  selected by stable root IDs after handoff instead of treating `p1`/`p2` as
  permanent aliases.
- Preserved fighter variables, frame/tick continuity, round context, and
  defeated life during the replacement reset. The active pair enters available
  state 5900 and then resumes the fight presentation path.
- Delayed automatic promotion until the KO/post-round boundary is actually
  over, preserving the observable KO slow/post-round window.
- Added fail-closed runtime behavior and coverage for missing incoming state
  5900.
- Upgraded the imported team handoff trace to exercise the automatic path.

## Evidence

- Focal continuation and blocked-route tests pass.
- TypeScript 7 typecheck passes.
- Required imported handoff trace passes with checksum `4ec7e0a3` and final
  checksum `21bc628b`.
- Aggregate trace corpus passes 600/600 artifacts: 566 required and 34
  optional.
- Broad gate passes 208 test files / 2107 tests, TypeScript 7, a 288-module
  build, boundaries, CSS budget, and core desktop/mobile Runtime plus Studio
  smoke under `.scratch/qa/qa-smoke-automatic-turns-continuation-core/`.
- The optional Code Fu Man browser `upper_x` path remains flaky; its five
  deterministic fixture tests pass and the issue is outside this Turns slice.

## Claim Ceiling

This is a bounded two-side Turns continuation with stable root identity and
state-5900 gating. It does not claim full roster/entrant breadth, official
`turnsRecoveryRate`, winpose/motif choreography, rollback/netplay, exact
state-5900 controller coverage, or full MUGEN/IKEMEN parity.
