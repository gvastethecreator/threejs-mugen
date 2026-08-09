# Issue 100 — Ikemen-GO `GetHitVar(hitcount)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 99 / T525
Date: 2026-08-02

## Official contract

The current Ikemen-GO compiler exposes `GetHitVar(hitcount)`, while the
runtime's authored HitDef `numhits` is not the same value. Verify the official
write, combo-eligibility, persistence, and reset order before adding a local
field.

Sources:

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [Ikemen-GO `compiler.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [Ikemen-GO `bytecode.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [Ikemen-GO `char.go`](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Initial official-source notes — 2026-08-02

`compiler.go` has a dedicated `OC_ex_gethitvar_hitcount` reader and
`bytecode.go` pushes `c.ghv.hitcount`. In `char.go`, the normal hit path first
computes `getterInCombo` as an already-get-hit actor (or `CSF_gethit`) that is
not currently guarded; a combo contact increments `ghv.hitcount`, otherwise it
sets the counter to `1`. `selectiveReset` preserves `hitcount` across contact
metadata refreshes, while the source's idle cleanup explicitly resets
`guardcount` but intentionally does not reset `hitcount` like M.U.G.E.N.

This establishes that local authored `hitVars.hitCount` (currently derived from
HitDef `numhits`) cannot be reused for T526. The bounded local route now stores
`hitVars.comboHitCount` separately and reads it before the authored fallback.

Direct and player-owned Projectile contacts start the counter at `1`, increment
only when the defender is already in move type `H` and the previous contact was
not guarded, preserve it across guard contacts, and reset to `1` after a guarded
contact. The `ikemen-go` profile applies this counter even when authored
`numhits` is present; M.U.G.E.N/static imported traces without that profile keep
the legacy `hitCount` readback so their metadata contracts remain valid. This is
an explicit compatibility ceiling, not a claim that every `numhits` route has
full mutable combo parity.

T527 extends that ceiling for one required Ikemen-GO profile route: a
player-owned Projectile with authored `numhits` can produce two eligible hit
contacts, branch through the mutable counter, then produce a guarded break
without replacing the authored metadata field. Static/imported M.U.G.E.N
traces still use the authored fallback. The required artifact is recorded in
issue 101 with trace checksum `c6582760` and final checksum `78e24146`.

## Research boundary

- [x] Confirm the `getterInCombo`/`hitcount` branch and the idle/reset lifetime.
- [x] Keep authored `numhits`/`hitCount` metadata separate from defender readback.
- [x] Cover direct and player-owned Projectile hit contacts with a bounded
  combo counter; ReversalDef, redirects, GetHitVarSet, and exact multi-hit
  arbitration remain out of scope.

## Required evidence

- Official source notes with exact write/read/reset locations (compiler,
  bytecode, and `char.go`).
- Focused compiler/context/direct/projectile tests: 4 files / 207 tests pass;
  first hit, combo hit, guarded reset, authored fallback, and default paths are
  covered.
- `pnpm qa:trace` passes 683/683; `pnpm typecheck`, `pnpm build`,
  `pnpm check:boundaries`, and `git diff --check` pass. The prior full-suite
  baseline remains 14 failed / 311 passed files (58 failed / 3299 passed
  tests); the four additional passing tests are T526 coverage and the failures
  remain the inherited retired-roster/projectile set.

## Claim ceiling

This issue claims the typed mutable counter for bounded direct and player-owned
Projectile contacts only. The authored `numhits` compatibility fallback,
multi-hit/multi-target arbitration, helper/redirect/team ownership,
`GetHitVarSet`, exact custom-state lifetime, and full M.U.G.E.N/Ikemen parity
remain unclaimed.
