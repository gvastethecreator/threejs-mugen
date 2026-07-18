# Decide helper State -4/+1 keyctrl

Type: research
Status: resolved
Blocked by: None

Research: `docs/research/2026-07-18-helper-state-minus-four-plus-one.md`
Decision: `docs/adr/0010-helper-state-minus-four.md`
Closeout: `docs/reports/2026-07-18-helper-state-minus-four-closeout.md`

## Question

What is the smallest source-backed IKEMEN route for helper States -4 and +1,
including pause behavior, state ownership, and their placement around -3/-2/-1
and the current state?

## Answer

Split the boundary. State -4 is implemented as `HelperStateMinusFour/v0` in
`a8777cce`: IKEMEN helpers execute owner State -4 before the normal pause gate,
regardless of `keyctrl`; MUGEN and `unknown` profiles remain unchanged. The
route is helper-local and reuses the existing numeric StateDef representation.

State +1 is deferred to Ticket 244. The current parser rejects the literal
`+1` header and the numeric model cannot distinguish it from normal State 1.
Normalizing it would create an incorrect state lookup, so no implementation is
claimed until a special-state identity is represented end to end.

## Evidence

- Official IKEMEN wiki identifies -4 as Pause/SuperPause-safe and helper-open,
  and +1 as the post-current-state counterpart.
- `HelperSystem.test.ts` proves -4 execution with keyctrl off, profile gating,
  and Pause execution while the normal helper state remains frozen.
- `PlayableMatchRuntime.test.ts` proves the imported helper route in IKEMEN and
  the MUGEN boundary.
- Focal: `405/405`.
- `pnpm build`, `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `git diff --check`: passed.

## Claim ceiling

This decision does not claim State +1, root global-state scheduling, Common1
merge precedence, helper input-buffer parity, exact complete global order,
rollback/netplay, or full MUGEN/IKEMEN compatibility.
