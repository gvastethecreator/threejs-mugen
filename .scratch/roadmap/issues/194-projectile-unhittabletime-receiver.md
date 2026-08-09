# Issue 194 — Projectile unhittabletime receiver

- Status: `closed-bounded`
- Lane: `R2 projectile combat/runtime semantics`
- Priority: `P1`

## Objective

Carry the static Projectile HitDef `unhittabletime` pair through root and
Helper spawn, admission, normal hit contact, and HitOverride contact without
arming the Projectile owner.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles Projectile HitDef
`unhittabletime` as two integers. Projectile collision calls
`Char.hitResultCheck`; accepted unguarded get-hit writes non-negative component
one to the receiver. The Projectile detection path has no corresponding owner
component-zero write.

Source symbols:

- `src/compiler_functions.go`: Projectile HitDef `unhittabletime` compilation
- `src/char.go`: `Char.hitResultCheck` receiver timer write
- `src/char.go`: Projectile contact detection and `hittableByChar` admission

## Port ledger

| Item | Decision |
| --- | --- |
| Static root/Helper Projectile spawn | retain normalized two-component pair |
| Positive receiver timer | reject before reversal, override, and contact mutation |
| Accepted unguarded hit | write non-negative component one to receiver |
| Accepted Projectile HitOverride | write non-negative component one to receiver |
| Guard contact or negative component one | preserve receiver timer |
| Component zero | retain metadata; do not arm Projectile owner |

## Acceptance fixture

- Prove static compilation and root/Helper spawn retain the pair.
- Prove a positive receiver timer rejects normal Projectile contact before
  damage, pause, targets, state, HitOverride, or Projectile Reversal mutation.
- Prove accepted unguarded normal and HitOverride contact write component one.
- Prove guard contact and a negative component preserve the live timer.
- Add one required imported trace that uses the written receiver timer to reject
  a later Projectile contact.

## Claim ceiling

Do not claim dynamic spawn expressions, ModifyProjectile mutation,
Projectile-owner component zero, throw-default derivation, exact decrement or
pause order, rollback, or full Projectile priority parity.

## Verification

- Focused compiler/runtime/trace coverage: `899/899`.
- Full suite: `3477/3535`; the same 58 inherited character-package failures.
- Typecheck and 361-module production build pass.
- Trace corpus: `694/694` (`660` required / `34` optional).
- Required trace: `synthetic-imported-projectile-unhittabletime`, checksum
  `1c83889e`.
- Boundaries, redirect-boundary, and `git diff --check` pass.
