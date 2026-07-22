# T371 Helper PlayerPush RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can a current first-generation IKEMEN Helper execute `PlayerPush` through a
verified `RedirectID`, evaluate dynamic parameters in the caller, and retain
the selected actor's one-frame push policy through the current Helper reset?

## Source evidence

- [MUGEN 1.1 PlayerPush reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#playerpush)
  defines one-tick push checking with `value`.
- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3532-L3577)
  accepts `redirectid`, `value`, `priority`, and `affectteam`.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10575-L10596)
  resolves the destination before evaluating caller expressions, then writes
  push enablement, priority, and team policy to that destination.
- Pinned [IKEMEN-GO frame reset](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11622-L11635)
  restores eligible player-type push flags and resets priority/team policy
  each non-hitpause frame.

## Local finding

Current Helpers execute local PlayerPush and typed static operations retain
`RedirectID`, but the generic Helper redirect materializer only handles
resources, TransformClsn, ScreenBound, and PosFreeze. A redirected PlayerPush
therefore fails before its verified lease can dispatch. A later Helper target
would also reset its one-frame policy before body-push projection.

## Quality contract

Artifact and user outcome: an eligible Helper can direct `PlayerPush` to one
verified live root or current first-generation Helper. Dynamic `value`,
`priority`, and `affectteam` resolve from the caller. A later Helper target
keeps the redirected one-frame policy after its reset, and unavailable
destinations fail closed.

## In scope

- Static and dynamic PlayerPush values and typed operation materialization.
- Current Helper-to-root and Helper-to-Helper RedirectID lease/writeback.
- Caller expression context and later-Helper reset preservation.
- Focused compiler, Helper, and imported runtime proof.

## Out of scope

Exact CharList pair order, root-to-root dynamic PlayerPush audit, hitpause
reset parity, nested Helpers, player-type admission changes, collision
geometry, corner interpolation, renderer proof, upstream differentials,
rollback, and full parity.

## Result

Commit `54c1e980` adds PlayerPush materialization to the existing Helper
redirect path. Static and dynamic policy is resolved in the Helper caller,
then the verified lease writes one selected root or current first-generation
Helper. A destination Helper that advances later retains its incoming
enabled/priority/team policy through the current reset.

## Verification

The grouped T371-T372 focused suite passes 5 files and 1034 tests, covering
compiler and bounds behavior plus Helper, imported match, and required trace
artifacts. The broad TypeScript, full Vitest, trace aggregate, build, and
boundary checkpoint remains deliberately deferred until more runtime slices
accumulate. Browser smoke is N/A for this runtime-only batch.
