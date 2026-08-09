# Issue 89 — Ikemen-GO `GetHitVar(frame)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 88 / T514
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger compiler maps `GetHitVar(frame)` to
`OC_ex_gethitvar_frame`. The bytecode reads a boolean that is true only during
the frame in which the defender was hit; the runtime clears it at the end of a
non-paused action frame.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implementation boundary

- Add an ephemeral `frame` bit to runtime hit metadata.
- Set it for direct HitDef and Projectile hit/guard contacts after combat
  resolves; preserve it through hitpause and clear it at the next non-paused
  frame start.
- Leave ReversalDef and HitOverride-only redirects outside the first cut unless
  an existing local contact path already proves the same semantics.

## Required evidence

- Compiler/runtime-context/direct-combat/Projectile coverage.
- Frame-start reset coverage, full `pnpm qa:trace`, typecheck, build, boundaries,
  and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Claim ceiling

This issue covers numeric same-frame direct HitDef and Projectile hit/guard
readback only. It does not claim ReversalDef/HitOverride timing, paused-action
parity beyond the local marker preservation, or full parity.

## Closeout evidence

- Focused compiler/runtime-context/direct-combat/Projectile/frame-reset
  coverage: 6 files / 191 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional; 99
  controller families and 91 operation families).
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` passed. The build retains the existing large-chunk
  advisory.
- Full Vitest remains at the inherited retired-roster baseline: 14 failed /
  311 passed files and 58 failed / 3278 passed tests. Browser smoke is N/A;
  no visible route or renderer changed.
