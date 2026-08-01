# 51 - T466 M.U.G.E.N air-guard control time

Status: closed-bounded
Labels: mugen-runtime, common1, guard, hitdef, projectile
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T465 M.U.G.E.N guard timing cadence

## Objective

Carry the official `airguard.ctrltime` parameter from HitDef/projectile source
through compiler, imported-fighter resolution, and combat runtime. Omitted
air-guard control time inherits resolved `guard.ctrltime`; an explicit value
overrides that fallback only for air guard contacts.

## Official contract

Elecbyte's M.U.G.E.N 1.1 controller reference defines `airguard.ctrltime` as
the air-guard control window and defaults it to `guard.ctrltime`. The trigger
reference exposes the authored guard timing values through `GetHitVar` for
Common1 state controllers.

Sources:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html
- https://elecbyte.com/mugendocs-11b1/trigger.html

## Scope

HitDef and Projectile compiler/parser fields, timing resolver fallback,
imported fighter/projectile runtime data, and CombatResolver air-versus-ground
guard selection. Out of scope: air-guard state selection, hitpause cadence,
new Common1 authoring, exact physics, and full M.U.G.E.N/Ikemen parity.

## Acceptance

- `airguard.ctrltime` parses and compiles for HitDef and ModifyHitDef.
- Resolved air timing defaults to `guard.ctrltime` when omitted and preserves
  an explicit finite override when authored.
- Direct and projectile air guards select the air override; ground guards keep
  the ground control value.
- Focused parser/resolver/combat tests, typecheck, trace, suite, build and
  boundaries pass without changing existing trace checksums or compatibility
  scores.

## Final evidence (2026-08-01)

- Compiler/runtime seams: `ControllerOps` (HitDef, ModifyHitDef and
  Projectile), `HitDefTiming`, `HitDefSystem`, `ProjectileSystem`,
  `CombatResolver`, and projectile combat mapping carry the field with the
  documented fallback/override rule; ModifyHitDef mutates the active move.
- Focused HitDef/projectile/combat/direct-combat suite: 5 files, 149 tests
  passed. Full suite: 324 files, 3289 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `git diff --check`,
  and `pnpm qa:trace` passed. Trace corpus remains 682/682 with unchanged
  checksums because this parameter is not part of the legacy trace snapshot.
- UI smoke is N/A: no visible surface changed.

Claim ceiling: this task does not claim complete Common1 air-guard behavior,
air-state selection, hitpause timing, generic VM scheduling, or broad
M.U.G.E.N/Ikemen compatibility.
