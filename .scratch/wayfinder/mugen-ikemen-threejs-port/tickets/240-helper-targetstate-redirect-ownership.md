# Decide helper-destination TargetState ownership

Type: task
Status: resolved
Blocked by: 239-redirect-lease-migration

Implementation commit: `fd1b6133`

Decision: `docs/adr/0007-helper-targetstate-redirect-ownership.md`

Closeout: `docs/reports/2026-07-16-helper-targetstate-redirect-closeout.md`

## Question

Define the smallest source-backed contract that can enable helper-destination
`TargetState` without confusing the destination helper's target memory with
the state-program owner.

## Answer

Implement bounded support: execute against the destination helper's target
memory, use that helper's root fighter as state-program owner, enter selected
root fighter targets through the existing state-entry world, and keep
helper-selected targets fail-closed. This matches the current IKEMEN-GO
`stateOwner()`/`targetState` source contract and avoids fabricating helper
state-entry semantics.

Research: `docs/research/2026-07-16-helper-targetstate-redirect-ownership.md`.

## Acceptance

- resolver exposes destination helper root as `stateOwnerId` and no longer
  rejects helper-destination `TargetState` within the bounded route;
- helper controller passes explicit state-owner identity to the entry adapter;
- destination helper target memory selects root targets using existing target
  selection rules;
- selected root target enters the root-owned custom state;
- selected helper target, stale helper, missing target, and invalid state fail
  closed;
- telemetry retains helper destination and root state-owner identity;
- focused helper/playable/target tests, TypeScript 7, build, boundaries, and
  diff hygiene pass: `926/926` focal tests, `pnpm build`,
  `pnpm check:boundaries`, and `pnpm check:redirect-boundary`.

## Boundaries

No helper-target state clock/animation owner, helper State -1/global-state,
recursive RedirectID, rollback/netplay, or parity score movement.
