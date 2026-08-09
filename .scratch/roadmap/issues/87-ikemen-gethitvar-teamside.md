# Issue 87 — Ikemen-GO `GetHitVar(teamside)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 86 / T512
Date: 2026-08-02

## Official contract

The current Ikemen-GO changed-trigger reference defines `GetHitVar(teamside)`
as the `teamside` of the last HitDef that hit the player. Current `develop`
`char.go` stores `hd.teamside` in get-hit state and `bytecode.go` returns the
internal zero-based side plus one; reset state is `-1`.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)

## Implementation boundary

- Retain the 1-based effective team side of the direct HitDef or Projectile
  that authored the last hit.
- Derive the side from the explicit HitDef/Projectile parameter, falling back
  to the attacker/root identity for omitted local parameters.
- Return `-1` when no hit metadata is available.

## Required evidence

- Compiler, RuntimeHitVar, runtime-context, direct, and Projectile tests.
- Full `pnpm qa:trace`, typecheck, build, boundaries, and diff hygiene.
- Browser smoke: N/A; no visible route or renderer changes.

## Closeout evidence — 2026-08-02

- Focused compiler, runtime-context, direct-combat, and Projectile coverage:
  4 files / 186 tests passed.
- `pnpm qa:trace`: 682/682 artifacts passed (648 required, 34 optional;
  99 controller families, 91 operation families).
- `pnpm typecheck`: passed.
- `pnpm build`: passed, 356 modules; existing >500 kB chunk advisory only.
- `pnpm check:boundaries`: passed.
- `pnpm test -- --reporter=dot`: 311 files / 3277 tests passed; the inherited
  baseline remains 14 failed files / 58 failed tests, all tied to retired
  Nova/Mira/Rook content fixtures.
- `git diff --check`: passed with only existing CRLF normalization warnings.

## Claim ceiling

This issue covers numeric last-hit team-side readback only. It does not claim
team topology parity, dynamic filters, `GetHitVar(hitflag)`, `GetHitVarSet`, or
full M.U.G.E.N/Ikemen parity.
