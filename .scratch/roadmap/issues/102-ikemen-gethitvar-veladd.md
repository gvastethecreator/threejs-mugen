# Issue 102 — Ikemen-GO `GetHitVar(xveladd|yveladd)` readback

Status: closed-bounded
Lane: I2
Priority: P1
Dependency: issue 101 / T527
Date: 2026-08-02

## Goal

Add the Ikemen-only `GetHitVar(xveladd)` and `GetHitVar(yveladd)` readback
seam. These values are the extra velocity applied by the KO velocity rules;
they are not aliases for the authored HitDef velocity (`xvel`/`yvel`) or the
defender's current velocity.

## Official source pins

- [Ikemen-GO changed triggers — GetHitVar](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29#gethitvar)
- [`compiler.go` trigger mapping](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/compiler.go)
- [`bytecode.go` readback](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/bytecode.go)
- [`char.go` GetHitVar state and KO delta write](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

The current source maps both keys to dedicated opcodes and reads
`c.ghv.xveladd/yveladd`. During KO velocity application it saves the starting
get-hit velocity, applies the configured KO additions/multipliers, and stores
the difference in those fields. M.U.G.E.N documents these values as dummies;
the first local cut therefore remains explicit `ikemen-go` profile behavior.

## Acceptance

- [x] Add typed optional `hitVelocityAdd` metadata and evaluator readback for
  `xveladd` and `yveladd`, defaulting to `0`.
- [x] Populate the delta only on a bounded KO direct/Projectile contact under
  `ikemen-go`; preserve authored `hitVelocity` and live `vel` independently.
- [x] Cover direct and player-owned Projectile paths, non-KO/default fallback,
  and public expression evaluation without private test APIs.
- [x] Add one required runtime trace and update the board, compatibility
  profile, supported-features list, QA gates, and issue evidence.

## Evidence

- Focused Vitest: `801/801` across direct combat, projectile combat, expression
  context, and trace-preset coverage.
- Required trace corpus: `pnpm qa:trace` passed with `684/684` artifacts
  (`650` required, `34` optional), including
  `synthetic-imported-ikemen-projectile-gethitvar-veladd-ko`.
- The required trace records projectile spawn/active lifecycle, hit telemetry,
  and the defender's `KO Velocity Delta Branch` at state `328`.

## Out of scope

Full KO velocity constants/physics, helper/redirect/team ownership, custom
Common1/ZSS overrides, `GetHitVarSet`, and M.U.G.E.N parity claims remain
deferred.
