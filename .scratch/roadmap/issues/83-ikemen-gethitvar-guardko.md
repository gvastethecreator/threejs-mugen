# Issue 83 — Ikemen-GO `GetHitVar(guardko)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 82 / T508
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger reference defines `GetHitVar(guardko)`
as true when guard damage knocked out the player. Current Ikemen-GO source
retains the guard-KO flag in get-hit variables.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implemented boundary

- Expose existing typed `sourceGuardKo` metadata as numeric
  `GetHitVar(guardko)`.
- Return `1` only for a guard contact that reduces life to zero and `0` for
  ordinary hits, non-KO guards, or missing metadata.
- Preserve the existing direct, root Projectile, and verified Helper source
  ownership path without adding duplicate state.

## Required evidence

- Focused shared-expression, direct-combat, and Projectile-combat slice:
  3 files / 121 tests passed.
- Full `pnpm qa:trace`: 682/682 artifacts passed, 648 required and 34 optional.
- TypeScript, 356-module production build, boundaries, and diff hygiene pass.
- Browser smoke: N/A; no visible route or renderer changed.

## Claim ceiling

This issue exposes the current bounded guard-KO flag only. It does not claim
exact guard-damage accumulation, teams/simul breadth, string-valued GetHitVar
fields, score movement, or full M.U.G.E.N/Ikemen parity.
