# Issue 91 — Ikemen-GO `GetHitVar(dizzypoints)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 90 / T516
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation defines
`GetHitVar(dizzypoints)` as the last HitDef `dizzypoints` value. The compiler
maps the trigger to `OC_ex_gethitvar_dizzypoints`, bytecode reads
`ghv.dizzypoints`, and the character hit path carries the value in get-hit
metadata while applying the authored dizzy-point damage.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add typed last-hit dizzy-point metadata without conflating it with the
  defender's current `dizzyPoints` resource.
- Populate direct HitDef contacts from the already-imported/authored local
  HitDef `dizzyPoints` value, preserving signed values and integer readback.
- Carry an authored `dizzypoints` value through Projectile controller parsing
  and Projectile contacts when present; missing metadata reads `0`.
- Return the numeric value through `GetHitVar(dizzypoints)`.
- Leave current-resource triggers, `guardpoints`, score/power, and cumulative
  multi-hit reset parity outside this bounded slice.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage, including
  explicit values and missing/default `0` behavior.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers numeric `GetHitVar(dizzypoints)` readback for direct HitDef
and Projectile hit/guard contacts in the bounded runtime path. It does not
claim cumulative multi-hit reset semantics, current dizzy resource readback,
`GetHitVar(guardpoints)`, or full M.U.G.E.N/Ikemen parity.

## Closeout evidence

- Focused compiler/runtime-context/direct-combat/Projectile-system/
  Projectile-combat coverage: 5 files / 220 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3281 passed tests (3339 total). Visible
  failures are the retired Nova/Mira/Rook/DA29/DA30 expectations and the
  inherited projectile multi-hit trace; no T517-specific failure remains.
- Browser smoke: N/A; no visible route or renderer changed.
