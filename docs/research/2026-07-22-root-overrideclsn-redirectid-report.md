# Root OverrideClsn RedirectID Report

Date: 2026-07-22

## Scope

This report covers only current imported IKEMEN root-to-root OverrideClsn
RedirectID execution. It does not claim broader collision or engine parity.

## Primary-source findings

Pinned IKEMEN-GO compiler source reads `redirectid` before the
expression-capable `group`, `index`, and `rect` fields in
[`overrideClsn`](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L7112-L7131).

Pinned runtime source resolves the destination before it evaluates those
fields with the caller. It then applies caller-to-target local scale and writes
the destination collision override list in
[`overrideClsn.Run`](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L15356-L15410).

## Local audit

`RuntimeActorConstraintWorld.resetFrameConstraints` clears `clsnOverrides`.
The active root route therefore lost an early write to a target that advanced
later. Its old resolver also held caller expressions until dispatch, which
could observe source variables after unrelated later controllers changed them.

## Implementation

- `resolveRuntimeCollisionOverrideControllerOperation` resolves dynamic
  group/index/rect into a typed operation from caller state.
- Root OverrideClsn dispatch materializes that operation before it queues a
  later target through the existing reset deferral.
- Static group names resolve before numeric expression fallback, so `Clsn1`,
  `Clsn2`, `Size`, and `None` retain their authored meaning.
- The required trace adds one target Clsn2 box and gates the destination
  `clsn2Count`, `OverrideClsn`, and `collision:overrideclsn` evidence.

## Evidence

Focused verification passes `3/3` files and `933/933` tests:

```text
pnpm exec vitest run src/tests/RuntimeCollisionOverrideSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeTraceGatePresets.test.ts
```

`git diff --check` passed before feature commit `865af29b`.

## Claim boundary

Allowed: current imported root-to-root OverrideClsn RedirectID, caller-owned
dynamic group/index/rect evaluation, later-root reset deferral, existing
localcoord scale, telemetry, and the required trace.

Blocked: exact source scheduler order, collision geometry, Helper and nested
routes, hitpause/reset parity, renderer output, rollback, upstream
differentials, and full MUGEN/IKEMEN parity.
