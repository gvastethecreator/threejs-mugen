# Issue 228 — Dynamic direct HitDef guard.hittime

- Status: `closed-bounded`
- Lane: `R1 direct contact timing`
- Priority: `P1`

## Objective

Resolve direct HitDef `guard.hittime` in root and Helper caller contexts,
apply the pinned profile-specific fresh default, preserve live ModifyHitDef
omission, and feed accepted guard stun plus `GetHitVar(hittime)`.

## Source gate

M.U.G.E.N 1.1 documents `guard.hittime` as one integer expression defaulting
to `ground.hittime`. Pinned Ikemen GO exposes a profile split: the legacy
profile derives it from `ground.slidetime`, while the Ikemen profile derives it
from `ground.hittime`. Explicit values evaluate in caller context.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1584-1588`
- pinned Ikemen `compiler_functions.go:2017-2023`
- pinned Ikemen `bytecode.go:7735-7738`, `8332-8351`
- pinned Ikemen `char.go:685-735`, `831-888`, `10973-10987`

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Prove fresh omission with different ground hit/slide values for `mugen-1.1`,
  `ikemen-go`, and the bounded unknown-profile fallback.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove root or redirected ModifyHitDef replacement and omission preservation
  without rederiving already-finalized slide/control values.
- Feed accepted guard stun and receiver `GetHitVar(hittime)`.
- Add one required imported guard trace for `guard.hittime = var(0)` with
  `var(0)=14`, target 77, and a Common1 readback branch.

## Claim ceiling

Do not claim binary M.U.G.E.N differential proof, exact countdown or tick
phase, dynamic `guard.slidetime`/`guard.ctrltime`, air-guard timing, Projectile
or ModifyProjectile, teams, rollback, or full guard timing parity.

## Closeout evidence

- Compiler, HitDef, and direct-contact coverage passes 219/219.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-guard-hittime.json` passes
  with checksum `2c62eba3`: `var(0)=14` reaches a real guard, target 77, and
  the Common1 `GetHitVar(hittime)=14` branch.
- Aggregate trace QA passes 726/726, including 692 required artifacts.
- Full suite passes 3610/3668. The remaining 58 failures are inherited
  deleted/stale legacy-roster expectations outside this cut.
