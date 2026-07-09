# 2026-07-09 - Dynamic Damage-Scale Telemetry

## Question

Can dynamic `AttackMulSet` / `DefenceMulSet` `value` expressions be resolved into typed runtime trace operations without expanding the current damage-scaling parity claim?

## Sources

- Elecbyte State Controller Reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
- Elecbyte CNS format docs: <https://www.elecbyte.com/mugendocs/cns.html>

## Findings

- Elecbyte documents `AttackMulSet` as setting the player's attack multiplier; damage the player gives is scaled by that amount.
- Elecbyte documents `DefenceMulSet` as setting the player's defense multiplier; damage the player takes is scaled by that amount, while `LifeAdd` is not affected.
- Elecbyte's controller parameter rules allow numeric state-controller params to be arithmetic expressions unless a controller says otherwise.
- CNS controller params are evaluated when the controller triggers, so dynamic `value = var(...)` / `fvar(...)` inputs should be resolved at runtime, not compiled as static constants.

## Decision

Add a runtime damage-scale operation resolver and register it in `RuntimeControllerDispatchWorld.resolveDynamicRecordedOperation` for `attackmulset` and `defencemulset`.

The resolver clamps to the existing bounded multiplier range, reuses the same runtime expression context as raw execution, and records typed `damage-scale:attackmulset` / `damage-scale:defencemulset` telemetry after expression resolution.

## Evidence

- Focused unit/dispatch tests prove dynamic values such as `var(0) * fvar(0)` and `0 - var(1)` record typed damage-scale operations after compile-time lowering returns `undefined`.
- Required `synthetic-imported-damage-scale-dynamic.json` trace checksum `3433b369` / final checksum `e3db6dd9` proves owner-local dynamic attacker/defender multipliers reach final HitDef damage `for 30` and final P2 life `970`.
- `pnpm qa:trace` passes 524/524 artifacts, 493 required and 31 optional.

## Claim Boundaries

Allowed: bounded imported dynamic `AttackMulSet value` and `DefenceMulSet value` expressions can resolve owner-local var/fvar values at controller trigger time, emit typed `damage-scale:*` telemetry, and feed the current direct HitDef damage math.

Blocked: exact MUGEN/IKEMEN damage-scaling order for helpers, projectiles, custom states, guards, target-side systems, stacking, rounding, score movement, and full damage VM parity.
