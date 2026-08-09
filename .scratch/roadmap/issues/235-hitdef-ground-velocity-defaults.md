# Issue 235 — Fresh direct HitDef ground.velocity defaults

- Status: `active-research`
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
