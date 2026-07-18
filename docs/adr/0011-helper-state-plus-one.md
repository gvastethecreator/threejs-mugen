# ADR 0011: Bounded helper State +1

Status: Accepted (bounded IKEMEN helper route)

Date: 2026-07-18

Last reviewed: 2026-07-18 at HEAD `0caa2a34`

Decision owners: runtime compatibility and IKEMEN bounded-runtime lanes

Related decisions: [`docs/adr/0009-helper-negative-states-keyctrl.md`](0009-helper-negative-states-keyctrl.md), [`docs/adr/0010-helper-state-minus-four.md`](0010-helper-state-minus-four.md)

Research: [`docs/research/2026-07-18-helper-state-plus-one-identity.md`](../research/2026-07-18-helper-state-plus-one-identity.md)

Closeout: [`docs/reports/2026-07-18-helper-state-plus-one-closeout.md`](../reports/2026-07-18-helper-state-plus-one-closeout.md)

## Context

IKEMEN adds a helper State +1 pass after the current state. The literal `+1`
must remain distinct from ordinary numeric State 1. The prior numeric-only
model could parse neither identity without either dropping the state or making
normal State 1 lookup ambiguous.

The official behavior is documented in the [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info):
`+1` follows the current state, is not halted by Pause/SuperPause, and is
available to helpers without `keyctrl`.

## Decision

1. Represent `+1` as numeric `id = 1` plus `special = "plus-one"` in the
   shared MUGEN state model and compiled IR.
2. Parse literal `[Statedef +1]` and `[State +1, ...]` into that identity.
3. Resolve character/Common1 sources by the composite normal/special identity.
4. Keep ordinary state lookup and numeric ChangeState routing restricted to
   states without a special identity.
5. In `ikemen-go`, execute helper +1 after the normal current-state pass,
   outside the normal Pause gate and without requiring `keyctrl`.
6. Keep MUGEN and `unknown` profiles closed for the +1 pass.

## Alternatives rejected

### Normalize +1 to State 1

Rejected because it can select or override the wrong source and changes normal
State 1 availability.

### Ignore +1 until a root scheduler exists

Rejected for the bounded helper route because the existing helper program and
dispatch surfaces can prove the identity and ordering independently.

### Add a second runtime VM

Rejected because the special identity is a data-model boundary, not a new
controller execution language.

## Consequences

Positive:

- source precedence and runtime lookup preserve normal State 1;
- helper ordering and pause behavior are explicit and profile-gated;
- the parser/compiler contract can carry future special states without a
  numeric collision.

Negative:

- root +1 scheduling and multi-file Common1 merge parity remain separate;
- helper input buffers, rollback/netplay, and full parity remain outside scope.

## Evidence

- Implementation: `2a8dba68`; type-contract follow-up: `0caa2a34`.
- Focal: `345/345` tests across parser, resolver, compiler, helper, and
  PlayableMatchRuntime slices.
- TypeScript 7/build, repository boundary, redirect-boundary, and diff hygiene:
  passed after the follow-up.

## Claim boundary

Allowed:

- bounded `ikemen-go` helper State +1 identity, ordering, pause behavior, and
  `keyctrl` independence;
- normal State 1 lookup remaining separate from +1.

Blocked:

- root +1 scheduling, exact multi-file merge order, helper input buffers,
  rollback/netplay, and complete MUGEN/IKEMEN compatibility.
