# Issue 80 — Ikemen-GO `GetHitVar(playerid)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 77 / T492
Date: 2026-08-02

## Official contract

The official Ikemen-GO changed-trigger reference defines
`GetHitVar(playerid)` as the numeric ID of the last character that hit the
player. Current Ikemen-GO source stores this separately from the attacker's
`PlayerNo` when it materializes get-hit variables.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implemented boundary

- Retain a numeric `sourcePlayerId` beside the existing source player slot and
  actor/root ownership metadata.
- Propagate root and verified Helper identity through direct HitDef and
  Projectile contact materialization, including verified nested ancestry.
- Expose `GetHitVar(playerid)` with `0` when the last hit has no verified
  numeric source identity.
- Prove that a Helper can keep its own `PlayerID` while inheriting its root's
  `PlayerNo`.

## Evidence

- Focused: 5 files / 178 tests passed across expression, direct, projectile,
  runtime-resolution, and Helper combat paths.
- Deterministic traces: 5 affected IKEMEN golden checks passed after intentional
  checksum updates for the expanded last-hit runtime state.
- TypeScript: `pnpm typecheck` passed.
- Build: `pnpm build` passed, 356 modules, 2,288.18 kB JavaScript before gzip
  (existing large-chunk advisory).
- Boundaries: `pnpm check:boundaries` passed.
- Asset path hygiene: `pnpm qa:assets:hygiene` passed.
- Aggregate trace: the initial T506 run identified two inherited retired-roster
  labels; T508 removed those labels and the final `pnpm qa:trace` passes
  682/682 artifacts (648 required, 34 optional).
- Full Vitest ran after the roster reset and remains red only on inherited
  retired-roster tests; the T506 focused and deterministic trace subsets pass.
- Browser smoke: N/A; no visible route or renderer changed.

## Claim ceiling

This issue does not claim string-valued `attr`, `hitflag` or `guardflag`,
unverified/custom-state/team identity breadth, score movement, or full
M.U.G.E.N/Ikemen parity. The deprecated `GetHitVar(ID)` alias is tracked and
closed separately by T507.
