# IKEMEN ModifyHitDef Target State Research

Date: 2026-07-23

Status: closed in `cb21362e`.

## Source basis

The pinned IKEMEN-GO `modifyHitDef.Run` resolves one redirected character,
rejects a missing or reversal HitDef, and sends each non-RedirectID parameter
through `hitDef.runSub` on the active receiver.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8345)

The shared HitDef path writes target-state fields in this order:

1. `p1stateno` assigns the attacker's follow-up state.
2. `p2stateno` assigns the target state and sets `p2getp1state` to true.
3. An explicit `p2getp1state` assigns the final boolean route.

- [Target-state field assignments](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7625-L7631)

## Local mapping

`ModifyHitDefControllerOp` currently narrows static root fields into one
active normal move. `RuntimeHitDefControllerDispatchWorld.modify` preserves
the move object and contact memory. `RuntimeHitStateTransitionSystem` already
consumes `p1StateNo`, `p2StateNo`, and `p2GetP1State` after accepted direct
contact.

The T399 implementation follows the source assignment order at mutation time:
a supplied `p2stateno` sets local `p2GetP1State` to true, then a supplied
explicit `p2getp1state` replaces that default.

## Scope boundary

T399 accepts finite static numeric values only. State numbers use the local
nonnegative rounded boundary shared with active ModifyReversalDef state
fields. The slice covers root-to-root active normal HitDef mutation under
`ikemen-go`; dynamic expressions, Projectile and Helper receivers, timing,
teams, rollback, renderer effects, and full parity remain deferred.

## Audit and verification

- `ModifyHitDefControllerOp` lowers finite static state values and rejects
  dynamic, malformed, empty, and unsupported payloads.
- Runtime mutation retains the active move object and its contact memory.
  `p2stateno` sets the receiver-owned default before an explicit route value
  applies.
- Unit coverage proves the default and explicit order. The imported RedirectID
  route proves the active receiver retains all three fields.
- The focused compiler, HitDef, direct-combat, CombatResolver, reversal, and
  imported-match batch passes 6 files / 467 tests. `pnpm typecheck` passes on
  TypeScript 7; trace-script syntax and diff hygiene pass.

## Deferred

Dynamic expressions, source-exact state-number range behavior, Projectile and
Helper receivers, contact scheduling, teams, rollback/netplay, renderer work,
full Vitest, aggregate traces, production build, boundaries, and full parity
remain deferred. This focal runtime cut leaves the global checkpoint queued.
