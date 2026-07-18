# Ticket 262: explicit HitFlag state-type admission

- Status: planned
- Date: 2026-07-18
- Scope: bounded direct HitDef admission for explicit `HitFlag H/L/A/D/M`
- Depends on: T261 shared hitflag admission, `CharacterRuntimeState.stateType`,
  root hit admission, direct combat resolution, equal-priority preparation, and
  helper direct combat
- Research: [`docs/research/2026-07-18-hitflag-state-type-admission.md`](../../../../docs/research/2026-07-18-hitflag-state-type-admission.md)
- Previous implementation: T261 `c88fd483`
- Source contract: pinned IKEMEN GO commit `044da72008b8ba13caf7b0f820526ce16e955fb3`

## Question

Can explicit direct HitDef hitflags enforce the source-defined target state
types without changing omitted/default hitflag behavior or pretending that
projectile/reversal admission already shares the direct model?

## Bounded contract

- For an explicit hitflag, require the target's runtime `stateType` to match
  the source hitflag admission: `S -> H`, `C -> L`, `A -> A`, `L -> D`.
- Treat `M` as the source shorthand for both standing and crouching targets.
- Evaluate this state-type rule before the existing `F`, `-`, and `+` rules,
  preserving the source order and exposing a typed rejection reason.
- Preserve omitted hitflags exactly as they behave today; default `MAF`
  inference remains a separate contract.
- Apply the shared result across root admission, regular direct resolution,
  equal-priority preparation, and helper direct resolution.

## Out of scope

Default hitflag inference, projectile-owned HitDef metadata, reversal
admission, exact `hittmp`/`acttmp` timing, guard-state controller ordering,
custom-state breadth, ZSS/Lua, rollback/netplay, and full MUGEN/IKEMEN parity.

## Acceptance evidence

- Pure predicate tests cover `H`, `L`, `A`, `D`, `M`, mismatches, compact and
  comma-delimited strings, omitted flags, and ordering with fall/plus/minus.
- Root, direct, equal-priority, and helper tests cover rejection without
  mutation and preserve existing T260/T261 behavior.
- TypeScript 7, build, boundary, trace, and diff-hygiene gates are grouped at
  the next large checkpoint.
- Browser smoke is N/A unless runtime changes affect visible surfaces.

## Claim ceiling

This ticket closes only explicit direct HitDef state-type admission. It does
not close defaults, projectiles, reversals, complete `hittmp`/`acttmp`, or full
MUGEN/IKEMEN compatibility.
