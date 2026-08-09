# Issue 94 — Ikemen-GO `GetHitVar(guardpower)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 93 / T519
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation defines
`GetHitVar(guardpower)` as the second value of the last HitDef `givepower`
parameter: the power received when guarding. The current `develop` compiler
maps the trigger to `OC_ex_gethitvar_guardpower`, bytecode reads
`ghv.guardpower`, and the character hit path retains the authored value in
last-hit metadata.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add typed last-hit guard-power metadata without conflating it with the
  defender's current `power` resource.
- Parse the second `givepower` value for direct HitDef and Projectile sources,
  preserving signed integer readback and a missing/default `0`.
- Carry the authored value through direct and Projectile contacts and expose it
  through `GetHitVar(guardpower)`.
- Leave hitpower, current power resource readback, cumulative multi-hit/reset
  parity, and full M.U.G.E.N/Ikemen parity outside this bounded slice.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage, including
  explicit values and missing/default `0` behavior.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers numeric `GetHitVar(guardpower)` readback for direct HitDef
and Projectile hit/guard contacts in the bounded runtime path. It does not
claim current power resource readback, `GetHitVar(hitpower)`, cumulative reset
semantics, or full M.U.G.E.N/Ikemen parity.

## Closeout evidence

- Focused compiler/runtime-context/direct-combat/Projectile-system/
  Projectile-combat coverage: 5 files / 226 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3287 passed tests (3345 total). Visible
  failures are the retired Nova/Mira/Rook/DA29/DA30 expectations and the
  inherited projectile multi-hit trace; no T520-specific failure remains.
- Browser smoke: N/A; no visible route or renderer changed.
