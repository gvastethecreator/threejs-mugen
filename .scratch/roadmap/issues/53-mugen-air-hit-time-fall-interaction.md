# 53 - T468 M.U.G.E.N air hit time / fall interaction

Status: closed-bounded
Labels: mugen-runtime, common1, hitdef, combat
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T467 M.U.G.E.N air hit time

## Objective

Keep `fall=1` authoritative over the airborne normal-hit timing choice. An
airborne defender receiving a falling `HitDef` must not use `air.hittime` as
the effective normal-hit stun; the existing ground timing remains the
bounded fallback while the move's fall metadata continues through the direct
runtime path.

## Official contract

Elecbyte documents that `air.hittime` has no effect when `fall` is set to 1.
The same HitDef reference defines `fall` as the route into the fall state,
including the airborne `air.fall` default. T468 applies that precedence to the
resolver's effective stun selection without claiming exact Common1 fall-state
or `GetHitVar(hittime)` lifetime parity.

Sources:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html
- https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go

## Scope

The typed combat attack contract, direct normal-hit resolver, and focused
resolver regression. Projectile attacks keep their existing no-fall path;
fall metadata, ground/air velocity, Common1 state selection, hitpause cadence,
and exact M.U.G.E.N/Ikemen `GetHitVar(hittime)` lifetime remain outside this
bounded cut.

## Acceptance

- Airborne normal hits without `fall` continue selecting authored/default
  `air.hittime`.
- Airborne normal hits with `fall.enabled = true` select the existing bounded
  ground `hitStun` fallback instead of `air.hittime`.
- Ground hits and guard contacts remain unchanged.
- Focused resolver tests, the fall-related trace subset, full suite,
  typecheck, build, boundaries, `qa:trace`, and diff hygiene pass.

## Final evidence (2026-08-01)

- `RuntimeCombatAttack.fall.enabled` is carried structurally from `DemoMove`
  into `CombatResolver`; airborne falling hits bypass `air.hittime` while
  direct `runtime.hitFall` metadata remains owned by `DirectCombatSystem`.
- `src/tests/CombatResolver.test.ts`: 27 tests passed, including airborne
  no-fall, default, ground, and fall-precedence cases.
- Fall trace subset: 2 targeted `RuntimeTraceGatePresets` tests passed.
- Full closeout passes: 324 files / 3291 tests, `pnpm typecheck`, `pnpm build`,
  `pnpm check:boundaries`, `pnpm qa:trace` 682/682 artifacts, and
  `git diff --check`; UI smoke is N/A because no visible surface changed. No
  compatibility score moved.

Claim ceiling: this task proves only the bounded resolver precedence. It does
not claim exact fall-state `HitOver` timing, Common1 animation/landing,
projectile/helper inheritance, or full M.U.G.E.N/Ikemen combat parity.
