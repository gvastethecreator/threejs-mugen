# FightScreen same-root resource RedirectID cause

Date: 2026-07-20
Ticket: T332
Status: implemented at bounded same-root resource scope

## Research result

The pinned Ikemen-GO path evaluates `RedirectID` and the resource expression
on the caller, then calls `lifeAdd` or `lifeSet` on the redirected character.
The destination receiver owns the life-zero result branch. `Char.lifeSet`
requires a player root, so a redirected resource must retain destination
state-owner identity while proving that the caller and destination share the
same root.

## Implementation

Root active and State -1 resource dispatch now records a life-zero suicide
cause for a same-root `RedirectID` target and uses its state owner when
classifying ownership. Helper resource dispatch carries the pre-operation life
through the existing redirected-operation hook. The production runtime admits
the Helper path only when the destination is the caller root and the Helper is
owned by that root.

The resource still applies for cross-root and helper destinations. Those paths
remain fail closed for root win-type attribution because their source and
receiver contract needs a separate model.

## Evidence

- `PlayableMatchRuntime.test.ts`: active root, state-entry root, same-root
  Helper, and cross-root Helper cases.
- Focused result: 3 files / 321 tests passed.
- TypeScript 7 typecheck passed.
- `git diff --check` passed.
- Renderer/UI paths did not change, so visual smoke is deferred.

## Open work

The next boundary is `TargetLifeAdd` and related target-resource dispatch. The
port still needs explicit target-memory, redirected actor, source-root,
reversal, redlife, guard, dizzy, and team ownership evidence before it can
extend result attribution.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
