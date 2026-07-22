# Helper PlayerPush RedirectID research

Date: 2026-07-22

Status: implemented, focal verified

## Question

What bounded source-backed contract should add Helper `PlayerPush` RedirectID
without widening collision scheduling claims?

## Sources reviewed

- [MUGEN 1.1 PlayerPush reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#playerpush)
- Pinned IKEMEN-GO commit `4aa0ba38f851c52549ba182310e9e53361cd472a`:
  [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3532-L3577),
  [controller runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10575-L10596),
  and [frame reset](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11622-L11635).

## Findings

- MUGEN documents a one-tick boolean push-check flag. It does not document
  `RedirectID`, priority, or team policy.
- IKEMEN reads `redirectid` before the policy fields. Its runtime resolves the
  destination first, evaluates each policy expression in the caller, and
  writes the result to the destination character.
- IKEMEN resets push priority and team policy each eligible frame. The current
  port resets first-generation Helper policy before State -4 when that Helper
  can advance.
- The port already compiles static PlayerPush RedirectID and routes local
  dynamic policy through typed bounds dispatch. Its Helper redirect materializer
  cannot produce a PlayerPush operation, so a redirect fails before lease
  writeback. It also has no current-tick marker to retain a policy received by
  a Helper that advances later in the actor order.

## Decision

Materialize PlayerPush against the Helper caller before the verified redirect
lease. Tag a destination Helper with the current runtime tick, preserve the
incoming enabled/priority/team policy across that Helper's reset, and let the
existing resource lease write the selected root or Helper state back. Keep the
existing local player-type admission and body-push geometry unchanged.

## Limits

This work does not claim exact CharList pair order, root-to-root dynamic
PlayerPush semantics, hitpause reset order, nested Helper ownership, collision
geometry, corner interpolation, rendering, rollback, or full MUGEN/IKEMEN
parity.

## Result

Implemented in `54c1e980`. The generic Helper redirect materializer now
produces static or caller-evaluated PlayerPush operations before the verified
resource lease. Redirected destination Helpers receive a current-tick marker,
then restore the incoming enabled, priority, and team policy after their
one-frame reset when they advance later in the same tick.

## Focused evidence

The grouped T371-T372 command passes 5 files and 1034 tests:

`pnpm exec vitest run src/tests/BoundsControllerSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeTraceGatePresets.test.ts`

It includes the required Helper-to-root PlayerPush trace artifact. The broad
TypeScript, complete Vitest, trace aggregate, build, and boundary batch stays
queued by the current accumulation policy.
