# Issue 219 — Dynamic direct HitDef custom states

- Status: `closed-bounded`
- Lane: `R1 direct custom-state transition`
- Priority: `P1`

## Objective

Resolve root-owned direct HitDef `p1stateno`, `p2stateno`, and
`p2getp1state` expressions in caller context and feed the existing accepted
hit-only custom-state transition and ownership path.

## Source gate

M.U.G.E.N 1.1 documents P1 and P2 custom states after a successful hit. P2
uses P1 state and animation ownership by default when `p2stateno` is authored;
`p2getp1state = 0` keeps P2 ownership. Pinned Ikemen GO compiles all three as
expressions, evaluates P2 state before the ownership flag, and defaults absent
state numbers to `-1`.

Source symbols:

- M.U.G.E.N 1.1 `sctrl.hitdef.html:164-171`
- pinned Ikemen `compiler_functions.go:1864-1873`
- pinned Ikemen `bytecode.go:7634-7640`
- pinned Ikemen `char.go:754-755`, `10857-10868`, `11541-11543`,
  `12428-12435`
- local consumer `HitStateTransitionSystem.ts`
- local owner entry boundary `RuntimeStateEntrySystem.ts`

## Acceptance fixture

- Compile finite dynamic state and ownership expressions and reject malformed
  values.
- Resolve them once in the root caller/state-owner context at HitDef activation.
- Default `p2getp1state` to true when a valid P2 state resolves; explicit zero
  keeps P2 ownership.
- Prove accepted hit transitions P1 and P2 through existing state ownership,
  while guard and unavailable-state routes do not claim a transition.
- Add one required imported trace with VarSet-derived P1 `777`, P2 `888`, and
  P1-owned P2 custom-state evidence.

## Claim ceiling

This cut is root-owned direct HitDef only. Do not claim negative or explicit
`-1` coupling, int32 overflow parity, Helper, `ModifyHitDef`, Projectile,
ReversalDef, RedirectID/custom caller ownership, guard/HitOverride, exact
simultaneous tick order, throws/binds, teams, rollback, or full state parity.

## Closure evidence

- Root-owned direct HitDef resolves all three expressions once in caller
  context and retains the existing accepted-hit state/animation ownership path.
- Focused coverage proves P1 own-state `777`, P1-owned P2 custom state `888`,
  explicit P2 ownership, guard exclusion, and unavailable-state fail-closed.
- Focused coverage: 147 tests.
- Required trace: `synthetic-imported-hitdef-dynamic-state-transition`, checksum
  `fae17231`, final checksum `8157ef3e`.
- Typecheck, 363-module build, boundaries, redirect boundary, and 717/717
  traces pass. Full suite: 3572/3630 with the same 58 inherited missing-roster
  and stale-roster-expectation failures.
