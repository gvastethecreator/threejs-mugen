# IKEMEN Active-root Target Lifecycle Research

Date: 2026-07-12
Wayfinder: 110
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

What target ownership must be promoted before an admitted P3-P8 contact can safely mutate runtime state?

## Answer

Two independent boundaries are missing. Existing target memory and bindings are actor-local and already handled by generic `RuntimeTargetWorld`, but normal and paused match orchestration advances only P1/P2 and resolves only the pair opponent. Separately, current hit routes remember targets immediately, while IKEMEN buffers successful non-projectile HitDef targets and commits them later in character update. Promote plural existing-target maintenance first; add deferred acquisition only after that schedule is stable.

## Source Facts

1. A successful non-projectile HitDef result appends the getter id to a target buffer before GetHitVars mutation: [IKEMEN hit result target buffer](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10815-L10835).
2. Character update later copies buffered HitDef-contact ids into the separate `hitdefTargets` list and clears that buffer, explicitly reducing processing-order errors: [IKEMEN deferred contact commit](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12312-L12333). The live CNS `targets` list is updated immediately and separately.

## Local Audit

| Surface | Current owner | Gap |
| --- | --- | --- |
| Storage | Every fighter owns `targets`, `targetBindings`, and `bindToTarget`; `RuntimeTargetWorld` methods are actor-generic. | No storage alias remains. |
| Normal aging | `RuntimeMatchInteractionWorld.advance` calls target advance for P1 then P2. | P3-P8 memory never ages. |
| Binding application | The same world applies both binding directions with one pair opponent. | P3-P8 cannot resolve exact root subjects or anchors. |
| Pause | `RuntimePausedMatchWorld` advances only the selected moving pair actor. | Preserve current pause semantics until plural pause scheduling is specified. |
| Acquisition | Direct/projectile/helper combat calls `remember` immediately. | No upstream-style deferred HitDef target buffer/commit. |
| Evidence | Registry and trace snapshot actor-local target refs and bindings. | No actor-scoped plural maintenance schedule proof. |

## Selected Cut: Wayfinder 111

- Extend post-fighter target maintenance with a deterministic authoritative-root actor list only for explicit Tag normal ticks.
- Advance each eligible root once, then resolve existing TargetBind and BindToTarget against a complete exact-id root candidate roster.
- Keep direct/projectile/helper target acquisition unchanged and pair-owned.
- Keep pause/hitpause behavior unchanged in this cut.
- Emit actor-scoped schedule evidence and require no new contacts, targets, effects, or behavior checksum changes in the active-root fixture.

## Adversarial Audit

- Widening combat before target maintenance strands P3-P8 refs at age zero and leaves bindings unresolved.
- Treating each reserve as paired with P1/P2 loses exact cross-root identity and cannot represent team interactions.
- Combining maintenance with deferred acquisition makes ordering regressions hard to attribute.
- Applying bindings before all roots finish their actor phase introduces root-order-dependent positions. Maintenance belongs in the post-fighter phase.
- Pause movement is a separate scheduler policy; widening it here would exceed the evidence.

## Claim Ceiling

Allowed: source-backed split between plural target maintenance and deferred hit-target acquisition, with an implementation-ready first cut.

Blocked: active-root hit mutation, target acquisition parity, target-controller widening, throws, helper/projectile breadth, pause parity, round/HUD/audio, scores, or full parity.

## Implementation Outcome

Wayfinder 111 is resolved. `RuntimeMatchInteractionWorld` now accepts a deterministic maintenance roster while preserving P1/P2 defaults. Explicit Tag selects stable unique valid roots, ages each target store once, applies every TargetBind pass before every BindToTarget pass against complete exact-id candidates, and records `post-fighter:target-maintenance` per actor. Pause/hitpause and target acquisition remain unchanged. Wayfinder 112 owns deferred HitDef buffer/commit research.
