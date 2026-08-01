# 58 - T473 M.U.G.E.N `fall.recover` / `fall.recovertime` defaults

Status: closed-bounded
Labels: mugen-runtime, hitdef, projectile, recovery
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T472 M.U.G.E.N `down.bounce` hit-fall contract

## Objective

Materialize the documented M.U.G.E.N fall-recovery defaults at the runtime
HitFall seam for direct HitDefs and projectiles. An enabled fall with omitted
`fall.recover` defaults to recoverable, and an enabled recoverable fall with
omitted `fall.recovertime` defaults to four ticks. Explicit values and
non-falling metadata remain unchanged.

## Official contract

Elecbyte documents `fall.recover` as defaulting to `1`, `fall.recovertime` as
defaulting to `4`, and `fall.recover = 0` as disabling recovery. The runtime
must apply those defaults only when `fall = 1` is active.

Source:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html

## Scope

- one shared runtime default resolver used by direct and projectile hit-fall
  materialization;
- explicit `recover = 0`, authored recovery times, and disabled-fall paths;
- focused resolver, direct-combat, and projectile-combat regressions.

Exact Common1 recovery-state choreography, `GetHitVar` recovery tables, and
ground-contact timing remain outside this bounded cut.

## Acceptance

- enabled direct and projectile falls with omitted recovery fields expose
  `recover: true` and `recoverTime: 4` in runtime HitFall metadata;
- explicit false/custom values and disabled falls are preserved;
- focused tests, full suite, typecheck, build, boundaries, `qa:trace`, and
  diff hygiene pass; UI smoke remains N/A because no visible surface changes;
- content evidence stays separate: all four stage packs retain three-layer
  parallax proof, while sprite promotion remains blocked by its own visual QA.

## Final evidence (2026-08-01)

- Focused resolver/direct/projectile regressions: 102 tests passed across
  `CombatResolver`, `DirectCombatSystem`, and `ProjectileCombatSystem`.
- Full suite: 324 files / 3296 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `pnpm qa:trace`
  (682/682 artifacts), and `git diff --check` passed.
- Content gates remain independent: `pnpm qa:content:stages` passes all four
  three-layer stages; `pnpm qa:content:spritesheets` audits all 8 v2 runs and
  remains red on animation/identity/visual-review blockers.
- UI smoke is N/A because this slice changes no visible surface.

## Claim ceiling

This task proves default metadata materialization at direct/projectile runtime
boundaries. It does not claim exact Common1 recovery-state animation,
recovery-window choreography, or full M.U.G.E.N/Ikemen fall parity.
