# 59 - T474 M.U.G.E.N `fall.yvelocity` localcoord defaults

Status: closed-bounded
Labels: mugen-runtime, hitdef, projectile, localcoord
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T473 M.U.G.E.N `fall.recover` / `fall.recovertime` defaults

## Objective

Materialize the documented default `fall.yvelocity` in the runtime HitFall
seam using the target character's local coordinate width. Omitted authored
fall velocity must resolve to the official 240p/480p/720p values while direct
and projectile paths keep explicit fall velocity and existing hit-velocity
fallbacks intact.

## Official contract

Elecbyte documents the omitted `fall.yvelocity` default as `-4.5` at 240p,
`-9` at 480p, and `-18` at 720p. The existing runtime already carries
`localCoord` through fighter and projectile definitions; this slice uses the
same width ratio (320px baseline) for other valid localcoord widths.

Source:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html

## Scope

- one shared localcoord-aware default helper;
- direct HitDef materialization uses defender localcoord;
- projectile materialization uses projectile localcoord;
- authored `fall.yvelocity`, authored hit velocity, and invalid/missing
  localcoord fallback remain unchanged;
- focused resolver/direct/projectile regressions plus normal runtime gates.

Exact Common1 landing physics, non-linear viewport scaling, and full
coordinate-translation parity remain outside this bounded cut.

## Acceptance

- omitted fall velocity resolves to `-4.5`, `-9`, and `-18` for 320, 640, and
  1280 localcoord widths;
- direct and projectile runtime tests prove 640px localcoord resolves `-9`;
- explicit fall y velocity and existing authored hit velocity take precedence;
- focused tests, full suite, typecheck, build, boundaries, `qa:trace`, and diff
  hygiene pass; UI smoke remains N/A because no visible surface changes;
- content evidence stays separate: stage parallax remains green, sprite
  promotion remains blocked by its own visual QA.

## Claim ceiling

This task proves bounded default `fall.yvelocity` materialization at direct and
projectile runtime boundaries. It does not claim exact Common1 recovery or
landing choreography, arbitrary viewport scaling, or full M.U.G.E.N/Ikemen fall
parity.

## Final evidence (2026-08-01)

- Focused resolver/direct/projectile regressions: 105 tests passed across
  `CombatResolver`, `DirectCombatSystem`, and `ProjectileCombatSystem`.
- Full suite: 324 files / 3299 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm qa:trace` (682/682 artifacts), and `git diff --check` passed.
- UI smoke is N/A because this slice changes no visible surface.
- Content gates remain independent: four stage packs retain three-layer
  parallax proof; sprite promotion remains blocked by animation, identity and
  visual-review findings from the spritesheet gate.
