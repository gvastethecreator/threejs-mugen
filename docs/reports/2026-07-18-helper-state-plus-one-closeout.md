# Helper State +1 Closeout

Date: 2026-07-18

Feature commit: `2a8dba68`

Type-contract follow-up: `0caa2a34`

Decision: [`docs/adr/0011-helper-state-plus-one.md`](../adr/0011-helper-state-plus-one.md)

Research: [`docs/research/2026-07-18-helper-state-plus-one-identity.md`](../research/2026-07-18-helper-state-plus-one-identity.md)

## Result

The port now preserves literal IKEMEN State +1 as a distinct special identity
instead of normalizing it to State 1. The parser, source resolver, compiler IR,
normal runtime lookup, and helper runner agree on that identity. IKEMEN helpers
run +1 after their current state, including Pause and without `keyctrl`.
MUGEN and `unknown` profiles skip the route.

## Evidence

- Focal suite: `345/345` tests passed across five files.
- Parser proof covers `[Statedef 1]` versus `[Statedef +1]`.
- Resolver proof keeps normal and special source selections separate.
- Compiler proof preserves the marker and excludes +1 from normal numeric
  routing.
- Helper and PlayableMatchRuntime proofs cover order, profile gating, Pause,
  and keyctrl-off behavior.
- TypeScript 7/build: passed.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Scope ceiling

This closeout does not claim root +1 scheduling, Common1 or multi-file merge
precedence, helper-specific input buffers, rollback/netplay, or full
MUGEN/IKEMEN parity.

## Next frontier

Select the next independent source-backed runtime or Studio contract. The
helper negative-state identity slice is closed at the bounded helper scope.
