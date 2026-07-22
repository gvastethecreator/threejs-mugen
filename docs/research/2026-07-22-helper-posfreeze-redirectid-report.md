# Helper PosFreeze and RedirectID research

Date: 2026-07-22

Status: implemented, focused verified

## Question

What source-backed contract should unblock Helper `PosFreeze` with
`RedirectID` in the current TypeScript runtime?

## Sources reviewed

- [MUGEN 1.0 PosFreeze reference](https://www.elecbyte.com/mugendocs/sctrls.html#posfreeze)
- Pinned IKEMEN-GO commit `4aa0ba38f851c52549ba182310e9e53361cd472a`:
  [compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3311-L3328),
  [controller runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10227-L10250),
  and [movement](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L9690-L9712).

## Findings

- MUGEN documents one optional boolean `value`; omitted value freezes the
  player. It does not document axis parameters or RedirectID.
- IKEMEN compiles `redirectid` and `value`, defaults value to true, resolves
  the target first, then evaluates value in the caller. A false value does not
  set the destination freeze flag.
- IKEMEN's movement branch keeps X at its old position plus corner push while
  position freeze is set. The current port instead restores captured X/Y/Z
  after its local motion pass; that is a bounded projection, not an exact
  corner-push model.
- The port already has typed PosFreeze operations and a root start-position
  restore. Helper generic dispatch lacks entry, state copying, a start capture,
  and typed RedirectID materialization. Its static compiler operation also
  misses the supported RedirectID expression.

## Decision

Add Helper PosFreeze as one-frame bounds state, capture its start position
before controller and motion work, then restore it before existing stage
constraints. Add RedirectID to the typed PosFreeze operation, materialize a
caller-owned operation before a verified Helper resource lease, and retain an
incoming current-tick freeze across a later Helper target's reset. For a root
or an already-advanced Helper destination, restore from the match frame's
captured start position immediately after redirected dispatch.

## Limits

This work does not claim exact corner-push behavior, source scheduler order
beyond the current actor order, pause/hitpause behavior, nested Helpers,
spawned-this-tick target starts, rendering, rollback, or full MUGEN/IKEMEN
parity.

## Result

Implemented in `6bbeb6f7`. Current first-generation Helpers now carry
one-frame PosFreeze state through their runtime snapshot and writeback paths.
The static compiler retains `RedirectID`; generic Helper dispatch materializes
the typed operation from caller-owned values before the verified resource lease
writes the destination. Current match-frame capture restores root or already
advanced Helper destinations, while a destination Helper that runs later in the
frame keeps the incoming freeze through its reset.

The existing local axis extension remains bounded to the port. An explicit
false `value`, including `value = 0`, clears X, Y, and Z state.

## Focused evidence

- `pnpm exec vitest run src/tests/BoundsControllerSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`
  passes 4 files and 407 tests.
- `pnpm exec vitest run src/tests/RuntimeTraceGatePresets.test.ts -t "Helper PosFreeze RedirectID"`
  passes the required imported Helper-to-root trace gate.
- Diff hygiene passes before the feature commit.

The broad typecheck, complete Vitest suite, trace aggregate, build, and
boundary checks remain queued for the next grouped runtime checkpoint.
