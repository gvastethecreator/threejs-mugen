# 54 - T469 M.U.G.E.N down.hittime / down.velocity interaction

Status: closed-bounded
Labels: mugen-runtime, hitdef, projectile, liedown
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T468 M.U.G.E.N air hit time / fall interaction

## Objective

Carry the official `down.hittime` contract through direct HitDef,
ModifyHitDef, Projectile, imported move data, and combat resolution for a
defender already in `StateType L`. A zero vertical `down.velocity` keeps the
defender in the lie-down slide route and selects `down.hittime`; a non-zero
vertical value transitions the hit into the air route and selects
`air.hittime`. Omitted `down.hittime` uses the 20-tick bounded default.

## Official contract

Elecbyte documents `down.hittime` as the slide duration for a lying defender
and says it is ignored when `down.velocity` has a non-zero Y component. The same
reference documents `down.velocity` as the lie-down velocity, defaulting to the
air velocity when omitted. Current Ikemen-GO initializes `down_hittime` to 20
and, in its lying-target branch, assigns `ghv.hittime`/`ghv.ctrltime` from that
field before applying `down_velocity`.

Sources:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html
- https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go

## Scope

The typed HitDef/ModifyHitDef/Projectile payloads, imported/runtime move and
projectile materialization, direct/projectile resolver selection, and focused
parser/resolver regressions. Existing direct/projectile contact ownership and
Common1 presentation remain unchanged. Exact lie-down animation tables,
custom-state ownership, bounce/recovery, and full `GetHitVar` lifetime parity
remain outside this bounded cut.

## Acceptance

- Direct HitDef and Projectile parse/compile `down.hittime` and
  `down.velocity`.
- ModifyHitDef can update both fields on an active normal HitDef.
- Lying hits with zero vertical down velocity select authored/default
  `down.hittime` and apply the bounded down vertical velocity.
- Lying hits with non-zero vertical down velocity ignore `down.hittime`, select
  `air.hittime`, and apply the launch velocity.
- Ground, airborne, guard, fall-precedence, and existing cornerpush paths stay
  unchanged.
- Focused compiler/HitDef/projectile/combat tests, down-hit trace subset, full
  suite, typecheck, build, boundaries, `qa:trace`, and diff hygiene pass.

## Final evidence (2026-08-01)

- `down.hittime` and `down.velocity` are compiled for HitDef, ModifyHitDef, and
  Projectile, materialized on imported/runtime moves and projectiles, and
  selected by `CombatResolver` for lying targets.
- Zero-Y lie-down hits select authored/default 20-tick down timing and the
  bounded down Y velocity; non-zero-Y launches select airborne timing and the
  launch velocity.
- Focused compiler/HitDef/projectile/combat coverage: 146 tests passed across
  4 files. Existing down-hit trace subset: 6 tests passed.
- Final closeout passes: 324 files / 3292 tests, `pnpm typecheck`, `pnpm build`,
  `pnpm check:boundaries`, `pnpm qa:trace` 682/682 artifacts, and
  `git diff --check`; UI smoke is N/A because no visible surface changed. No
  compatibility score moved.

## Claim ceiling

This task proves only the bounded timing/vertical-selection seam for the
existing two-actor runtime. It does not claim exact lie-down Common1 state
timing, bounce/recovery behavior, or broad M.U.G.E.N/Ikemen combat parity.
