# T491 — Ikemen-GO `GetHitVar(fall.envshake.mul)`

Status: closed-bounded
Lane: I2 runtime compatibility
Priority: P1
Date: 2026-08-01

## Source contract

Ikemen-GO documents `GetHitVar(fall.envshake.mul)` as the multiplier from the
last HitDef's fall EnvShake group. The engine stores `fall_envshake_mul` with a
default of `1` and copies it into get-hit variables on contact.

- [Ikemen-GO changed trigger reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
- [Ikemen-GO `char.go` HitDef/GetHitVar model](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implemented boundary

- HitDef and Projectile compiler paths parse `fall.envshake.mul`.
- Imported state moves retain the authored multiplier.
- Direct HitDef and player-owned Projectile fall materialization carry it into
  `RuntimeHitFall.envShake`.
- `GetHitVar(fall.envshake.mul)` reads the authored value and returns `1` when
  no multiplier was authored.
- Existing EnvShake time/frequency/amplitude/phase behavior remains intact.

## Evidence

- Focused: 7 test files / 258 tests passed.
- Full: 324 files / 3329 tests passed.
- `pnpm typecheck` passed.
- `pnpm build` passed; 355 modules, 2,275.39 kB pre-gzip JS output.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: 682/682 artifacts (648 required, 34 optional).
- `pnpm qa:assets:hygiene` passed.
- `git diff --check` passed with existing CRLF warnings only.
- Browser smoke: N/A; no visible route changed.

## Claim ceiling

Allowed: bounded runtime readback of `fall.envshake.mul` across direct HitDef,
player-owned Projectile, and imported move paths, with the official default.

Blocked: exact EnvShake waveform/mixing/timing, dynamic multiplier expressions,
helper/team ownership breadth, rollback/netplay, score movement, and full
M.U.G.E.N/Ikemen parity.

## Next cut

Select the next official changed `GetHitVar` field or state-controller seam after
T491 is independently adjudicated. Do not promote compatibility scores from
this bounded slice alone.
