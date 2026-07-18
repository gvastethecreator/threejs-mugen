# Ticket 259: Common1 repeated-fall recovery

- Status: implementation in progress
- Date: 2026-07-18
- Scope: bounded imported-root Common1 repeated-fall mechanics
- Depends on: `RuntimeRecoverySystem`, typed `AssertSpecial`, `RuntimeHitBySlot`,
  and the existing `GetHitVar(fallcount)` path
- Research: [`docs/research/2026-07-18-common1-repeated-fall-recovery.md`](../../../docs/research/2026-07-18-common1-repeated-fall-recovery.md)
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`

## Question

What is the smallest source-backed repeated-fall slice that can move the
counter to the Common1 state-entry boundary without claiming complete hit-fall
timing or all fall flags?

## Bounded contract

- On the first tick of imported-root Common1 state `5070` or `5100`, count one
  fall when `NoFallCount` is not active.
- Keep the mutation idempotent for a state entry and preserve the existing
  controller fallback for isolated `HitFallDamage` callers.
- On a second counted entry into state `5100`, halve a positive
  `down.recovertime` using the actor's configured `data.liedown.time` fallback.
- When the shortened timer is `<= 10`, install the existing typed `HitBy` slot 1
  as a `deny SCA` window for 180 runtime ticks, preserving slot 2.
- Clear per-entry bookkeeping when leaving the Common1 fall states so a later
  fall can be counted independently.

## Out of scope

The `acttmp` gate, exact MUGEN infinite-duration behavior, `NoFallHitFlag`,
generic hitflag `F` admission, fall-count lifetime/reset parity, helper or
custom-state ownership, ZSS/Lua, rollback/netplay, and full MUGEN/IKEMEN parity.

## Acceptance evidence

- Focused recovery, hit-fall, eligibility, AssertSpecial, and advance-order
  tests cover first/second fall timing, `NoFallCount`, timer shortening,
  invulnerability installation, slot preservation, and expiry.
- Existing isolated controller tests and `GetHitVar(fallcount)` traces remain
  compatible.
- Batched TypeScript 7, relevant tests, build, boundaries, trace, and diff
  hygiene are run before closeout.
- Browser smoke is N/A because this slice changes runtime semantics only.

## Claim ceiling

This ticket closes one imported-root IKEMEN-style repeated-fall boundary. It
does not close generic hitflag admission, the full Common1 state loop, or
MUGEN/IKEMEN parity.
