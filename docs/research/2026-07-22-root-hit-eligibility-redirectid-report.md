# Root HitBy/NotHitBy RedirectID Report

Date: 2026-07-22

## Scope

This report covers the current imported IKEMEN root-to-root legacy
`value`/`value2` HitBy and NotHitBy subset. It does not claim complete
hit-eligibility or engine parity.

## Primary-source findings

Pinned IKEMEN-GO compiler code reads `redirectid` for both controllers before
it reads shared HitBy parameters in
[`hitBy` / `notHitBy`](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L112-L129).

Pinned runtime code resolves the target with `getRedirectedChar` before it runs
the shared controller body. That body evaluates `time` and slot data with the
caller and writes the redirected character's hit-by slots in
[`hitBy.Run` / `notHitBy.Run`](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4929-L5007).

## Local audit

The local root runtime-controller redirect family covered resources, bounds,
collision transforms, and player push, but not HitBy/NotHitBy. Local dynamic
fallback evaluated `time` only at controller execution, so a redirected route
needed a caller-side typed operation before dispatch.

## Implementation

- `HitEligibilityControllerOp` now retains an optional compiled RedirectID
  expression.
- `resolveRuntimeHitEligibilityControllerOperation` creates typed legacy
  slots from caller state and controller context.
- Root runtime dispatch resolves live IKEMEN destinations for both controller
  types and materializes dynamic slots before it applies the existing
  HitDefense path to the receiver.
- Dynamic operation telemetry now records local and redirected HitBy/NotHitBy
  operations through the common dispatch boundary.
- The required imported trace sends a caller-authored dynamic NotHitBy duration
  to P2 and proves the matching P1 HitDef rejects without damage.

## Evidence

Focused verification passes `4/4` files and `994/994` tests:

```text
pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/HitDefenseSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeTraceGatePresets.test.ts
```

`git diff --check` passed before feature commit `37ab9baf`.

## Claim boundary

Allowed: current imported root-to-root HitBy/NotHitBy RedirectID, caller-owned
dynamic `time`, existing legacy two-slot values, destination telemetry, and
the required reject trace.

Blocked: IKEMEN new syntax, exact attr grammar and slot priority/decay order,
source scheduling, Helpers/custom states, teams, hitpause, rollback,
upstream differentials, and full MUGEN/IKEMEN parity.
