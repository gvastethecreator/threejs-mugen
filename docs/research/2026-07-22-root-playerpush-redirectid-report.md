# Root PlayerPush RedirectID research

Date: 2026-07-22

Status: implemented, focal verified

## Question

What narrow source-backed change makes root `PlayerPush` RedirectID preserve
caller-owned dynamic policy across a later root's one-frame reset?

## Sources reviewed

- [MUGEN 1.1 PlayerPush reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#playerpush)
- Pinned IKEMEN-GO commit `4aa0ba38f851c52549ba182310e9e53361cd472a`:
  [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3532-L3577),
  [controller runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10575-L10596),
  and [frame reset](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11622-L11635).

## Findings

- MUGEN documents only the one-tick boolean push check; RedirectID, priority,
  and team policy are IKEMEN extensions.
- IKEMEN selects the redirect target first but evaluates policy expressions in
  the original controller context, then writes them to the selected character.
- The port's root active-controller path resolves the redirect target with the
  caller context. Dynamic PlayerPush reaches generic dispatch without a typed
  operation, so destination variables can affect the result.
- Root frame advance resets PlayerPush, priority, and team policy before the
  destination executes active controllers. The existing deferral mechanism
  already protects later-root Width, Height, Depth, and PosFreeze writes, but
  excludes PlayerPush.

## Decision

Materialize a redirected PlayerPush operation with the caller runtime and
caller evaluation context before dispatch. Treat PlayerPush like PosFreeze for
later-root deferral, reuse the verified root redirect resolver, and retain the
current telemetry owner. Add focused imported runtime and required trace
evidence that proves the dynamic caller policy reaches the later root.

## Limits

This work does not prove helper routes, exact CharList ordering, hitpause
semantics, collision geometry, corner behavior, renderer output, rollback,
upstream differential parity, or complete MUGEN/IKEMEN compatibility.

## Result

Implemented in `3f5f4a5`. Root active-controller PlayerPush now materializes
the typed policy against the caller before it resolves a delayed destination
dispatch. The existing deferred root constraint queue now also protects
PlayerPush, so a later target root resets before it receives the selected
one-frame policy.

## Focused evidence

The grouped T371-T372 command passes 5 files and 1034 tests:

`pnpm exec vitest run src/tests/BoundsControllerSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeTraceGatePresets.test.ts`

The required imported root trace proves caller-owned dynamic VarSet/PlayerPush
telemetry and destination push disablement after a later root reset. The broad
TypeScript, complete Vitest, trace aggregate, build, and boundary batch stays
queued by the current accumulation policy.
