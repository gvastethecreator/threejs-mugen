# T379 Root ReversalDef RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can a root static `ReversalDef` activate the existing bounded reversal state on
another verified root through `RedirectID` without widening the current dynamic
ReversalDef field semantics?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2297-L2328)
  compiles `redirectid` before the required `reversal.attr` and shared HitDef
  parameters.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
  resolves the destination first, resets that destination HitDef, evaluates
  parameters in caller context, then finalizes destination state.

## Local finding

`ReversalDef` uses a separate side-effect dispatcher rather than the generic
runtime-controller route. Its static typed operation omits `redirectid`; the
dispatcher consequently activates the caller even when authored redirect data
exists. Local dynamic ReversalDef field evaluation has no typed materializer,
so redirecting dynamic fields would be unsafe to claim.

## Quality contract

Under explicit `ikemen-go`, a static bounded `ReversalDef` can resolve a live
root by `RedirectID`, activate that root with its own current attack box, and
record receiver-side ReversalDef telemetry. A redirect with an untyped dynamic
operation fails closed instead of reading target context.

## In scope

- Root-to-root static active-controller `ReversalDef RedirectID`.
- Static RedirectID compilation and target-owned reversal activation.
- Existing bounded `reversal.attr`, pause, state, id, and attack-depth fields.

## Result

Resolved in `d5b8777a`. Static `RedirectID` is preserved by compilation and
the ReversalDef side-effect dispatcher resolves one verified root, uses that
root's current Clsn1 box, and records receiver-side telemetry. A redirected
controller without a static typed operation blocks before target mutation.
The required imported trace reverses the matching root HitDef through the
receiver. The grouped T378-T379 focal batch passes 5 files / 1014 tests;
broad typecheck, complete Vitest, trace aggregate, build, and boundary gates
remain queued for the next runtime checkpoint.

## Out of scope

Dynamic ReversalDef fields, full shared HitDef parameter surface,
`reversal.guardflag` semantics, Helpers, custom states, teams, source-exact
HitDef reset/finalization timing, hitpause scheduling, rollback, renderer
behavior, score movement, and full MUGEN/IKEMEN parity.
