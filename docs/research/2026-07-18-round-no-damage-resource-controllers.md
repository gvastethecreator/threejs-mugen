# Research: Round no-damage resource controllers

Date: 2026-07-18  
Ticket: [T280](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/280-round-no-damage-resource-controllers.md)

## Question

Which state-controller resource mutations must stop during the source-defined
`roundNoDamage` interval, and where can the local runtime enforce that policy
without hiding controller execution or claiming helper/target parity?

## Primary sources

- [Pinned IKEMEN-GO `roundNoDamage`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1652-L1659): the close interval is defined by `intro`, `over.hittime`, and `over.waittime`.
- [Pinned IKEMEN-GO `lifeAdd` and `lifeSet`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8528-L8575): `LifeAdd` delegates to `lifeSet`, and a living character cannot change life during `roundNoDamage`; a dead character still reaches clamp and cleanup behavior.
- [Pinned IKEMEN-GO power setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8626-L8650): power writes are rejected after the round has ended through `intro < 0`, which is broader than the local no-damage interval and therefore cannot be claimed as complete power parity here.
- [Pinned IKEMEN-GO dizzy, guard, and red-life setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8653-L8706): these setters guard their mutations with the source no-damage predicate, plus source-specific enable/alive conditions.

## Local findings

- `RuntimeControllerDispatchWorld` is the shared boundary for imported active
  controllers and State -1 setup controllers before `StateControllerExecutor`
  clones and returns runtime state.
- The executor already resolves typed/static and dynamic resource operations in
  one place, so a policy helper there avoids scattering round checks through
  every controller caller.
- The local `CharacterRuntimeState` does not yet model the source enable flags
  for dizzy, guard break, and red life. The bounded policy therefore blocks
  those writes conservatively while active, but does not claim those upstream
  enable predicates.
- `RuntimeMatchInteractionWorld` already suppresses direct combat, but it does
  not cover State -1, root, helper, or Target resource-controller writes. The
  dispatch flag must be threaded separately rather than reusing combat admission.

## Decision

Add an internal `roundNoDamage` dispatch hook and a centralized
`shouldBlockRuntimeResourceControllerForRoundNoDamage` policy. Preserve
controller and operation telemetry even when the executor skips the mutation.
Keep `CtrlSet` outside the lock, preserve dead-actor life/red-life cleanup, and
thread the flag through imported active, pause, standby, active-motion, and
State -1 setup routes in `PlayableMatchRuntime`.

Do not widen this slice to helpers, target-resource controllers, or the full
post-round `intro < 0` interval. Those require their own owner, redirect, and
team evidence before the claim can move.

## Claim ceiling

The local port proves a bounded player/root state-controller guard during the
mapped no-damage interval. It does not prove helper/effect VM ownership,
Target* resource suppression, source enable flags, team resource sharing,
exact controller order, full post-round power policy, release choreography, or
complete MUGEN/IKEMEN compatibility.

## Verification

- `pnpm exec vitest run src/tests/RuntimeControllerDispatchSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`: `2` files / `280` tests passed.
- `pnpm typecheck`: passed with TypeScript `7.0.2`.
- `git diff --check`: passed before the implementation commit.
