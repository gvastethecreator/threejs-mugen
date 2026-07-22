# Global Checkpoint After T383

Date: 2026-07-22

Head: `38d62678`

Feature chain: `86cf7040` (T381), `0f30280e` (T382), `739ac163` (T383),
and `38d62678` (typed operation registry repair).

## Audit scope

This checkpoint audits the accumulated root `ModifyHitDef` and
`ModifyReversalDef` RedirectID slices. It covers compiler operations, active
side-effect dispatch, receiver mutation, imported runtime traces, TypeScript
typing, build output, and static ownership boundaries.

## Result

Verdict: passed for the bounded T381-T383 contracts.

- T381 changes static `damage` or `damage,guardDamage` on one verified active
  normal HitDef without replacing its move or contact state.
- T382 changes static `reversal.attr` on one verified active reversal in place.
- T383 adds static first local `pausetime`, `p1stateno`, `id`, and
  `attack.depth` to that receiver-owned reversal mutation. The core trace
  proves changed depth admits counter contact before changed state and target
  metadata take effect.
- The delayed full typecheck found the operation omitted from the `ControllerOp`
  union and two hook-set fixture callbacks. `38d62678` repairs that type-only
  debt and adds typed hook coverage.

## Evidence

- Focused T383 coverage: 7 files / 1051 tests passed.
- TypeScript 7 typecheck passed after the type repair.
- Full Vitest passed: 241 files / 2706 tests.
- Trace QA passed: 650 artifacts, 616 required and 34 optional.
- Production build passed: 329 transformed modules, 2123.17 kB JavaScript
  before gzip, 531.19 kB gzip output.
- Repository boundary, redirect-boundary, and diff-hygiene checks passed.

## Residual observations

The full suite emits two known jsdom canvas `getContext` notices. The production
build emits the existing large-chunk advisory for the 531.19 kB gzip JavaScript
bundle. Neither gate failed. Browser smoke remains N/A because this batch
changes no renderer or Studio surface.

## Claim ceiling

Allowed: static root-to-root mutation through caller-evaluated RedirectID for
the documented active HitDef and active ReversalDef subsets under explicit
`ikemen-go`.

Blocked: `p2stateno`, `p2getp1state`, reversal guard fields, other inherited
HitDef fields, dynamic payloads, Helpers, custom states, teams, source-exact
scheduler and hitpause behavior, renderer work, rollback/netplay, score
movement, and full MUGEN/IKEMEN parity.

## Next frontier

Audit a new isolated active-controller family only after its source contract,
local state model, and receiver ownership boundary are explicit. The current
ModifyReversalDef family must keep its remaining p2-state and guard-field work
separate.
