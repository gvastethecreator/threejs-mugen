# Issue 88 — Ikemen-GO `GetHitVar(keepstate)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 87 / T513
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger compiler maps `GetHitVar(keepstate)` to
`OC_ex_gethitvar_keepstate`. The bytecode reads the boolean stored on the last
HitDef get-hit record. Current `char.go` copies `hd.KeepState` into
`ghv.keepstate`; reset state is false.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Retain authored `keepstate` on imported direct HitDef moves.
- Return numeric `1` for a last direct HitDef carrying `keepstate = 1` and
  `0` for `keepstate = 0` or missing hit metadata.
- Keep Projectile and Reversal paths at the existing false fallback until
  their separate authored keepstate contracts are verified.

## Required evidence

- Compiler, RuntimeHitVar, runtime-context, HitDef import, and direct-combat
  tests.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers numeric last-direct-HitDef keepstate readback only. It does
not claim Projectile keepstate authoring, HitOverride keepstate timing,
ReversalDef state retention, `GetHitVar(frame)`, or full parity.

## Closeout evidence

- Focused compiler/runtime-context/HitDef/direct-combat/Projectile coverage:
  5 files / 212 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3277 passed tests. Browser smoke is N/A;
  no visible route or renderer changed.
