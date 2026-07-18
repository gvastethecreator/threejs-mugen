# Helper TargetState Redirect Closeout

Date: 2026-07-16

Feature commit: `fd1b6133`

Decision: [`docs/adr/0007-helper-targetstate-redirect-ownership.md`](../adr/0007-helper-targetstate-redirect-ownership.md)

## Result

The helper-to-helper `TargetState` ownership slice is implemented and accepted
at bounded scope. A helper RedirectID now uses the destination helper's target
memory while entering a selected root fighter through the destination helper's
root state-program owner. Helper-selected targets stay fail-closed.

## Evidence

- Synthetic preset: `synthetic-imported-helper-target-state-helper-redirect-golden`.
- Focused runtime checkpoint: `926/926` tests passed.
- TypeScript 7 and production build: `pnpm build` passed.
- Repository and redirected-dispatch boundary checks passed.
- Regression found during the checkpoint: resource helper-to-helper telemetry
  had been attributed as helper-to-root. The implementation now distinguishes
  target-state owner attribution from resource destination routing, and the
  existing destination-helper test remains green.

## Scope ceiling

This closeout does not claim helper-owned state tables, helper target entry,
broader helper negative-state/global-state semantics, recursive RedirectID,
projectile/team ownership, exact multi-target ordering, rollback/netplay, or
full MUGEN/IKEMEN parity.

## Next frontier

Choose the next source-backed helper/runtime boundary only after preserving this
ownership contract and its fail-closed evidence. The current high-risk open
areas are IKEMEN helper State -4/+1 semantics, broader root negative-state
scheduling, and target-selection ordering.
