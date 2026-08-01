# 52 - T467 M.U.G.E.N air hit time

Status: closed-bounded
Labels: mugen-runtime, common1, hitdef, projectile, combat
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T466 M.U.G.E.N air-guard control time

## Objective

Carry the official `air.hittime` parameter from HitDef, ModifyHitDef, and
Projectile source through compiler, imported-fighter/projectile runtime data,
and normal-hit resolution. Airborne defenders use the authored air duration; ground hits keep
`ground.hittime`; omitted air timing uses the official default of 20 ticks.

## Official contract

Elecbyte's M.U.G.E.N 1.1 controller reference defines `air.hittime` as the
time P2 remains in an airborne hit state before it can guard again, with a
default of 20 when omitted. `ground.hittime` remains a separate ground-hit
duration.

Sources:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html
- https://elecbyte.com/mugendocs-11b1/trigger.html

## Scope

HitDef and Projectile compiler fields, imported HitDef/projectile runtime
materialization, direct/projectile normal-hit resolver selection, and default
fallback coverage. Out of scope: exact airborne physics, landing/common-state
animation parity, hitpause cadence, dynamic expressions, and full
M.U.G.E.N/Ikemen parity.

## Acceptance

- `air.hittime` parses and compiles for HitDef, ModifyHitDef, and Projectile
  paths; ModifyHitDef mutates the active normal HitDef.
- Imported direct moves and runtime Projectiles carry the field with a 20-tick
  fallback when omitted.
- Airborne normal hits select `air.hittime`; ground normal hits select
  `ground.hittime`; guard timing remains on its existing guard fields.
- Focused tests, typecheck, trace, suite, build, boundaries, and diff hygiene
  pass without compatibility-score movement.

## Final evidence (2026-08-01)

- Compiler/runtime seams: `ControllerOps`, `HitDefSystem`, `importedFighter`,
  `ProjectileSystem`, `ProjectileCombatSystem`, and `CombatResolver` carry the
  field and preserve ground/air selection boundaries.
- Focused HitDef/projectile/combat/compiler suite: 5 files, 191 tests passed;
  `RuntimeTraceGatePresets` regression suite: 653 tests passed; full suite:
  324 files / 3290 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `git diff --check`,
  and `pnpm qa:trace` (682/682, unchanged checksums) passed.
- UI smoke is N/A: no visible surface changed.

Claim ceiling: this task does not claim complete Common1 airborne get-hit,
air-state selection, landing/physics parity, hitpause timing, dynamic
expression coverage, or broad M.U.G.E.N/Ikemen compatibility.
