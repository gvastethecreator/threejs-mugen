# 57 - T472 M.U.G.E.N `down.bounce` hit-fall contract

Status: closed-bounded
Labels: mugen-runtime, hitdef, projectile, common1
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T469 M.U.G.E.N `down.hittime` / `down.velocity`

## Objective

Carry the explicit `down.bounce` HitDef flag through direct HitDef,
ModifyHitDef and Projectile payloads into the runtime hit-fall metadata. An
explicit `down.bounce = 0` must consume `HitFallVel` without applying the
one-shot bounce velocity; `1` keeps the existing velocity path. Omitted values
preserve the compatibility fallback used by the current Common1 fixture until
the exact engine default is independently adjudicated.

## Official contract

Elecbyte documents `down.bounce` as a boolean that makes P2 bounce once off
the ground using the authored fall velocities. It is ignored when the Y
component of `down.velocity` is zero and defaults to zero when omitted.

Sources:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html
- https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/master/src/char.go

## Scope

- typed compiler operations for HitDef, ModifyHitDef and Projectile;
- imported/runtime direct moves and projectiles;
- explicit false/true behavior at the `HitFallVel` seam;
- projectile fall metadata materialization for authored `fall.*` values;
- focused compiler, HitDef, projectile, direct-combat and HitFall regressions.

Exact Common1 state tables, default-value adjudication, ground-contact
transition timing, bounce count lifetime and full `GetHitVar` parity remain
outside this bounded cut.

## Acceptance

- `down.bounce = 0/1` compiles statically on HitDef and Projectile.
- ModifyHitDef accepts only static numeric booleans and mutates the active
  normal HitDef.
- Direct and projectile fall metadata retain the explicit flag.
- `HitFallVel` applies authored fall velocity for omitted/true and clears the
  bounce velocity for explicit false.
- Existing guard, down timing, air timing, juggle, contact ownership and
  Common1 fixtures remain green.
- Focused tests, full suite, typecheck, build, boundaries, `qa:trace` and
  diff hygiene pass. UI smoke remains N/A because no visible surface changes.

## Final evidence (2026-08-01)

- Focused compiler/HitDef/HitFall/direct/projectile regressions: 198 tests
  passed across 6 files.
- Full suite: 324 files / 3294 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and `git diff
  --check` passed; `pnpm qa:trace` passed 682/682 artifacts (648 required,
  34 optional).
- UI smoke is N/A because this slice changes no visible surface.

## Claim ceiling

This task proves the typed propagation and explicit velocity gate. It does not
claim exact M.U.G.E.N/Ikemen bounce-default adjudication, Common1 landing
animation parity, or broad combat compatibility.
