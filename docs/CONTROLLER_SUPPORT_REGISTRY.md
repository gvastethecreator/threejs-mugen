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
| `ChangeState`, `SelfState` | executed-partial | unit tests, imported traces, `synthetic-imported-custom-state.json` | Supports selected trigger/state routing, owner transitions, and a bounded attacker-owned custom-state chain returning through `SelfState`; tick-order parity still partial. |
| `ChangeAnim`, `ChangeAnim2` | executed-partial | runtime tests/traces | `ChangeAnim2` is ownership-sensitive and remains partial. |
| `HitDef` | compiled, executed-partial | `synthetic-imported-x.json`, `synthetic-imported-custom-state.json`, `synthetic-imported-hitdef-priority.json`, `synthetic-imported-hitdef-kill.json`, `synthetic-imported-hitdef-guard-kill.json`, `synthetic-imported-fall-defence-up.json`, `synthetic-imported-gethitvar-animtype.json`, `synthetic-imported-air-guard-state.json`, `synthetic-imported-assertspecial-noko.json`, KFM optional traces | Basic attr, guardflag, damage, pause, hit velocity, fall metadata including bounded `fall.defence_up`, get-hit classification vars (`animtype`, `fall.animtype`, `ground.type`, `air.type`, `isbound`), p1/p2 state routing, bounded owner-backed `p2stateno` custom-state chain/return, bounded direct `priority` clash where a higher numeric priority suppresses a lower-priority direct attack, bounded stand/crouch/air guard-hit state routing where defender-owned Common1-style states exist, and bounded nonlethal life clamps for direct `kill = 0`, `guard.kill = 0`, stored `fall.kill = 0` fall damage, and defender-side `AssertSpecial NoKO`. Exact MUGEN/IKEMEN priority classes, KO/round/no-KO interactions beyond this clamp, exact get-hit animation selection, exact fall-defense lifetime/stacking, exact guard physics/effects, reversal/projectile/helper/custom-state priority, throws, and multi-hit priority remain partial. |
| `HitFallVel`, `HitFallDamage`, `HitFallSet` | compiled, executed-partial | `synthetic-imported-common-gethit.json`, `synthetic-imported-fall-defence-up.json`, `synthetic-imported-gethitvar-fall-defence-up.json` | Partial Common1/get-hit plumbing, including bounded `fall.defence_up` scaling for deferred `HitFallDamage` and bounded `GetHitVar(fall.defence_up)` branching; exact lifetime, stacking, redirects, and tick-order parity remain partial. |
| `FallEnvShake` | compiled, executed-partial | `synthetic-imported-common-gethit.json` | Emits typed/runtime evidence; presentation parity is partial. |
| `Target*`, `BindToTarget` | compiled, executed-partial | `synthetic-imported-target.json`, `synthetic-imported-targetstate-custom.json`, `synthetic-imported-bindtotarget-head.json`, `synthetic-imported-bindtotarget-mid.json`, `synthetic-imported-targetbind-pause.json` | Target memory exists; TargetDrop keeps the official omitted-`keepone` default of `1` in typed IR and raw fallback; TargetState can enter a bounded controller-owner custom-state chain from target memory and return through `SelfState`; TargetBind can keep a bound target offset while the source actor advances during bounded `SuperPause` movetime. BindToTarget can bind the controller owner to a recent target with static `pos = x,y,Foot|Mid|Head` and bounded `time`; `Head` and `Mid` have required trace evidence through parsed target `[Size]` anchors. Complex target binding, complete custom-state parity beyond the current `p2stateno` and TargetState chains, redirects, teams, helper/root/parent targets, and exact tick-order remain partial. |
| `Pause`, `SuperPause` | compiled, executed-partial | runtime tests, `synthetic-imported-superpause.json`, `synthetic-imported-targetbind-pause.json`, `synthetic-imported-superpause-projectile-freeze.json`, `synthetic-imported-superpause-effect-freeze.json`, `synthetic-imported-explod-pausemovetime.json`, `synthetic-imported-explod-supermovetime.json` | Runtime tests cover source `movetime` with opponent freeze; typed pause operations now require match-freeze snapshot plus actor/effect advance and freeze trace evidence for actor/state/darken/remaining/movetime, including bounded TargetBind, projectile, visual Helper/Explod source-movetime routes, bounded Explod-owned `pausemovetime`, and bounded Explod-owned `supermovetime`. Full pause layering/superpause effects are partial. |
| `Projectile` | compiled, executed-partial | `synthetic-imported-projectile.json`, `synthetic-imported-projectile-motion.json`, `synthetic-imported-projectile-velmul.json`, `synthetic-imported-projectile-contact.json`, `synthetic-imported-projectile-guard.json`, `synthetic-imported-projectile-multihit.json`, `synthetic-imported-projectile-clash.json`, `synthetic-imported-projectile-priority-cancel.json` | Bounded projectile actor, spawn/remove lifecycle evidence, producer-store evidence, target-memory path, bounded `accel` movement, bounded `velmul` velocity multiplier, bounded static `projscale` render scale, bounded `ProjContact(77)`, `ProjHit(77)`, and `ProjGuarded(77)` owner-state branches, held-back projectile guard, bounded `projhits`/`projmisstime` re-hit cooldown, equal-priority `projpriority` trade, higher-priority cancel with bounded winner-priority decrement, and bounded visible terminal playback for resolved `projhitanim`/`projremanim`/`projcancelanim` AIR actions through the shared effect actor world; exact priority classes, exact trigger timing/lifetime, exact terminal timing, exact `velmul` tick-order parity, scaled hitbox parity, sparks, sounds, helper ownership, multi-target behavior, and IKEMEN parity remain blocked. |
| `ModifyProjectile` | compiled, executed-partial | `synthetic-imported-modifyprojectile.json` | Bounded owner-side mutation of live Projectile actors by `projid` / `id`, covering static `velocity`/`vel`, `accel`, `velmul`, `projscale`/`scale`, `projremovetime`/`removetime`, `sprpriority`, `projpriority`, `projhits`, `projmisstime`, and `projremove` through `RuntimeEffectActorWorld`; dynamic expressions, redirects, helper-owned projectiles, exact selection/tick order, rem triggers, and full MUGEN/IKEMEN projectile parity remain blocked. |
| `Helper` | compiled, executed-partial | `synthetic-imported-helper.json`, `synthetic-imported-superpause-effect-freeze.json` | Visual/helper actor plumbing with spawn/active lifecycle, producer-store evidence, and bounded source-movetime advance/freeze evidence during `SuperPause`; helper VM, redirects, keyctrl, combat, and full pause parity remain blocked. |
| `Explod`, `RemoveExplod` | compiled, executed-partial | `synthetic-imported-explod.json`, `synthetic-imported-explod-bind.json`, `synthetic-imported-explod-velocity.json`, `synthetic-imported-explod-scale.json`, `synthetic-imported-removeexplod.json`, `synthetic-imported-superpause-effect-freeze.json`, `synthetic-imported-explod-ignorehitpause.json`, `synthetic-imported-explod-pausemovetime.json`, `synthetic-imported-explod-supermovetime.json` | Bounded visual explod path with spawn/active/remove lifecycle, producer-store evidence, owner-side `bindtime`, `vel`/`accel` motion, bounded static `scale`, bounded hit-pause `ignorehitpause` evidence, bounded `pausemovetime`/`supermovetime` advance budgets, bounded regular `Pause` actor-budget evidence, and bounded source-movetime advance/freeze evidence during `SuperPause`; exact binding/tick order, ownpal, exact scaling parity, FightFX routing, remove-trigger semantics, and full pause parity remain partial. |
| `HitBy`, `NotHitBy` | compiled, executed-partial | `synthetic-imported-reject.json` | Static attr allow/deny setup has typed `eligibility:*` evidence; exact attr grammar and edge timing remain partial. |
| `HitOverride` | compiled, executed-partial | `synthetic-imported-hitoverride.json`, runtime tests | Static slot/attr/time/state setup has typed `hitoverride` evidence; the required trace proves a matching incoming `HitDef` can redirect the defender into a known state without normal damage. Exact slot priority, attr grammar, helper/projectile/custom-state redirects, `forceguard`/`forceair` edge timing, and IKEMEN parity remain partial. |
| `MoveHitReset` | compiled, executed-partial | `synthetic-imported-movehitreset.json`, runtime tests | Static reset compiles into typed `contact:movehitreset` evidence; the required trace proves a direct `HitDef` contact can be cleared before a later `MoveHit >= 1` branch fires. Projectile contact memory is intentionally not cleared by this bridge. Exact helper/redirect/team ownership and tick-order parity remain future work. |
| `HitAdd` | compiled, executed-partial | `synthetic-imported-hitadd.json` | Static `value` lowers into typed `contact:hitadd` operation evidence and adds to bounded current-state direct `HitCount` telemetry. `UniqHitCount` remains target-uniqueness evidence and is not increased by `HitAdd`. Guard/projectile counts, helpers, combo lifetime, redirects, teams, and exact tick-order parity remain future work. |
| `ReversalDef` | compiled, executed-partial | `synthetic-imported-reversal.json` | Static reversal attr/pause/state setup has typed `reversaldef` evidence; counter behavior is bounded and priority/guard/custom-state parity remain partial. |
| `AttackMulSet`, `DefenceMulSet` | compiled, executed-partial | `synthetic-imported-damage-scale.json` | Static numeric multipliers compile into typed `damage-scale:*` operations and feed the partial combat resolver's outgoing/incoming HitDef damage math. Exact helper/projectile/custom-state/guard scaling order parity remains partial. |
| `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd` | compiled, executed-partial | unit tests, `synthetic-imported-default-guard-state.json`, `synthetic-imported-crouch-guard-state.json`, `synthetic-imported-air-guard-state.json` | Static movement/position params and static `HitVelSet x/y` flags lower into typed `kinematic:*` operation evidence, including `kinematic:hitvelset` for bounded guard-hit routes. Dynamic params still fall back to runtime expression evaluation; physics semantics are partial and must stay trace-gated. |
| `PosFreeze`, `ScreenBound` | compiled, executed-partial | unit tests, `synthetic-imported-bounds.json`, `synthetic-imported-screenbound-camera.json` | Static one-frame position-freeze and screen/camera-bound params lower into typed `bounds:*` operation evidence. The screen-bound camera gate proves bounded X clamp bypass and X camera-follow exclusion; dynamic params, exact camera behavior, and exact screen-edge parity remain future work. |
| `Gravity` | executed-partial | Common1 fall traces | Bounded vertical acceleration support. |
| `Width` | compiled, executed-partial | unit tests, `synthetic-imported-width.json` | Static `player` / `value` params lower into typed `collision:width` operation evidence and update bounded body-width/push separation. Dynamic params, edge widths, exact player/edge semantics, and tick-order parity remain future work. |
| `StateTypeSet` | compiled, executed-partial | unit tests, `synthetic-imported-statetypeset.json` | Static `statetype` / `movetype` / `physics` params lower into typed `metadata:statetypeset` operation evidence and update actor-frame state metadata. Dynamic metadata expressions, exact physics/tick-order interactions, and full engine parity remain future work. |
| `PlayerPush` | compiled, executed-partial | unit tests, `synthetic-imported-playerpush.json` | Static `value` lowers into typed `collision:playerpush` operation evidence and updates the bounded current-tick body-push flag. Dynamic params, exact overlap resolution, team/helper push rules, and tick-order parity remain future work. |
| `Turn` | compiled, executed-partial | unit tests, `synthetic-imported-turn.json` | Static `Turn` lowers into typed `orientation:turn` operation evidence and flips the bounded current runtime facing. Exact auto-facing, tick order, team/helper/target-facing parity, and broader orientation semantics remain future work. |
| `SprPriority` | compiled, executed-partial | unit tests, `synthetic-imported-sprpriority.json` | Static `value` / `priority` params lower into typed `sprite-effect:sprpriority` operation evidence and update bounded renderer ordering telemetry. Exact layer/shadow/helper/Explod draw-order parity remains future work. |
| `PalFX` | compiled, executed-partial | unit tests, `synthetic-imported-palfx.json` | Static `time` / `add` / `mul` / `color` / `invert` params lower into typed `sprite-effect:palfx` operation evidence and update bounded material telemetry. Dynamic params, `sinadd`, palette remap interaction, exact blending, and engine-perfect color math remain future work. |
| `Trans` | compiled, executed-partial | unit tests, `synthetic-imported-trans.json` | Static `trans` / `value` params lower into typed `sprite-effect:trans` operation evidence and update bounded render-opacity telemetry. Dynamic params, exact add/sub alpha math, palette/remap interaction, draw-order interaction, and engine-perfect blending remain future work. |
| `AngleSet`, `AngleAdd`, `AngleDraw` | compiled, executed-partial | unit tests, `synthetic-imported-angle.json` | Static `value` params for `AngleSet`/`AngleAdd` lower into typed `sprite-effect:angleset` / `sprite-effect:angleadd` operation evidence, `AngleDraw` lowers into `sprite-effect:angledraw`, and the runtime exposes bounded render-angle telemetry consumed by Three.js. Dynamic params, exact axis pivot, collision-box rotation, scale/palette/draw-order interaction, and engine-perfect timing remain future work. |
| `EnvColor` | compiled, executed-partial | unit tests, `synthetic-imported-envcolor.json` | Static `value` / `time` / `under` params lower into typed `envcolor` operation evidence and update bounded stage-flash telemetry/render overlay. Dynamic params, exact layer/window/blend behavior, pause timing, and engine-perfect presentation parity remain future work. |
| `RemapPal` | compiled, executed-partial | unit tests, `synthetic-imported-remappal.json` | Static `source` / `dest` params lower into typed `sprite-effect:remappal` operation evidence and update bounded palette-remap telemetry. Dynamic params, ACT/SFF pixel remapping, PalFX interaction, and exact palette application remain future work. |
| `CtrlSet` | compiled, executed-partial | unit tests/runtime traces | Runtime control flag only; static numeric values lower into typed `resource:ctrlset` evidence. |
| `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet` | executed-partial | unit tests/runtime traces | Basic arithmetic; negative `LifeAdd` respects bounded `kill = 0` and defender-side `NoKO` clamps. Scaling, redirects, round-flow, and edge rules remain partial. |
| `VarSet`, `VarAdd`, `VarRangeSet` | executed-partial | unit tests/runtime traces | Numeric vars/fvars are partial; typed/raw `VarSet` and `VarAdd` support `sysvar(n)` for bounded Common1 system-variable branches such as air guard landing. `VarRangeSet` stays limited to vars/fvars. |
| `PlaySnd`, `StopSnd` | executed-partial | runtime events | Emits sound events; Web Audio/SND parity partial. |
| `AfterImage`, `AfterImageTime` | compiled, executed-partial | unit tests, `synthetic-imported-afterimage.json` | Static `AfterImage time/length/timegap/framegap/paladd/palmul/trans` and static `AfterImageTime time/value` params lower into typed `sprite-effect:afterimage` / `sprite-effect:afterimagetime` operation evidence and update bounded ghost-trail telemetry. Dynamic params, exact blend modes, palette/remap interaction, sampling cadence, persistence edge cases, and engine-perfect timing remain future work. |
| `EnvShake` | executed-partial | runtime events | Presentation parity partial. |
| `ForceFeedback`, `Null` | noop | compatibility reports | Accepted no-op; must be visible as such. |

## Current Explod Param Notes

`removeongethit` is `executed-partial` for owner-side visual Explods. It compiles into `ExplodControllerOp.removeOnGetHit`, falls back to raw params when needed, and is trace-gated by `synthetic-imported-explod-removeongethit.json`, `synthetic-imported-explod-removeonprojectilehit.json`, and `synthetic-imported-explod-removeonprojectileguard.json`.

`ignorehitpause`, `pausemovetime`, and `supermovetime` are `executed-partial` for visual Explod actor advancement. They compile into `ExplodControllerOp`, fall back to raw params when needed, `synthetic-imported-explod-ignorehitpause.json` trace-gates the first required hitpause route, `synthetic-imported-explod-pausemovetime.json` trace-gates the first required regular `Pause` budget route, and `synthetic-imported-explod-supermovetime.json` trace-gates the first required `SuperPause` budget route.

Do not describe this as full remove-trigger or pause parity. Unsupported scope remains helper-owned Explods, custom-state edge cases, exact tick order, exact pause layering, and broader FightFX/common animation routing.

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
