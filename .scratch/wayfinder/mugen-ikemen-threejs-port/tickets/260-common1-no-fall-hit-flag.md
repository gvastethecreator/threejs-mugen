# Ticket 260: Common1 NoFallHitFlag admission

- Status: resolved bounded
- Date: 2026-07-18
- Scope: bounded direct HitDef admission against an already falling target
- Depends on: typed `AssertSpecial`, `DemoMove.hitFlag`, root hit admission,
  direct combat resolution, and helper direct combat
- Research: [`docs/research/2026-07-18-common1-no-fall-hit-flag.md`](../../../../docs/research/2026-07-18-common1-no-fall-hit-flag.md)
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`
- Planning commit: `4637d4e9`
- Implementation: `71f0d265`
- ADR: [`0027-common1-no-fall-hit-flag`](../../../../docs/adr/0027-common1-no-fall-hit-flag.md)
- Closeout: [`2026-07-18-common1-no-fall-hit-flag-closeout`](../../../../docs/reports/2026-07-18-common1-no-fall-hit-flag-closeout.md)

## Question

What is the smallest source-backed `NoFallHitFlag` slice that can prevent an
ordinary direct HitDef from re-hitting a falling target without silently
changing omitted-hitflag compatibility or claiming complete projectile and
Common1 parity?

## Bounded contract

- Normalize `AssertSpecial, NoFallHitFlag` into the typed runtime flag state.
- For an explicit authored direct HitDef `hitflag`, treat a target as falling
  only when its runtime move type is `H` and its hit-fall metadata says
  `falling = true`.
- Reject that direct hit when the explicit hitflag has no `F` token, or when the
  attacker has asserted `NoFallHitFlag`, and expose a typed admission/skip
  reason where the owning path already exposes one.
- Apply the same predicate to root admission, ordinary direct resolution, and
  helper direct resolution so the three direct paths do not disagree.
- Preserve the existing behavior for an omitted `hitflag`; default hitflag
  inference is a separate compatibility tranche.

## Out of scope

Projectile hitflag admission, reversal admission, exact `hittmp`/`acttmp`
semantics, hitflag grammar beyond the explicit comma-delimited `F` token,
Common1 state-loop timing, helper ownership parity, ZSS/Lua, rollback/netplay,
and full MUGEN/IKEMEN parity remain open.

## Acceptance evidence

- Focused AssertSpecial, root-admission, direct-combat, and helper-combat tests
  cover opt-out, explicit `F`, non-falling targets, omitted hitflags, and
  rejection reasons without mutation.
- Focused coverage passes `5` files / `83` tests; the full suite passes `230`
  files / `2411` tests.
- The accumulated TypeScript 7, build, boundary, trace, and diff-hygiene gates
  pass, with unrelated baseline findings reported separately.
- Browser smoke is N/A unless the implementation changes renderer, Studio, or
  other visible behavior.

## Claim ceiling

This ticket closes one bounded direct HitDef fall-admission rule. It does not
close generic hitflag defaults, projectiles, exact Common1 fall-loop parity, or
full MUGEN/IKEMEN compatibility.
