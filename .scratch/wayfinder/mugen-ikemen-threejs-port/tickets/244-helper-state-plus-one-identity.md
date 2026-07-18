# Model IKEMEN helper State +1 identity

Type: implementation
Status: resolved
Blocked by: None

Resolved by: `2a8dba68` plus type-contract follow-up `0caa2a34` / ADR 0011

Research: [`docs/research/2026-07-18-helper-state-plus-one-identity.md`](../../../../docs/research/2026-07-18-helper-state-plus-one-identity.md)

Closeout: [`docs/reports/2026-07-18-helper-state-plus-one-closeout.md`](../../../../docs/reports/2026-07-18-helper-state-plus-one-closeout.md)

## Question

How should the parser, state-source resolver, compiler, availability layer, and
helper runtime represent IKEMEN State +1 without colliding with ordinary State
1 or changing existing state transitions?

## Acceptance and result

- PASS: literal `[Statedef +1]` and `[State +1, ...]` are parsed with
  `id = 1` and `special = "plus-one"`.
- PASS: source resolution uses a composite normal/special identity and the IR
  preserves the special marker.
- PASS: ordinary State 1 lookup and numeric ChangeState routing ignore the
  special state.
- PASS: `ikemen-go` helpers execute +1 after the current state, outside the
  normal Pause gate and without `keyctrl`; MUGEN/unknown profiles skip it.
- PASS: parser, resolver, compiler, helper, and PlayableMatchRuntime proofs
  cover the collision and ordering boundary.

## Evidence

- Focal checkpoint: `345/345` tests across five files.
- Feature commit: `2a8dba68`.
- Type-contract follow-up: `0caa2a34`.
- TypeScript 7 build, repository boundaries, redirected-dispatch guard, and
  diff hygiene: passed after the follow-up.

## Claim ceiling

This ticket does not claim root +1 scheduling, Common1 merge precedence,
helper input-buffer parity, rollback/netplay, or full MUGEN/IKEMEN compatibility.
