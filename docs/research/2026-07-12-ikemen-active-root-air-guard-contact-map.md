# IKEMEN Active-root Air Guard Contact Map

Date: 2026-07-12

## Question

What bounded source-backed path can prove one explicit IKEMEN Tag active root in state type A guards a direct A-only contact without claiming generic aerial movement or broad air-guard parity?

## Primary Sources

- [Elecbyte CNS format: HitDef guardflag](https://www.elecbyte.com/mugendocs/cns.html): `A` is the air guard flag; `M` means high-or-low, not air.
- [Elecbyte CNS format: StateDef type](https://www.elecbyte.com/mugendocs/cns.html): state type `A` represents the air state and drives hit reactions.
- [Elecbyte Tutorial 4: guardflag](https://elecbyte.com/mugendocs/tutorial4.html): `MA` can be guarded while standing, crouching, or in the air, while `HA` admits standing or jumping guard.
- Pinned [IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10670-L10707): the `HF_A` guard branch matches only `ST_A`.

## Local Ownership Map

- `RuntimeGuardDistanceWorld` calls state-sensitive guard eligibility before latching any direct threat; its A result already depends on `guardflag = A` and state type A.
- `PlayableMatchRuntime.refreshActiveRootDirectGuardDistance` refreshes this direct-only latch for every active-motion root without a ground-only filter.
- `RuntimeAutoGuardStartWorld` delegates selected start state to `RuntimeGuardWorld`. `RuntimeGuardWorld.defaultGuardStartStateNo` returns `132` for A when `120` is unavailable; focused `GuardSystem` coverage proves that selection.
- `RuntimeGuardWorld.defaultGuardHitStateNo` returns `154` before `150` for A; default guard fixture states already model `154 -> 155` air-guard hit behavior.
- The current synthetic `withAutoGuardStartStates` emits ground `120 -> 130`, where state `130` is S. It cannot prove an A-only route and must not be reused for that claim.

## Decision

Use a fixture-only A start branch with state `132` available and state `120` absent, so existing auto-guard selection enters `132`. Pair it with existing default `154/155` air guard-hit fixture states, an imported command route into state type A, direct active-root latch, delayed direct contact, and normal root admission/combat.

No generic guard, active-root scheduling, admission, or combat mutation is required. Any geometry needed to keep the fixture in its A state must be declared fixture-only and cannot become a generic jump/movement claim.

## Evidence Limits

- Exact Common1 air guard-start source/timing is not established by this map.
- Air landing, movement physics, projectile/helper threats, pause, effects, audio, target precedence, team lifecycle, and full parity remain blocked.
- The selected cut proves only state-type-A guard classification and existing ownership composition.
