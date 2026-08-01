# 60 - T475 M.U.G.E.N `air.fall` airborne-only selection

Status: closed-bounded
Labels: mugen-runtime, hitdef, projectile, fall
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T474 M.U.G.E.N `fall.yvelocity` localcoord defaults

## Objective

Preserve the distinction between the base `fall` flag and `air.fall` when a
HitDef or Projectile is resolved. An explicit `air.fall = 1` must start a fall
reaction only when the defender is airborne; the existing base `fall` flag must
continue to apply in every eligible state.

## Official contract

Elecbyte's HitDef reference defines `air.fall` as the airborne fall toggle and
states that its omitted value defaults to the `fall` value. The same reference
defines `fall` as the base fall toggle and documents the shared fall metadata.

Source:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html

## Scope

- preserve `air.fall` as typed compiler/runtime metadata instead of merging it
  into the base `fall` flag;
- apply the effective flag from defender `stateType = A` for direct and
  projectile contacts;
- keep fall timing, recovery defaults, velocity defaults, damage and authored
  metadata unchanged once the effective fall is selected;
- cover compiler, HitDef dispatch, resolver, direct combat, projectile parsing,
  projectile combat, and imported-fighter metadata paths.

Exact Common1 fall-state choreography, landing tables, `GetHitVar` lifetime,
dynamic-expression breadth, and full M.U.G.E.N/Ikemen parity remain outside this
bounded cut.

## Acceptance

- `fall = 0, air.fall = 1` is non-falling against a standing defender and
  falling against an airborne defender;
- an enabled base `fall` remains falling in both standing and airborne states;
- direct and projectile materialization preserve official recovery and
  localcoord-aware velocity defaults after airborne selection;
- compiler, HitDef, resolver, direct/projectile combat, and parser regressions
  pass with the repository's full runtime gates;
- content evidence stays separate: stage parallax remains green and spritesheet
  promotion remains blocked by its independent expert visual/identity gates.

## Claim ceiling

This task proves bounded airborne-only `air.fall` selection and metadata
materialization. It does not claim exact Common1 recovery or landing
choreography, dynamic parameter parity, or full M.U.G.E.N/Ikemen fall behavior.

## Final evidence (2026-08-01)

- Focused compiler/imported/resolver/HitDef/direct/projectile regressions: 244
  tests passed across seven test files.
- Full suite: 324 files / 3305 tests passed. `pnpm typecheck`, `pnpm build`,
  `pnpm check:boundaries`, `pnpm qa:trace` (682/682 artifacts), and
  `git diff --check` passed. UI smoke is N/A because no visible surface
  changed.
- Content gates remain independent: four stage packs retain three-layer
  parallax proof; sprite promotion remains blocked by animation, identity and
  visual-review findings from the spritesheet gate.
