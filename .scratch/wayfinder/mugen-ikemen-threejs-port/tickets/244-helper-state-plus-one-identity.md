# Model IKEMEN helper State +1 identity

Type: research
Status: open
Blocked by: None

## Question

How should the parser, state-source resolver, compiler, availability layer, and
helper runtime represent IKEMEN State +1 without colliding with ordinary State
1 or changing existing state transitions?

## Acceptance

- Parse literal `[Statedef +1]` and `[State +1, ...]` distinctly.
- Preserve special-state identity through source resolution and compiled IR.
- Keep ordinary State 1 lookup and ChangeState behavior unchanged.
- Execute helper +1 only after the current state in `ikemen-go`, including the
  documented pause-safe behavior.
- Add focused parser/compiler/runtime proof and update the global-state claim
  ceiling before implementation.

## Claim ceiling

This ticket does not claim implementation, root +1 scheduling, Common1 merge
precedence, helper input-buffer parity, rollback/netplay, or full compatibility.
