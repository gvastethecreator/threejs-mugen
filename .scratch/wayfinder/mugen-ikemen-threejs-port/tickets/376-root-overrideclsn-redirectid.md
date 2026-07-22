# T376 Root OverrideClsn RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can an IKEMEN root direct dynamic `OverrideClsn` group, index, and rectangle
to a verified later root, preserve caller evaluation, and retain the override
through the target's one-frame collision reset?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L7112-L7131)
  reads `redirectid` before expression-capable `group`, `index`, and `rect`.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L15356-L15410)
  resolves the target first, evaluates group/index/rect in the caller, scales
  the rectangle for the target, and writes the target override list.

## Local finding

The root active-side-effect route evaluated raw OverrideClsn values through a
caller resolver, but wrote a later root before its actor-constraint reset.
That reset clears `clsnOverrides`. Deferring the old resolver would also allow
later controllers to change caller variables before evaluation.

## Quality contract

A verified imported root may redirect static or dynamic OverrideClsn values to
one live root. Dynamic values resolve in caller context before a later target
resets its one-frame collision state. Textual groups retain their authored
meaning, unavailable destinations fail closed through the current IKEMEN
redirect resolver, and target-localcoord scaling remains in the collision
world.

## In scope

- Root-to-root active-controller OverrideClsn RedirectID.
- Caller-side typed materialization for dynamic group, index, and rect.
- Later-root collision reset ordering and required trace proof.

## Out of scope

Exact collision geometry, CharList scheduling, Helper routes, nested
ownership, hitpause/reset parity, renderer output, rollback, upstream
differentials, and full MUGEN/IKEMEN parity.

## Result

Root active-controller OverrideClsn now materializes dynamic caller values
before verified target dispatch. A target that advances later receives the
override after its one-frame constraint reset. The typed resolver recognizes
authored textual groups before dynamic numeric fallback.

## Verification

- Runtime feature commit: `865af29b`.
- Focused collision-override/imported-match/trace batch: `3/3` files and
  `933/933` tests pass.
- `git diff --check` passed before the feature commit.
- TypeScript, full Vitest, trace aggregate, build, and boundary guards remain
  intentionally deferred to the next grouped runtime checkpoint.
