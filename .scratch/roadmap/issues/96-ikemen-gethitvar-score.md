# Issue 96 — Ikemen-GO `GetHitVar(score)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 95 / T521
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation defines
`GetHitVar(score)` as the last HitDef `score` value. The current `develop`
compiler maps the trigger to `OC_ex_gethitvar_score`, bytecode reads
`ghv.score`, and the character hit path retains the authored value in last-hit
metadata as a float.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add typed last-hit score metadata without conflating it with round/match score
  systems.
- Parse authored `score` for direct HitDef and Projectile sources, preserving
  floating-point readback and a missing/default `0`.
- Carry the authored value through direct and Projectile contacts and expose it
  through `GetHitVar(score)`.
- Leave score adjudication/movement, current match-score resources, dynamic
  ownership, and full M.U.G.E.N/Ikemen parity outside this bounded slice.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage, including
  explicit values and missing/default `0` behavior.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers numeric `GetHitVar(score)` readback for direct HitDef and
Projectile hit/guard contacts in the bounded runtime path. The typed
`runtimeHitVar` value and controller-expression path preserve authored floats;
the legacy `RuntimeExpressionContextWorld.evaluateNumber` test helper retains
its existing integer normalization. It does not claim score adjudication or
movement, current match-score readback, cumulative reset semantics, or full
M.U.G.E.N/Ikemen parity.

## Closeout evidence

- Focused compiler/runtime-context/direct-combat/Projectile-system/
  Projectile-combat coverage: 5 files / 230 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3291 passed tests (3349 total). Visible
  failures are retired Nova/Mira/Rook/DA29/DA30 expectations plus the inherited
  projectile multi-hit trace; no T522-specific failure remains.
- Browser smoke: N/A; no visible route or renderer changed.
