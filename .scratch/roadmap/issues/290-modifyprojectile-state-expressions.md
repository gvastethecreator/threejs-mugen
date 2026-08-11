# Issue 290 — Dynamic `ModifyProjectile` state expressions

Status: **closed-bounded** (T716, 2026-08-11)

## Contract

Ikemen-only live `ModifyProjectile` now retains typed static or caller
expressions for `p1stateno`, `p2stateno`, and `p2getp1state`. Root execution
resolves each value once in the original caller context, applies the result to
the selected live Projectiles, and preserves the existing state-transition
ownership path. A `p2stateno` value defaults `p2getp1state` to true when that
flag is omitted; an explicit zero disables the owner-backed state lookup.
Helper-local caller resolution and ownership remain covered by focused runtime
tests where the existing Helper scope supports the controller.

Unresolved or non-finite expressions fail closed without mutating the selected
Projectile. Static values and omitted parameters preserve the prior bounded
behavior.

## Upstream basis

- Ikemen GO pin `149402f`: `compiler_functions.go:2558-2575` reuses the
  Projectile parameter block for ModifyProjectile; `bytecode.go:8984-8993`
  evaluates `p1stateno`, `p2stateno`, and `p2getp1state` once in the caller and
  broadcasts the resulting state metadata to selected Projectiles.
- `p2getp1state` defaults to true when `p2stateno` is authored, while an
  explicit zero keeps the defender-owned state lookup.
- M.U.G.E.N 1.1 documents the Projectile state parameters but has no separate
  `ModifyProjectile` controller. This compatibility slice is therefore
  Ikemen-only.

## Evidence

- Compiler, ProjectileSystem, Helper, and runtime trace focused tests pass.
- Required trace:
  `synthetic-imported-modifyprojectile-dynamic-state-golden`.
- Trace checksum `16fdce2c`, final checksum `8ed5f8c8`.
- `pnpm qa:trace`: `807/807` artifacts (`773` required, `34` optional).
- The trace proves VarSet → Projectile → ModifyProjectile, accepted unguarded
  contact, Projectile lifecycle, target link, attacker-owned state lookup,
  defender entry into state `889`, and final life `963`.

## Explicit exclusions

`p1facing` and `p1getp2facing` remain excluded because the pinned upstream
Projectile path rejects them. ReversalDef, guards, HitOverride, exact engine
tick ordering, multi-selection/broadcast parity, custom-state breadth beyond
the required owner route, teams, rollback, overflow/int32 details, and full
M.U.G.E.N/Ikemen Projectile parity remain open. Helper-owned custom-state
selection outside the bounded existing Helper scope is not claimed.
