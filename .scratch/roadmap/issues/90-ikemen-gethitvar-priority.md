# Issue 90 — Ikemen-GO `GetHitVar(priority)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 89 / T515
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger documentation defines
`GetHitVar(priority)` as the numerical attack priority of the last HitDef.
The compiler maps the trigger to `OC_ex_gethitvar_priority`, the bytecode reads
`ghv.priority`, and the hit path copies the resolved HitDef priority into the
defender's get-hit metadata.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add typed numeric last-hit priority metadata.
- Populate direct HitDef contacts from the already-normalized local HitDef
  priority, including the engine default when the author omitted it.
- Populate Projectile contacts with the local HitDef default. Keep the
  existing Projectile `priority` field as `projpriority` clash priority; do
  not conflate those two official concepts.
- Return the numeric value through `GetHitVar(priority)`, defaulting to the
  local/Ikemen HitDef default when no metadata exists.
- Leave `GetHitVar(facing)`, priority-type readback, ReversalDef, and broader
  HitOverride parity outside this slice.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage, including
  omitted/default and projectile clash-priority separation.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers numeric `GetHitVar(priority)` readback for direct HitDef and
Projectile hit/guard contacts. It does not claim `GetHitVar(facing)`, priority
type readback, ReversalDef/HitOverride-only contacts, or full M.U.G.E.N/Ikemen
parity.

## Closeout evidence

- Focused compiler/runtime-context/direct-combat/Projectile coverage: 4 files /
  188 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3279 passed tests. Browser smoke is N/A;
  no visible route or renderer changed.
