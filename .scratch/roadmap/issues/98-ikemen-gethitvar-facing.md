# Issue 98 — Ikemen-GO `GetHitVar(facing)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 97 / T523
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation defines
`GetHitVar(facing)` as the `p2facing` value from the last HitDef. The current
`develop` compiler maps the trigger to `OC_ex_gethitvar_facing`, and the
character hit path stores the authored value on the defender's last-hit
metadata. This is distinct from the defender's live facing and from
ReversalDef's facing mutation.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add typed last-hit p2facing metadata without changing live actor facing.
- Parse static `p2facing` for direct HitDef and Projectile HitDef sources,
  preserving signed integer values and a missing/default `0`.
- Carry the value through direct and Projectile contacts and expose it through
  `GetHitVar(facing)`.
- Leave dynamic p2facing, ReversalDef, p1facing choreography, and full
  M.U.G.E.N/Ikemen facing parity outside this slice.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage for explicit,
  signed, and missing/default values.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers bounded numeric `GetHitVar(facing)` readback for direct
HitDef and Projectile hit contacts. It does not claim live facing mutation,
guard-specific p2facing semantics, dynamic expressions, ReversalDef, or full
M.U.G.E.N/Ikemen parity.

## Closeout evidence

- Focused Vitest: 5 files / 234 tests passed (`RuntimeCompiler`,
  `RuntimeExpressionContextSystem`, `DirectCombatSystem`, `ProjectileSystem`,
  `ProjectileCombatSystem`).
- `pnpm qa:trace`: 682/682 artifacts (648 required, 34 optional).
- `pnpm typecheck`: passed.
- `pnpm build`: passed (356 modules; existing large-chunk advisory only).
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed.
- Full Vitest baseline after the slice: 14 failed / 311 passed files; 58 failed /
  3295 passed tests (3353 total), matching the known retired-roster and
  projectile multi-hit baseline; no T524-specific failure.
- Browser: N/A for the runtime-only contract; the separate Fighter Lab Gallery
  surface is covered by `pnpm qa:browser:fighter-lab`.
