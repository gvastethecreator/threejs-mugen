# Controller Support Registry

This is the registry contract for CNS controller work. It prevents the runtime from growing controller behavior through invisible ad hoc paths.

Every controller family should have:

- parser recognition
- compiled representation when possible
- typed `ControllerOp` when it mutates runtime state
- runtime execution level
- ignored params
- unsupported params
- fixture or synthetic trace evidence
- UI/report wording

## Support States

| State | Meaning |
| --- | --- |
| `recognized` | The controller name is known and can be counted/reported. |
| `compiled` | Controller data is converted into typed runtime IR or typed operation data. |
| `executed-partial` | The runtime performs a documented subset. |
| `executed-parity` | The tested behavior is expected to match MUGEN/IKEMEN for the covered case. |
| `noop` | The controller is intentionally accepted but does nothing in runtime. |
| `unsupported` | The controller is known but not executed. |
| `unknown` | The controller or param was encountered but not classified. |

## Current Registry

| Controller Family | Current Level | Evidence | Notes |
| --- | --- | --- | --- |
| `ChangeState` | executed-partial | unit tests, imported traces | Supports selected trigger/state routing and owner transitions; tick-order parity still partial. |
| `ChangeAnim`, `ChangeAnim2` | executed-partial | runtime tests/traces | `ChangeAnim2` is ownership-sensitive and remains partial. |
| `HitDef` | compiled, executed-partial | `synthetic-imported-x.json`, KFM optional traces | Basic attr, guardflag, damage, pause, hit velocity, fall metadata, p1/p2 state routing. |
| `HitFallVel`, `HitFallDamage`, `HitFallSet` | compiled, executed-partial | `synthetic-imported-common-gethit.json` | Partial Common1/get-hit plumbing only. |
| `FallEnvShake` | compiled, executed-partial | `synthetic-imported-common-gethit.json` | Emits typed/runtime evidence; presentation parity is partial. |
| `Target*` | compiled, executed-partial | `synthetic-imported-target.json` | Target memory exists; complex target binding/custom-state parity remains partial. |
| `Pause`, `SuperPause` | compiled, executed-partial | runtime tests, `synthetic-imported-superpause.json`, `synthetic-imported-superpause-projectile-freeze.json` | Runtime tests cover source `movetime` with opponent freeze; typed pause operations now require match-freeze snapshot plus actor/effect advance and freeze trace evidence for actor/state/darken/remaining/movetime, including a bounded projectile effect route that advances during source `movetime` and freezes afterward. Full pause layering/superpause effects are partial. |
| `Projectile` | compiled, executed-partial | `synthetic-imported-projectile.json`, `synthetic-imported-projectile-guard.json`, `synthetic-imported-projectile-clash.json` | Bounded projectile actor, spawn/remove lifecycle evidence, producer-store evidence, target-memory path, held-back projectile guard, and equal/greater `projpriority` projectile-vs-projectile trade/cancel through the shared effect actor world; exact priority classes, cancel/remove animations, sparks, sounds, helper ownership, and IKEMEN parity remain blocked. |
| `Helper` | compiled, executed-partial | `synthetic-imported-helper.json` | Visual/helper actor plumbing with spawn/active lifecycle and producer-store evidence; helper VM, redirects, keyctrl, combat blocked. |
| `Explod`, `RemoveExplod` | compiled, executed-partial | `synthetic-imported-explod.json` | Bounded visual explod path with spawn/active lifecycle and producer-store evidence; binding, ownpal, scaling, FightFX routing partial. |
| `HitBy`, `NotHitBy` | executed-partial | `synthetic-imported-reject.json` | Basic attr rejection only. |
| `HitOverride` | executed-partial | runtime tests/traces | Redirection is partial. |
| `ReversalDef` | executed-partial | runtime tests/traces | Counter behavior is bounded and partial. |
| `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, `PosFreeze` | executed-partial | unit tests/runtime traces | Physics semantics are partial and must stay trace-gated. |
| `Gravity` | executed-partial | Common1 fall traces | Bounded vertical acceleration support. |
| `CtrlSet`, `StateTypeSet`, `PlayerPush`, `Turn`, `Width` | executed-partial | unit tests/runtime traces | Runtime metadata/physics flags only. |
| `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet` | executed-partial | unit tests/runtime traces | Basic arithmetic; scaling and edge rules partial. |
| `VarSet`, `VarAdd`, `VarRangeSet` | executed-partial | unit tests/runtime traces | Numeric vars/fvars are partial. |
| `PlaySnd`, `StopSnd` | executed-partial | runtime events | Emits sound events; Web Audio/SND parity partial. |
| `SprPriority`, `PalFX`, `RemapPal`, `AfterImage`, `AfterImageTime` | executed-partial | runtime/session evidence | Rendering/effect parity partial. |
| `EnvShake` | executed-partial | runtime events | Presentation parity partial. |
| `ForceFeedback`, `Null` | noop | compatibility reports | Accepted no-op; must be visible as such. |

## Adding A Controller

Use this path:

```txt
CNS parser
  -> model/controller params
  -> compiler support
  -> typed ControllerOp when mutating runtime
  -> small runtime system or executor path
  -> compatibility report counts
  -> trace artifact evidence
  -> docs/support table update
```

## Controller Entry Template

When adding or upgrading a controller, record:

```md
### ControllerName

- Support level:
- Parser/model fields:
- Compiled IR:
- Typed operation:
- Runtime system:
- Supported params:
- Ignored params:
- Unsupported params:
- Trace artifacts:
- Fixtures:
- UI wording:
- Remaining parity gaps:
```

## Hard Rules

- A recognized controller is not executable support.
- A compiled controller is not runtime support until a trace proves execution.
- A runtime path with ignored params is `executed-partial`.
- New broad controller behavior should not go directly into `PlayableMatchRuntime` unless it is a bounded bridge with a follow-up extraction note.
- If a typed operation exists, trace gates should require `executedOperations`.
