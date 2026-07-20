# T345 - HelperVar id and keyctrl

Status: resolved at bounded HelperVar field scope
Date: 2026-07-20

## Question

Which additional `HelperVar` fields can the current runtime expose with exact
local data and a strict profile boundary after `ownprojectile`?

## Source evidence

The pinned Ikemen-GO bytecode returns `helperId` for `HelperVar(id)` and the
first key-control flag for `HelperVar(keyctrl)`. The same dispatch returns
`undefined` outside a Helper and supports separate fields such as `ownpal`,
`preserve`, and `helpertype` that need their own runtime data contracts.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- `HelperVar` now consumes raw symbolic arguments so `id`, `keyctrl`, and
  `ownprojectile` do not collide with ordinary identifiers.
- `HelperVar(id)` returns the local Helper ID and `HelperVar(keyctrl)` returns
  the current key-control flag for an `ikemen-go` Helper.
- The same profile gate covers all three supported fields; legacy profiles and
  root contexts return the bounded false/zero result.
- Unsupported keys remain rejected during compile support classification and
  report as unsupported at runtime.

## Verification

- Focused Vitest passed: 3 files / 112 tests.
- `pnpm typecheck` is required at the accumulated checkpoint.
- Browser smoke is deferred because this slice changes expression/runtime
  evaluation only; no renderer, Studio, or browser route changed.

## Claim ceiling

This closes `HelperVar(id)`, `HelperVar(keyctrl)`, and
`HelperVar(ownprojectile)` for the tested current Helper context in
`ikemen-go`. `helpertype`, `ownpal`, `ownclsnscale`, `preserve`, redirected
reads, undefined-value fidelity, nested Helpers, and complete MUGEN/IKEMEN
parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/bytecode.go` (`OC_ex3_helpervar_*`)
