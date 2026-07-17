# Map bounded helper State -2/-3 keyctrl

Type: research
Status: open
Blocked by: None

Research: `docs/research/2026-07-16-helper-state-minus-one-keyctrl.md`

## Question

Can helper States -2/-3 be added as a bounded source-backed route after
State -1, while preserving owner command semantics and refusing to fabricate
helper-specific input, Common1 merge precedence, or complete global ordering?

## Acceptance

- Official MUGEN/IKEMEN sources identify exact helper access conditions for
  States -2/-3 and their processing relationship to State -1.
- Repository facts identify whether current runtime program/owner surfaces can
  represent the route without a new global VM.
- The answer chooses implement, defer, or block with explicit proof target and
  claim ceiling.

## Claim ceiling

This ticket decides a route only. It does not claim implementation, helper
input-buffer parity, Common1 merge parity, exact negative-state ordering,
rollback/netplay, or full MUGEN/IKEMEN compatibility.
