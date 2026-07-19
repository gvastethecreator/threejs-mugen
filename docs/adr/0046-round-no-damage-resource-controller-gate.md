# ADR 0046: Round No-damage Resource-controller Gate

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

T279 added the source-mapped `roundNoDamage` combat-admission boundary, but
imported state controllers could still write life, meter, guard, dizzy, and red
life during that close. IKEMEN guards those mutations at character-resource
setters, while the local runtime has a shared controller executor and separate
helper/target routes.

## Decision

- Inject `roundNoDamage` through `RuntimeControllerDispatchWorld` into the
  existing controller evaluation context.
- Enforce the bounded resource policy in `StateControllerExecutor`, preserving
  controller/operation telemetry and allowing `CtrlSet`.
- Keep life/red-life writes available for dead-actor cleanup, and conservatively
  block guard/dizzy writes because local enable flags are not yet modeled.
- Propagate the policy through imported active, State -1 setup, pause,
  standby, active-motion, and deferred-input controller paths.
- Leave helper/effect owners and Target resource controllers as separate
  contracts until their ownership and redirect evidence is complete.

## Consequences

Imported players and roots cannot alter the covered combat resources through
state controllers during the bounded close interval, while visual/runtime
maintenance and controller telemetry continue. The public snapshot and trace
schema remain unchanged. The policy is deliberately narrower than full
post-round resource parity and does not alter direct-combat or target-resource
ownership.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeControllerDispatchSystem.ts`,
  `src/mugen/runtime/RuntimeResourceSystem.ts`,
  `src/mugen/runtime/StateControllerExecutor.ts`, and
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Regression coverage: `src/tests/RuntimeControllerDispatchSystem.test.ts`
  and `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `f5023017`.
- Sources: [pinned `lifeSet`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8569-L8575), [pinned power guard](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8626-L8650), and [pinned point/red-life guards](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8653-L8706).
