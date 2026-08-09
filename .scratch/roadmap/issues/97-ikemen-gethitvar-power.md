# Issue 97 — Ikemen-GO `GetHitVar(power)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 96 / T522
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation defines
`GetHitVar(power)` as the power received from the last hit, whether the
character was hit or guarded. The current `develop` compiler maps the trigger
to `OC_ex_gethitvar_power`, bytecode reads `ghv.power`, and the character hit
path adds the authored hit/guard give-power to the defender-owned get-hit
metadata before the normal power-resource tick.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add typed last-contact power metadata without aliasing the defender's
  current `power` resource.
- Select the authored first/second `givepower` value for direct HitDef and
  Projectile hit/guard contacts, with a missing/default `0`.
- Expose the selected value through `GetHitVar(power)` for the bounded runtime
  path while retaining the existing resource application behavior.
- Leave cumulative multi-hit accumulation, next-frame power-resource mutation,
  `MoveHitVar(power)`, ReversalDef ownership, and full M.U.G.E.N/Ikemen parity
  outside this slice.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage for hit, guard,
  explicit values, and missing/default `0` behavior.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers bounded numeric `GetHitVar(power)` readback for direct
HitDef and Projectile hit/guard contacts. It does not claim power-resource
mutation timing, cumulative multi-hit/reset semantics, `MoveHitVar(power)`,
ReversalDef, or full M.U.G.E.N/Ikemen parity.

## Closeout evidence

- Focused compiler/runtime-context/direct-combat/Projectile-system/
  Projectile-combat coverage: 5 files / 232 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3293 passed tests (3351 total). Visible
  failures are retired Nova/Mira/Rook/DA29/DA30 expectations plus the inherited
  projectile multi-hit trace; no T523-specific failure remains.
- Browser smoke: N/A; no visible route or renderer changed.
