# Issue 235 — Fresh direct HitDef ground.velocity defaults

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Reset a fresh direct HitDef with omitted `ground.velocity` to `0,0` in root
and Helper paths. Do not inherit the previous move velocity. Keep live
ModifyHitDef omission unchanged.

## Source gate

M.U.G.E.N 1.1 defines both omitted components as zero. Pinned Ikemen GO resets
the fresh HitDef ground vector before controller evaluation and later copies
the effective vector into grounded contact metadata.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1604-1608`
- pinned Ikemen `char.go` fresh HitDef ground velocity reset
- pinned Ikemen grounded accepted-contact path in `char.go`

## Acceptance fixture

- Start with adversarial live velocity and omit `ground.velocity` from a fresh
  root HitDef. Expect X/Y/Z zero.
- Prove the same reset in a Helper caller.
- Keep a live ModifyHitDef omission unchanged.
- Feed accepted grounded contact and expose zero through `GetHitVar(xvel)` and
  `GetHitVar(yvel)`.
- Add one required imported trace with omitted authored velocity and target 77.

## Claim ceiling

Do not claim legacy `n`, exact localcoord or facing transforms, launch timing,
friction, corner push, non-CNS native move defaults, Projectile or
ModifyProjectile, teams, rollback, or full velocity parity.

## Evidence

- Fresh root and Helper HitDef activation resets X/Y/Z and stored ground
  velocity metadata to zero when `ground.velocity` is absent.
- Live `ModifyHitDef` omission preserves the current vector.
- Accepted grounded contact exposes zero through `GetHitVar(xvel)` and
  `GetHitVar(yvel)`.
- Focused root/Helper/direct coverage passes; the full suite passes 3693/3693.
- Required trace `synthetic-imported-hitdef-omitted-ground-velocity` passes
  with checksum `15babb9c` and final checksum `350fd87e`.
- Aggregate traces pass 733/733 with 699 required; typecheck and the 363-module
  production build pass.
