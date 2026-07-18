# ADR 0010: Bounded helper State -4

Status: Accepted (bounded IKEMEN helper State -4 route; +1 deferral superseded by ADR 0011)

Date: 2026-07-18

Last reviewed: 2026-07-18 at HEAD `0caa2a34`

Decision owners: runtime compatibility and IKEMEN bounded-runtime lanes

Related decision: [`docs/adr/0009-helper-negative-states-keyctrl.md`](0009-helper-negative-states-keyctrl.md)

Superseding follow-up: [`docs/adr/0011-helper-state-plus-one.md`](0011-helper-state-plus-one.md)

Research: [`docs/research/2026-07-18-helper-state-minus-four-plus-one.md`](../research/2026-07-18-helper-state-minus-four-plus-one.md)

Closeout: [`docs/reports/2026-07-18-helper-state-minus-four-closeout.md`](../reports/2026-07-18-helper-state-minus-four-closeout.md)

## Context

The official IKEMEN contract adds State -4 before the other global states. It
is not halted by Pause/SuperPause and helpers may use it without `keyctrl`.
The repository already represents numeric StateDef -4, while the literal +1
state is not representable without colliding with normal State 1.

## Decision

1. When `runtimeProfile === "ikemen-go"`, execute helper State -4 before the
   existing `canAdvanceRuntimeHelper` gate.
2. Do not require `keyctrl` for this pass.
3. Keep MUGEN and `unknown` profiles closed for State -4.
4. Reuse helper-local controller context and existing fail-closed dispatch.
5. The State +1 deferral in this ADR is superseded by ADR 0011; the State -4
   decision remains bounded to the route described above.

## Alternatives rejected

### Run State -4 inside the normal pause gate

Rejected because it contradicts the documented Pause/SuperPause behavior.

### Treat +1 as numeric State 1

Rejected because it would make source selection and state availability choose a
normal state when the author requested the post-current global state.

### Build a separate global VM

Deferred. The -4 helper pass is representable through the existing program and
dispatch surfaces; root scheduling and complete global order need separate
evidence.

## Consequences

Positive:

- IKEMEN helpers receive the documented -4 access boundary;
- Pause/SuperPause behavior is explicit and tested;
- MUGEN behavior remains profile-gated and unchanged.

Negative:

- State +1 was subsequently resolved by Ticket 244 / ADR 0011;
- root global-state scheduling, Common1/multi-file merge precedence, helper
  input buffers, exact complete order, rollback/netplay, and full parity remain
  outside the claim.

## Evidence

- Implementation: `a8777cce`.
- Focal: six runtime files, `405/405` tests passed.
- `pnpm build`: passed, including TypeScript 7 and Vite production build;
  existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Claim boundary

Allowed:

- IKEMEN helper State -4 execution with or without `keyctrl`;
- State -4 before the normal helper pause gate;
- helper-local mutation and existing dispatch/failure behavior.

Historical deferral superseded by ADR 0011:

- State +1 identity and post-current execution.

Still blocked:

- MUGEN/unknown State -4 execution;
- root global-state scheduling, Common1 merge, helper input buffers,
  rollback/netplay, and complete MUGEN/IKEMEN parity.
