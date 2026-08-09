# Issue 154 — Ikemen Projectile HitDef sprite priority

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align Projectile HitDef `p1sprpriority` / legacy `sprpriority` and
`p2sprpriority` with the existing contact-time sprite-priority system. Match
Ikemen's ModifyProjectile behavior, which mutates only `p2sprpriority`.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` stores both values inside the
Projectile HitDef. Projectile contacts skip P1 priority replacement and apply
P2 priority to the defender. ModifyProjectile's switch leaves
`hitDef_p1sprpriority` commented out and replaces only
`hitDef_p2sprpriority`. Projectile `projsprpriority` remains separate.

## Acceptance fixture

- Compile static spawn values and static/dynamic P2 mutation values.
- Preserve Ikemen's ignored ModifyProjectile P1 priority behavior.
- Resolve bounded dynamic root/helper values.
- Keep Projectile `projsprpriority` presentation ordering separate from the
  legacy HitDef `sprpriority` alias.
- Prove later hit and guarded contacts consume the changed HitDef values.

## Claim ceiling

Do not claim every layer/order interaction, exact tick order, rollback/netplay
serialization, or complete ModifyProjectile parity.

## Closure evidence

- Static Projectile spawn and static/dynamic root/helper P2 mutation pass.
- Hit and guard contacts apply changed P2 priority without changing P1 or
  visual `projsprpriority`.
- Focused coverage passes 5 files / 267 tests plus 1 PlayableMatchRuntime
  case; typecheck, build, boundaries, redirect boundaries, diff hygiene, and
  686/686 traces pass.
- The full suite retains 13 failed files / 58 inherited failures with
  3389/3447 tests passing.
