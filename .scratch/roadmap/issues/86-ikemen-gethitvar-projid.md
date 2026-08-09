# Issue 86 — Ikemen-GO `GetHitVar(projid)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 85 / T511
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger reference defines `GetHitVar(projid)`
as the `projID` of the last Projectile that hit the player, returning `-1`
when the last hit was not authored by a Projectile. Current `develop`
`compiler.go` maps the trigger to `OC_ex_gethitvar_projid`, and `bytecode.go`
returns the stored integer directly.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)

## Implementation boundary

- Retain the Projectile's authored `projectileId` in defender last-hit
  metadata, including guarded contacts and Helper-parented sources.
- Return `-1` for direct HitDef hits and missing hit metadata.
- Keep the read numeric and active-actor/redirect aware through the existing
  expression context.

## Required evidence

- Compiler, RuntimeHitVar, runtime-context, direct, and Projectile tests.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

Closed evidence: 4 focused files / 186 tests; `pnpm qa:trace` passes 682/682
artifacts (648 required, 34 optional); typecheck; 356-module production build;
boundaries; and diff hygiene. The broad suite remains at the inherited
retired-roster baseline: 14 failed / 311 passed files and 58 failed / 3277
passed tests.

## Claim ceiling

This issue covers numeric last-hit Projectile ID readback only. It does not
add `GetHitVar(hitflag)`, dynamic filters, `GetHitVarSet`, Projectile lifecycle
parity, broader ownership, or full M.U.G.E.N/Ikemen parity.
