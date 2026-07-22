# T372 Root PlayerPush RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can an IKEMEN root direct `PlayerPush` to a verified later root, evaluate
dynamic `value` and `priority` in the caller, and retain the destination's
one-frame policy after its frame reset?

## Source evidence

- [MUGEN 1.1 PlayerPush reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#playerpush)
  documents the one-tick push check controlled by `value`.
- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3532-L3577)
  accepts `redirectid`, `value`, `priority`, and `affectteam`.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10575-L10596)
  resolves the redirected character before it evaluates caller expressions and
  then writes the policy to that character.
- Pinned [IKEMEN-GO frame reset](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11622-L11635)
  restores the current-frame push policy before body-push work.

## Local finding

The active-root redirect path recognizes `PlayerPush`, but passes a dynamic
controller directly to the destination. That evaluates its expressions against
the destination runtime. It also only defers redirected `PosFreeze`; a later
root reset therefore removes a redirected PlayerPush policy.

## Quality contract

A verified imported root may redirect static or dynamic PlayerPush policy to
one live root. Dynamic policy resolves in the caller context, a later target
receives the write after its frame reset, and unavailable destinations fail
closed through the current redirect resolver.

## In scope

- Root-to-root active-controller PlayerPush RedirectID.
- Dynamic caller `value` and `priority`, plus static `affectteam`.
- Later-root reset ordering and typed telemetry/trace proof.

## Out of scope

Helper routing, helper-wide push scheduling, exact CharList ordering, hitpause
reset parity, nested Helpers, collision geometry, corners, rollback, renderer
proof, upstream differentials, and full MUGEN/IKEMEN parity.

## Result

Commit `3f5f4a5` materializes a root PlayerPush operation with the caller's
runtime/context before the redirected dispatch. Redirected PosFreeze and
PlayerPush now share the later-root deferral boundary, so target reset runs
before the selected one-frame policy is written.

## Verification

The grouped T371-T372 focused suite passes 5 files and 1034 tests. The new
imported root trace requires dynamic VarSet/PlayerPush telemetry and a later
P2 frame with PlayerPush disabled. The broad TypeScript, full Vitest, trace
aggregate, build, and boundary checkpoint remains deliberately deferred until
more runtime slices accumulate. Browser smoke is N/A for this runtime-only
batch.
