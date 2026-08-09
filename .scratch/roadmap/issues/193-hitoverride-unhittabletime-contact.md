# Issue 193 — HitOverride unhittabletime contact

- Status: `closed-bounded`
- Lane: `R2 direct combat/runtime semantics`
- Priority: `P1`

## Objective

Apply the official non-negative HitDef `unhittabletime` pair after accepted
direct HitOverride contact. Cover root and Helper HitDef redirects plus root
ReversalDef redirects without changing rejection behavior.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` selects HitOverride inside
`hitResultCheck`, keeps the contact accepted, writes non-negative receiver
component one during get-hit preparation, and later writes attacker component
zero after contact bookkeeping. A miss-on-override result returns before those
writes.

Source symbols:

- `src/char.go`: `Char.hitResultCheck` HitOverride selection
- `src/char.go`: receiver `unhittabletime[1]` write
- `src/char.go`: `CharList.hitDetectionPlayer` attacker timer write

## Port ledger

| Item | Decision |
| --- | --- |
| Root HitDef HitOverride contact | write non-negative component zero to attacker and component one to receiver |
| Helper HitDef HitOverride contact | write the Helper's component zero and the receiver's component one |
| Root ReversalDef HitOverride contact | write component zero to the reverser and component one to the overridden attacker |
| Negative component | preserve that actor's current timer |
| Miss-on-override | reject before timer, target, pause, or state mutation |

## Acceptance fixture

- Prove root HitDef redirect writes both timer roles.
- Prove Helper HitDef redirect writes the Helper and receiver timers.
- Prove root ReversalDef redirect writes the reversed actor roles.
- Prove negative components preserve current timers.
- Prove miss-on-override remains mutation-free.
- Add one required imported trace that uses the written timer to reject a later contact.

## Claim ceiling

Do not claim Projectile HitOverride, Helper ReversalDef, ModifyPlayer, exact
pause tick order, rollback, random same-priority throw arbitration, or full
HitDef priority parity.

## Verification

- Focused compiler/runtime/trace coverage: `95/95` plus the isolated required
  trace.
- Full suite: `3471/3529`; the same 58 inherited character-package failures.
- Typecheck and production build pass; build contains 361 modules.
- Trace corpus: `693/693` (`659` required / `34` optional).
- Required trace: `synthetic-imported-hitoverride-unhittabletime`, checksum
  `49fcdc42`.
- Boundaries, redirect-boundary, and `git diff --check` pass.
