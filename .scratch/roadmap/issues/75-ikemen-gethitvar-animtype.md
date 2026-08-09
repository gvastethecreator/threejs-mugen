# T490 — Ikemen-GO `GetHitVar` animtype fields

Status: closed-bounded
Lane: I2 runtime compatibility
Priority: P1
Date: 2026-08-01

## Source contract

Ikemen-GO documents `GetHitVar(air.animtype)`, `GetHitVar(fall.animtype)`,
and `GetHitVar(ground.animtype)` as the reaction animation values from the
last HitDef. The engine source stores separate ground, air, and fall reaction
fields and computes an effective reaction value for Common1.

- [Ikemen-GO changed trigger reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
- [Ikemen-GO `char.go` HitDef/GetHitVar model](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implemented boundary

- HitDef compiler IR retains `air.animtype` beside existing `animtype` and
  `fall.animtype` values.
- HitDef activation writes ground, air, and fall reaction metadata to the
  shared hit-variable record.
- Imported state moves retain the same metadata with the official fallback:
  air uses ground when omitted; fall uses air for `up`/`diagup`, otherwise
  `back`.
- Projectile operations and runtime projectiles carry the same metadata.
- Direct and Projectile combat expose the three dotted aliases. Missing data
  returns zero. Existing effective `GetHitVar(animtype)` behavior stays intact.

## Evidence

- Focused: 7 test files / 256 tests passed.
- Full: 324 files / 3327 tests passed.
- `pnpm typecheck` passed.
- `pnpm build` passed; 355 modules, 2,274.63 kB pre-gzip JS output.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: 682/682 artifacts (648 required, 34 optional).
- `pnpm qa:assets:hygiene` passed.
- `git diff --check` passed with existing CRLF warnings only.
- Browser smoke: N/A; no visible route changed.

## Claim ceiling

Allowed: bounded runtime readback for ground, air, and fall HitDef reaction
animation types across direct HitDef, player-owned Projectile, and imported
move paths.

Blocked: exact Common1 reaction-state choreography, string-valued trigger
semantics, dynamic animtype expressions, Helper/team ownership breadth,
rollback/netplay, score movement, and full M.U.G.E.N/Ikemen parity.

## Next cut

Select the next official trigger or state-controller seam after the T490
evidence is independently adjudicated. Do not promote compatibility scores from
this bounded slice alone.
