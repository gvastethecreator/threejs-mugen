# ADR 0009: Bounded helper States -2/-3 keyctrl

Status: Accepted (bounded IKEMEN helper State -2/-3 route)

Date: 2026-07-18

Last reviewed: 2026-07-18 at HEAD `12f483ec`

Decision owners: runtime compatibility and IKEMEN bounded-runtime lanes

Related decision: [`docs/adr/0008-helper-state-minus-one-keyctrl.md`](0008-helper-state-minus-one-keyctrl.md)

Research: [`docs/research/2026-07-18-helper-negative-states-keyctrl.md`](../research/2026-07-18-helper-negative-states-keyctrl.md)

Closeout: [`docs/reports/2026-07-18-helper-negative-states-keyctrl-closeout.md`](../reports/2026-07-18-helper-negative-states-keyctrl-closeout.md)

## Context

ADR 0008 added owner CMD State -1 execution for helpers with `keyctrl`. The
official IKEMEN reference additionally permits helpers to access States -2/-3
through that flag, while the MUGEN baseline excludes them. The repository
already compiles negative `StateDef` records into `RuntimeProgramIr.states`,
but its lifecycle has separate actor-order and post-fighter helper paths.

## Decision

Accept `HelperNegativeStates/v0`:

1. Only `ikemen-go` helpers with `keyCtrl === true` enter the -3/-2 passes.
2. Reuse the owner's compiled `states` table and run State -3, then State -2.
3. Continue with the existing owner State -1 `stateEntries` pass, then the
   helper's current state.
4. Keep mutation and expression ownership helper-local, with the owner command
   callback available only through the established command boundary.
5. Carry `runtimeProfile` and owner command evaluation through both active
   actor-order and post-fighter lifecycle bridges.
6. Preserve the existing pause gate and fail-closed controller behavior.

## Alternatives rejected

### Run -2/-3 for every profile

Rejected because it would contradict MUGEN helper restrictions and silently
change the active MUGEN compatibility lane.

### Build a complete global-state VM

Deferred. The current request is representable with existing owner programs;
Common1 merge, root scheduling, helper input, and global ordering need their
own evidence and architecture.

### Add a helper-specific input buffer

Deferred. This slice uses only the established owner command callback and does
not invent a second input owner or tick source.

## Consequences

Positive:

- IKEMEN helpers can use the documented -3/-2 access boundary;
- the implementation is profile-gated and preserves MUGEN behavior;
- actor-order and post-fighter paths share the same profile/command context;
- state order is explicit and observable in focused runtime tests.

Negative:

- State -4/+1 remains separate;
- root negative-state scheduling, Common1/multi-file merge precedence, helper
  input buffers, exact complete global ordering, rollback/netplay, and full
  parity remain open;
- no compatibility score movement is claimed.

## Evidence

- Implementation: `12f483ec`.
- Focal: six runtime files, `405/405` tests passed.
- `pnpm build`: passed, including TypeScript 7 and Vite production build;
  the existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Claim boundary

Allowed:

- IKEMEN-profile helper -3/-2 execution when `keyctrl = 1`;
- order -3 -> -2 -> existing -1 -> current helper state;
- owner program lookup with helper-local controller mutation;
- existing pause and fail-closed behavior.

Blocked:

- MUGEN helper -2/-3 execution;
- root -2/-3 scheduling;
- Common1/multi-file merge precedence and helper input buffers;
- State -4/+1, rollback/netplay, and complete MUGEN/IKEMEN parity.
