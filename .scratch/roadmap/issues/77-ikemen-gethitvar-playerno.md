# Issue 77 — Ikemen-GO `GetHitVar(playerno)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 76 / T491
Date: 2026-08-01

## Official contract

The official Ikemen-GO changed-trigger reference defines
`GetHitVar(playerno)` as the `PlayerNo` of the last character that hit the
player. The source runtime stores that attacker slot in get-hit variables.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#GetHitVar)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Implemented boundary

- Reused the existing `sourcePlayerNo` metadata written by direct HitDef and
  player-owned Projectile contacts.
- Added `RuntimeHitVarSystem` readback for `GetHitVar(playerno)`.
- Returned `0` when the hit has no source metadata.
- Kept the defender's own runtime `PlayerNo` and string-valued attributes out
  of this numeric slice.

## Evidence

- Focused: `pnpm exec vitest run src/tests/RuntimeExpressionContextSystem.test.ts src/tests/DirectCombatSystem.test.ts src/tests/ProjectileCombatSystem.test.ts --reporter=dot` — 3 files, 119 tests passed.
- Full: `pnpm test -- --reporter=dot` — 324 files, 3330 tests passed.
- TypeScript: `pnpm typecheck` — passed.
- Build: `pnpm build` — passed, 355 modules, `dist/assets/index-C03R5DX1.js` 2,275.45 kB (existing large-chunk advisory).
- Boundaries: `pnpm check:boundaries` — passed.
- Trace: `pnpm qa:trace` — 682/682 artifacts passed.
- Asset path hygiene: `pnpm qa:assets:hygiene` — passed, no violations.
- Diff hygiene: `git diff --check` — passed; existing CRLF normalization warnings only.
- Browser smoke: N/A; no visible route or renderer changed.

## Claim ceiling

This issue does not claim string-valued `attr`, `hitflag` or `guardflag`,
`playerid`, helper/team ownership breadth, resource/scaling semantics, or full
M.U.G.E.N/Ikemen parity. Scores and milestone bands remain unchanged pending
independent adjudication.
