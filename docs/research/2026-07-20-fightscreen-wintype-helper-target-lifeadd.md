# FightScreen Helper TargetLifeAdd cause

Date: 2026-07-20
Ticket: T334
Status: implemented at bounded first-generation Helper target scope

## Research result

The upstream controller resolves a redirected memory owner, then applies
`TargetLifeAdd` to the target records held by that owner. The source actor and
the life-zero receiver can differ, so the runtime needs pre-life evidence plus
an identity check for both sides.

## Implementation

Helper target dispatch now forwards selected-target life snapshots through the
existing lifecycle context. The production runtime verifies first-generation
Helper ownership with root, immediate parent, and inherited player identity.
It admits a root victim when the source is the local verified Helper or a
verified root destination. A Helper-to-Helper destination remains excluded.

The resource operation still runs for excluded paths. Only the round-result
classification stays closed until the source contract is complete.

## Evidence

- `PlayableMatchRuntime.test.ts` covers a Helper-to-root redirected KO and a
  Helper-to-Helper fail-closed result.
- Existing Helper and target dispatch coverage remains green.
- Focused result: 4 files / 349 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.
- Renderer/UI paths did not change, so visual smoke is deferred.

## Open work

The next boundary is separate auditing for `TargetRedLifeAdd`, guard points,
and dizzy points. Nested Helper ancestry, reversals, exact target order, and
full parity remain open.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
