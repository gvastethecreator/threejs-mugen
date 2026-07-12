# IKEMEN Active-root HitDef Execution

Date: 2026-07-12
Wayfinder: 115
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Decision

Promote direct `HitDef` authoring for structurally active P3-P8 roots before widening simultaneous priority. The current compiler, controller hook, move state, admission, resolver, target memory, contact memory, effect stores, snapshots, and traces are actor-keyed. The remaining capability block was the active-motion side-effect allowlist.

IKEMEN runs character CNS before global hit detection, orders reversal/HitDef candidates before applying results, and commits buffered HitDef getter ids during later character update. The local schedule now preserves that bounded shape: controllers, admission, direct mutation, contact commit.

Source:

- [global ReversalDef/HitDef/ID detection order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13886-L13931)
- [deferred HitDef getter commit](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12312-L12333)

## Contract

- Add only `hitdef` to active-motion side effects; standby retains none.
- Use one passive active P4 getter and nonlethal damage.
- Require exact `p3->p4` admission, one hit, immediate target id, committed getter id, and second-frame `already-hit` rejection.
- Keep P1/P2 standby in the oracle to exclude pair mutation.
- Version phase capabilities because active Tag roots now own direct combat.
- Do not claim simultaneous priority, team KO, shared resources, or broad effect lifecycle.

## Pressure

Independent review accepted the passive P3->P4 cut and identified plural priority as the next P1 risk. Its initial routing claim described HitDef generically as a side effect; local dispatch confirms the precise route is `RuntimeActiveSideEffectDispatchWorld` route `hitdef`, so the capability change belongs in `sideEffects`, not `runtimeControllers`.

## Claim Ceiling

Allowed: active P3-P8 CNS can author direct HitDef and execute the exercised ordered passive-root mutation with exact target/contact memory.

Blocked: simultaneous plural priority/trade/ReversalDef, Helper/Projectile/throws, team round/KO, shared resources, broad presentation/audio playback, rollback, or full IKEMEN parity.
