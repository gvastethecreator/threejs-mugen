# Issue 93 — Ikemen-GO `GetHitVar(redlife)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 92 / T518
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation defines
`GetHitVar(redlife)` as the last HitDef `redlife` value. The current `develop`
compiler maps the trigger to `OC_ex_gethitvar_redlife`, bytecode reads
`ghv.redlife`, and the HitDef/character path keeps authored hit red-life
metadata separate from the defender's mutable red-life resource.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add typed last-hit red-life metadata without conflating it with the
  defender's current `redLife` resource.
- Populate direct HitDef contacts from the already-imported/authored local
  HitDef `redLife` value, preserving signed values and integer readback.
- Carry an authored `redlife` value through Projectile controller parsing and
  Projectile contacts when present; missing metadata reads `0`.
- Return the numeric value through `GetHitVar(redlife)`.
- Leave current-resource triggers, `guardredlife`, cumulative damage/reset
  parity, and full M.U.G.E.N/Ikemen parity outside this bounded slice.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage, including
  explicit values and missing/default `0` behavior.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers numeric `GetHitVar(redlife)` readback for direct HitDef and
Projectile hit/guard contacts in the bounded runtime path. It does not claim
current red-life resource readback, `guardredlife`, cumulative reset semantics,
or full M.U.G.E.N/Ikemen parity.

## Closeout evidence

- Focused compiler/runtime-context/direct-combat/Projectile-system/
  Projectile-combat coverage: 5 files / 224 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3285 passed tests (3343 total). Visible
  failures are the retired Nova/Mira/Rook/DA29/DA30 expectations and the
  inherited projectile multi-hit trace; no T519-specific failure remains.
- Browser smoke: N/A; no visible route or renderer changed.
