# Tick Order Contract

This document defines the intended runtime order for the fighting module. It is not a full MUGEN parity statement yet; it is the contract that changes must preserve or deliberately update through trace artifacts.

## Current Goal

The near-term goal is a deterministic, inspectable order that can grow toward MUGEN/IKEMEN behavior:

```txt
input sample
  -> command buffer
  -> State -1 routing
  -> state/controller evaluation
  -> pause/hitpause accounting
  -> physics and position
  -> combat/collision resolution
  -> hit/guard/get-hit transitions
  -> animation/frame advance
  -> effects/audio/events
  -> snapshot/trace/evidence
```

Any change to this order can affect compatibility. It needs a trace gate when behavior changes.

## Per-Frame Phases

| Phase | Owns | Notes |
| --- | --- | --- |
| 1. Input sample | keyboard/touch/gamepad adapters | Converts device state into runtime commands. |
| 2. Command buffer | CMD/input runtime | Updates directional/button history and command activation. |
| 3. State -1 routing | compatibility runtime | Evaluates commands/triggers that can change current state. |
| 4. State controller pass | runtime/controller systems | Executes supported controllers and records executed controllers/typed ops. |
| 5. Pause/hitpause pass | pause system | Handles player pause, hit pause, superpause, and frame-step constraints. When a source actor is allowed to advance during `movetime`, active target bindings are re-applied after that actor's movement/presentation pass so the bound target follows the source offset in the bounded two-actor path. |
| 6. Physics pass | physics system | Applies velocities, gravity, floor/bounds, and partial Common1 behavior. |
| 7. Collision/combat pass | combat system | Resolves bounded projectile-vs-projectile `projpriority` trade/cancel after projectile advance, including winner-priority decrement before later same-tick projectile clashes, then Clsn1/Clsn2 contact, HitDef, guard/reject/override/reversal; direct/projectile contact can set bounded state-local `Move*`/`Proj*` trigger markers, and projectile contact also respects the bounded `projmisstime` cooldown set after each `projhits` contact. |
| 8. Get-hit/state transition pass | state/runtime systems | Applies target state routing, custom-state ownership, Common1 entries. |
| 9. Animation pass | animation runtime | Advances anim time/frame unless paused/frozen. |
| 10. Effects/audio pass | world/effect/audio systems | Ticks projectile/helper/explod/afterimage/palfx/sound/envshake records. |
| 11. Snapshot pass | `MatchWorld`/runtime | Emits renderer-independent snapshot and trace evidence. |

## Determinism Requirements

For a given fixture, script, seed/default random source, and initial state:

- command activation should be repeatable
- controller execution order should be repeatable
- collision results should be repeatable
- snapshots should checksum the same unless behavior intentionally changes
- trace drift must be documented in the work item or artifact note

## Hit Pause And Command Buffer

Current behavior is partial. The desired contract is:

- device input can still be sampled during pause/hitpause when MUGEN semantics require it
- command buffer history should remain explicit in traces
- attack/contact freeze should not hide final state transitions
- hitpause behavior must be fixture-gated before parity is claimed

## Target Bind During Pause

Current behavior is bounded and synthetic-gated. If `SuperPause` leaves the source actor in `movetime`, the source can still execute movement controllers such as `PosAdd`; active `TargetBind` offsets are then applied again before the paused snapshot is emitted. The required `synthetic-imported-targetbind-pause.json` artifact proves a real `HitDef` target record, typed `TargetBind`, typed `SuperPause`, source `matchPauseAdvances`, and world-visible bound `targetLinks` for this path.

## Common1 / Get-Hit Order

The current Common1 path is fixture-backed partial support.

Required evidence should identify:

- initial contact frame
- whether `p2stateno` was attacker-owned or default defender-owned
- state owner and sprite owner
- states entered and controllers executed
- hit fall vars such as velocity, yaccel, fall, down recover, recovery time
- final recovery/control state

Official KFM recovery completion requires a trace naming `5000 -> 5030 -> 5050 -> 5100 -> 5101 -> 5110 -> 5120 -> 0` or a more exact fixture-specific chain.

## Guard Order

Current guard behavior is useful but not parity. A bounded auto guard-start bridge now runs after the attacker advances and before the defender advances, so imported defenders holding back can enter defender-owned Common1-style `120 -> 130` when `InGuardDist` is true before contact. A bounded guard-end bridge can then leave through `140` and return to idle/control after `InGuardDist` is no longer true.

The remaining exact guard-state gate must prove:

- held-back input or guard trigger
- bounded `InGuardDist` proximity evidence before contact
- automatic guard-start and guard-end ordering against real fixture state flow
- guardflag eligibility
- parsed `guard.dist` where present, with bounded fallback distance
- guard damage/stun/push
- state/anim route where supported
- unsupported guard-state params
- final control/recovery constraints

## Trace Gate Requirements

Runtime changes require trace updates when they affect:

- input or command routing
- State -1 evaluation
- trigger expression results
- controller execution
- custom-state ownership
- combat outcome
- hitpause/pause/superpause
- actor/effect lifecycle
- animation frame timing
- final actor snapshots

Minimum closeout:

```bash
pnpm test
pnpm qa:trace
```

Also run `pnpm qa:smoke` when the change is visible in the browser.
