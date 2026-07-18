# Map helper State -4/+1 keyctrl

Type: research
Status: open
Blocked by: None

## Question

What is the smallest source-backed IKEMEN route for helper States -4 and +1,
including their pause behavior, placement relative to -3/-2/-1/current state,
and the ownership of mutations and input context?

## Acceptance

- Official IKEMEN sources identify exact State -4/+1 helper access and pause
  behavior.
- Repository facts identify whether current helper programs can represent both
  states without a global VM or new scheduler abstraction.
- Decide implement, defer, or block with an explicit proof target and claim
  ceiling.

## Claim ceiling

This ticket decides a bounded route only. It does not claim implementation,
root global-state parity, Common1 merge precedence, helper input-buffer parity,
rollback/netplay, or complete MUGEN/IKEMEN compatibility.
