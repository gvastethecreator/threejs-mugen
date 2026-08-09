# Issue 101 — Ikemen-GO `GetHitVar(hitcount)` authored multi-hit contacts

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 100 / T526
Date: 2026-08-02

Implementation cursor: T527 now closes the required `ikemen-go` authored
multi-hit route while keeping static/imported M.U.G.E.N metadata fallback.

## Goal

Reconcile the mutable defender-side `GetHitVar(hitcount)` counter with direct
and player-owned Projectile contacts that also carry authored `numhits`/HitDef
hit-count metadata. T526 deliberately leaves those routes on the authored
fallback so the existing imported trace contracts stay stable.

## Official source pins

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [`char.go` get-hit counter write](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)
- [`bytecode.go` get-hit counter read](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)

The source increments `ghv.hitcount` only when the getter is already in a
get-hit/combo-eligible state and was not guarded; otherwise it starts at one.
The authored `numhits` value remains a separate HitDef field.

## Acceptance

- [x] Add one required trace with at least two eligible player-owned Projectile
  contacts carrying authored `numhits` and one guarded break.
- [x] Keep `hitVars.hitCount` available for authored HitDef metadata and legacy
  static/imported traces.
- [x] Cover first, consecutive, guarded, and default reads at the public
  runtime seam; no private test API was added.
- [x] Update issue 100, the execution board, compatibility registry, and QA
  claim ceiling with the exact supported route.

## Evidence — 2026-08-02

- `createSyntheticImportedIkemenProjectileGetHitVarHitCountMultiHitTraceArtifact`
  is required in `pnpm qa:trace`; it passes with two hit events, one guard
  event, `GetHitVar(hitcount)` combo/guard branches, projectile lifecycle and
  target-link evidence. Trace checksum: `c6582760`; final checksum:
  `78e24146`.
- Aggregate trace gate: `683/683` artifacts (`649` required, `34` optional).
- Focused new T527 trace test passes. The broader five-file Vitest batch is
  `860 passed / 1 inherited projectile-multi-hit baseline failure`; the
  failure predates T527 and remains visible.
- `pnpm typecheck`, `pnpm build` (356 modules), `pnpm check:boundaries`, and
  `git diff --check` pass. The existing Gallery browser proof remains the
  visible-view gate; no UI code changed in T527.

## Out of scope

Helper/redirect/team ownership, `GetHitVarSet`, ReversalDef scheduling, exact
multi-target arbitration, and full M.U.G.E.N/Ikemen parity remain deferred.

## Claim ceiling

This issue claims the typed mutable counter for bounded direct and player-owned
Projectile contacts, including the `ikemen-go` profile when authored `numhits`
is present and a single projectile produces repeated eligible contacts. Static
M.U.G.E.N/imported routes retain the authored fallback. Multi-target/team
arbitration, helper/redirect ownership, `GetHitVarSet`, exact custom-state
lifetime, and full M.U.G.E.N/Ikemen parity remain unclaimed.
