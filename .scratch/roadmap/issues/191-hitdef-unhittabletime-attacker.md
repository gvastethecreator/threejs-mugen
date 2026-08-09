# Issue 191 — HitDef unhittabletime attacker window

- Status: `closed-bounded`
- Lane: `R2 direct combat/runtime semantics`
- Priority: `P1`

## Objective

Apply the official attacker-side `unhittabletime[0]` value after accepted root
or Helper direct hit/guard contact and accepted root ReversalDef contact. Reuse
the receiver admission/countdown contract added by issue 190.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles two integer values and,
after a player-vs-player contact is accepted, copies non-negative component
zero into the attacking character's `unhittableTime`. This write follows hit,
guard, and ReversalDef contact bookkeeping.

Source symbols:

- `src/compiler_functions.go`: `hitDefSub` `unhittabletime`
- `src/char.go`: `HitDef.reset`, `HitDef.setDefaults`
- `src/char.go`: `CharList.hitDetectionPlayer` attacker timer write
- `src/char.go`: `Char.attrCheck` positive timer rejection

## Port ledger

| Item | Decision |
| --- | --- |
| Root direct HitDef hit/guard | write non-negative component zero after accepted contact |
| Helper direct HitDef hit/guard | write the helper's own timer |
| Root ReversalDef | write the ReversalDef owner's timer after accepted reversal |
| Negative or omitted component | preserve the current timer |
| Later admission | reuse issue 190 countdown and rejection |

## Acceptance fixture

- Prove accepted root hit and guard contacts write component zero.
- Prove accepted root ReversalDef writes component zero.
- Prove accepted Helper contact writes only the helper timer.
- Prove negative and omitted values preserve the current timer.
- Prove the written timer blocks a later incoming HitDef before mutation.

## Claim ceiling

Do not claim throw default derivation or random same-priority throw arbitration,
HitOverride redirects, Helper ReversalDef, ModifyPlayer, Projectile breadth,
exact pause tick order, rollback, or full HitDef priority parity.

## Verification

- Focused direct, reversal, combat-resolution, and Helper coverage: `141/141`.
- Isolated required attacker-window trace check: pass.
- Full suite: `3466/3524`; the same 58 inherited character-package failures remain.
- Typecheck and production build pass; Vite transforms 361 modules.
- Runtime traces: `691/691` (`657` required, `34` optional).
- Required trace `synthetic-imported-hitdef-attacker-unhittabletime`: checksum `7354557f`.
- Boundary, redirect-boundary, and diff-hygiene checks pass.
