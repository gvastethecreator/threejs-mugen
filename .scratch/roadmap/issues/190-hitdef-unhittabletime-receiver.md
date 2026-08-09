# Issue 190 — HitDef unhittabletime receiver window

- Status: `closed-bounded`
- Lane: `R2 direct combat/runtime semantics`
- Priority: `P1`

## Objective

Carry the official two-value HitDef `unhittabletime` field into direct combat
and enforce its receiver-side positive countdown before later HitDef or
ReversalDef admission.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles two integer values. HitDef
defaulting leaves ordinary values disabled, gives ReversalDef and throws
special defaults, writes component one to the receiver after accepted hit or
ReversalDef contact, and rejects all later attributes while the receiver timer
is positive.

Source symbols:

- `src/compiler_functions.go`: `hitDefSub` `unhittabletime`
- `src/bytecode.go`: `hitDef_unhittabletime`
- `src/char.go`: `HitDef.reset`, `HitDef.setDefaults`, `Char.attrCheck`
- `src/char.go`: accepted hit and ReversalDef contact writes

## Port ledger

| Item | Decision |
| --- | --- |
| Static root/helper HitDef pair | adapt as two bounded integers |
| Dynamic root/helper HitDef pair | resolve in caller context |
| Root RedirectID ModifyHitDef pair | replace selected live HitDef pair |
| Receiver component | write non-negative component one after accepted direct hit/ReversalDef |
| Countdown | decrement on normal actor ticks and reject while positive |

## Acceptance fixture

- Prove static and dynamic values reach the live HitDef.
- Prove an accepted direct hit writes the receiver timer.
- Prove an accepted ReversalDef writes the reversed attacker timer.
- Prove a positive timer rejects root and Helper direct HitDef before reversal.
- Prove zero, negative, omitted, and expired values remain unrestricted.

## Claim ceiling

Do not claim attacker-side throw arbitration, ModifyPlayer, Projectile breadth,
default throw/ReversalDef derivation, exact pause tick order, rollback, or full
HitDef priority parity.

## Verification

- Focused runtime/compiler coverage: `225/225`.
- Isolated RedirectID ModifyHitDef and required trace checks: pass.
- Full suite: `3463/3521`; the same 58 inherited character-package failures remain.
- Typecheck and production build pass; Vite transforms 361 modules.
- Runtime traces: `690/690` (`656` required, `34` optional).
- Required trace `synthetic-imported-hitdef-unhittabletime`: checksum `628ee772`.
- Boundary, redirect-boundary, and diff-hygiene checks pass.
