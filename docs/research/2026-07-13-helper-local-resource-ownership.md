# Research - Helper-local resource ownership

Date: 2026-07-13
Status: primary-source-backed implementation boundary

## Question

Which auxiliary actors may own mutable life/power resources, and which must
stay outside the root/team resource-bank model?

## Primary evidence

- The pinned [IKEMEN-GO `char.go` source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
  is the upstream actor-runtime anchor for life/power state. The local
  `RuntimeHelper` shape follows that actor-style resource model.
- The official [MUGEN State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  treats `LifeAdd`, `LifeSet`, `PowerAdd`, and `PowerSet` as resource
  controllers, while `Projectile` and `ModifyProjectile` are effect
  controllers. The local route keeps those families separate.
- The official [IKEMEN-GO miscellaneous reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  documents actor/team mode distinctions; it does not justify treating every
  effect actor as a team-bank member.

## Local audit

- `RuntimeHelper` has mutable `life`, `lifeMax`, `power`, and `powerMax` fields.
  `HelperSystem` runs helper resource controllers through
  `RuntimeControllerDispatchWorld` and applies the resulting typed operation
  to the helper-local runtime state.
- `RuntimeHelperTelemetryWorld` previously filtered helper telemetry to
  Projectile, pause, team-standby, and kinematic families. Resource controller
  and operation families are now included, preserving the helper state number
  as telemetry context.
- `RuntimeTeamResourceBankRuntime` receives `characterRoots()` only. Helpers
  therefore do not enter root/team bank reconciliation.
- `RuntimeProjectile` has no mutable life/power fields. Its actor snapshot
  carries `life: 0` and `power: 0` for the common actor-runtime snapshot shape,
  but no controller path can mutate those values.

## Decision

Promote one required imported trace:

1. Spawn a Helper and execute `LifeAdd(-100, kill=0)`, `LifeSet(750)`,
   `PowerAdd(200)`, and `PowerSet(900)` in the Helper's state.
2. Require helper actor-frame evidence at `life=750` / `power=900`.
3. Require root P1 frame/final evidence at `life=1000` / `power=0`.
4. Require controller and `resource:*` operation telemetry with the helper
   state context.

This proves local ownership and telemetry without inventing a Projectile bank.

## Uncertainty

The official references do not settle helper-specific maxima, helper damage or
KO rules, red-life, guard/stun resources, round persistence, or rollback. The
trace supports a narrow local-resource claim only.
