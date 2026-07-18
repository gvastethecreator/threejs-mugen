# Ticket 258: Common1 NoFallCount

- Status: implementation in progress
- Date: 2026-07-18
- Scope: bounded IKEMEN `NoFallCount` opt-out for the existing Common1 ground-impact counter
- Depends on: `RuntimeHitFallControllerWorld`, typed `AssertSpecial`, and the
  existing `GetHitVar(fallcount)` read
- Research: [`docs/research/2026-07-18-common1-no-fall-count.md`](../../../docs/research/2026-07-18-common1-no-fall-count.md)
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`

## Question

How can the runtime honor IKEMEN `NoFallCount` without claiming the complete
Common1 fall-count, invulnerability, or state-entry scheduling model?

## Bounded contract

- Normalize `AssertSpecial, NoFallCount` into runtime state.
- When the existing `HitFallDamage` path reaches Common1 state `5100`, skip its
  bounded `fallCount` increment while the flag is active.
- Preserve the existing one-shot ground-impact marker and the default count
  path when the flag is absent.
- Keep `GetHitVar(fallcount)` and all existing synthetic routes compatible.

## Out of scope

Exact IKEMEN state-loop timing, the `acttmp` gate, repeated-fall invulnerability,
`NoFallDefenceUp`, `NoFallHitFlag`, fall-count reset policy, helper/custom-state
ownership, ZSS/Lua, rollback/netplay, and full MUGEN/IKEMEN parity.

## Acceptance evidence

- Focused controller and AssertSpecial tests cover count, suppression, and
  normalized flag state.
- Existing `GetHitVar(fallcount)` coverage remains green.
- Batched TypeScript 7, relevant tests, build, boundaries, trace, and diff
  hygiene are run before closeout.
- Browser smoke is N/A because this slice changes runtime semantics only.

## Claim ceiling

This ticket closes one IKEMEN opt-out at the current Common1 ground-impact
controller boundary. It does not close the complete fall-count or recovery
model.
