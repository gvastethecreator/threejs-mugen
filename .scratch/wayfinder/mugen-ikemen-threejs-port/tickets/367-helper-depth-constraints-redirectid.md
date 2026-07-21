# T367 Helper Depth constraints and RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can a current IKEMEN Helper own one-frame `Depth` state and route local or
verified `RedirectID` depth mutations through the existing constraint and
resource-lease boundaries without losing local-coordinate scale or reset order?

## Source evidence

The pinned Ikemen-GO compiler accepts `edge`, `player`, `value`, and
`redirectid` for `Depth`. Its runtime resolves the redirected character first,
evaluates controller values in the caller, applies
`destination.localcoord / caller.localcoord`, and routes `player`, `edge`, or
`value` to the character depth setters. Those setters reset from the character
base depth and record the one-frame depth flags. The source route uses the
generic character resolver, so a supported Helper destination must pass through
the same verified destination boundary in this port.

- [Ikemen-GO Depth compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6310-L6346)
- [Ikemen-GO Depth runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14465-L14516)
- [Ikemen-GO depth setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7696-L7717)
- [Ikemen-GO RedirectID resolver](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4825-L4842)

`Depth` is an IKEMEN-scoped controller in this task. This ticket makes no
MUGEN 1.1 Depth claim.

## Local finding

The root constraint world already models one-frame depth size and edge state,
but `RuntimeHelper` has only a visual `pos.z`; it has no `combatDepth` state,
so Helper dispatch cannot apply the typed controller and helper combat/body
push snapshots cannot consume its depth. Root `Depth RedirectID` also lacks the
same target-localcoord scale and reset-order protection now used by Width and
Height.

## Quality contract

Artifact and user outcome: current IKEMEN Helper depth controllers change only
the intended current actor or verified redirect destination, reset after one
frame, preserve caller evaluation, and remain visible to current combat and
body-push state.

Mission mode: change.

In scope: current first-generation Helper depth initialization from the sprite
owner constants and spawn Z, local `Depth edge|player|value`, current stage
depth-bound clamping, RedirectID resource leases/writeback, caller-to-target
localcoord scale, root redirected-depth scale/reset ordering, telemetry, and
fail-closed resolution.

Out of scope: Helper Z movement controllers, ScreenBound or StageBound
controller support, nested/parent Helper ownership, exact CharList order,
renderer/camera proof, source differentials, rollback/netplay, score movement,
and full MUGEN or IKEMEN parity.

## Evidence target

- Focused compiler and actor-constraint coverage for typed and scaled Depth.
- Focused Helper lifecycle coverage for local dynamic modes, reset, snapshots,
  RedirectID writeback, and rejected legacy profile execution.
- Imported root and Helper routes with mismatched local coordinates proving
  redirected target state and deferred root reset behavior.
- Batch focused tests, TypeScript, traces, build, boundary guards, and diff
  hygiene after the implementation round.

## Result

`35f9fb0f` gives current IKEMEN Helpers cloned one-frame `combatDepth`
state. The spawn boundary seeds it from sprite-owner depth constants and spawn
Z, Helper frame advance resets it before State -4, and local
`Depth edge|player|value` reaches current depth-bound clamping, snapshots,
and current combat/body-push state. Verified Helper RedirectID routes retain
caller evaluation, destination-localcoord scale, resource lease/writeback, and
fail-closed resolution. Root Depth redirects now use the same scale and target
frame-reset deferral as Width and Height.

This does not claim MUGEN 1.1 Helper Depth support.

## Verification

The T365-T367 batch passes focused `6/6` files / `448/448` tests,
TypeScript 7 typecheck, `qa:trace` `636/636` artifacts (`602` required,
`34` optional), build with `329` modules, both boundary guards, and diff
hygiene. Full Vitest and browser smoke remain deferred for this runtime-only
batch.
