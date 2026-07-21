# Helper Depth constraints and RedirectID research

Date: 2026-07-21

Status: implemented and batch-verified

## Sources reviewed

The source of record is the pinned Ikemen-GO commit
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

- [Depth compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6310-L6346): accepts `redirectid`, `edge`, `player`, and the `value` fallback.
- [Depth runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14465-L14516): resolves the destination before mutation, evaluates expressions in the caller, and uses `destination.localcoord / caller.localcoord`.
- [Depth setters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7696-L7717): `setDepth` uses base depth plus the controller pair; `setDepthEdge` stores the edge pair for the frame.
- [RedirectID resolver](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4825-L4842): an unavailable player id returns no destination before the controller body runs.

## Port decision

Use the existing `RuntimeActorConstraintWorld` for depth mutation and reset.
Give `RuntimeHelper` a cloned `combatDepth` state seeded from the sprite-owner
constants and helper spawn Z. Keep helper-local state, snapshots, body-push
projection, and resource-lease writeback on that same state.

Apply the destination/caller local-coordinate ratio at the shared depth
boundary. Extend the root redirect deferral used by Width and Height so a depth
write cannot be erased when the destination root has not reset for the frame.

## Claim boundary

Allowed after evidence: current IKEMEN root and first-generation Helper
`Depth edge|player|value`, current depth-bound clamping, and verified RedirectID
writeback with caller evaluation and target scale.

Blocked: Helper Z kinematics, ScreenBound/StageBound controllers, nested
Helpers, exact source scheduler order, visual proof, upstream differential
proof, score movement, and full compatibility claims.

## Result

Implemented in `35f9fb0f`. Current IKEMEN Helpers clone `combatDepth` from
sprite-owner depth constants and spawn Z, reset it before State -4, apply local
Depth edge/player/value modes, and synchronize current combat depth to their Z
position. Current stage depth bounds clamp that state. RedirectID uses caller
evaluation, destination-localcoord scale, verified resource lease/writeback,
and fail-closed resolution. Root Depth redirects also defer until the target
root has reset its one-frame constraints.

The combined T365-T367 batch passes focused `6/6` files / `448/448` tests,
TypeScript 7, `qa:trace` `636/636` artifacts, build with `329` modules,
both boundary guards, and diff hygiene. Full Vitest and browser smoke remain
deferred.
