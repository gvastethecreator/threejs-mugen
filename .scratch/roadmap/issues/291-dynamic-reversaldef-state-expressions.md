# Issue 291 — Dynamic `ReversalDef` state expressions

Status: **closed-bounded** (T717, 2026-08-11)

## Contract

The direct/root `ReversalDef` path now preserves typed static values and
caller-context expressions for `p1stateno`, `p2stateno`, `p2getp1state`, and
`p2facing`. Each value is resolved once when the controller activates, using
the original caller context even when the reversal target is a redirected
runtime actor. State numbers are finite, truncated, and clamped to the local
non-negative state contract; boolean and facing values are fail-closed when
their expression is unresolved or non-finite.

`ModifyReversalDef` expressions, Helper-owned ReversalDef dispatch, projectile
reflection breadth, guard/override precedence, exact deferred tick ordering,
and full M.U.G.E.N/Ikemen parity remain outside this bounded slice.

## Upstream basis

- Ikemen GO pin `149402f`: `compiler_functions.go:2297-2329` reuses the
  HitDef parameter block for ReversalDef; `bytecode.go:7974-8020` evaluates
  caller expressions while the redirected receiver owns the active reversal;
  the contact path consumes the state and facing fields in `char.go` around
  the ReversalDef hit resolution.
- M.U.G.E.N 1.1 documents ReversalDef's HitDef-compatible state parameters
  (`sctrls.html:2656-2665`). The dynamic caller-resolution behavior is claimed
  as the pinned Ikemen compatibility slice.

## Evidence

- `RuntimeCompiler.test.ts` and `ReversalSystem.test.ts`: 166/166 focused
  assertions pass, including receiver-vs-caller variable separation and
  finite state/facing resolution.
- Required trace:
  `synthetic-imported-dynamic-reversal-golden`.
- Trace checksum `a4c41604`, final checksum `c2969b0f`.
- `pnpm qa:trace`: `808/808` artifacts (`774` required, `34` optional),
  zero failures.
- The trace proves VarSet → ReversalDef → reversal contact, resolves the
  caller expressions to p1 `888`, p2 `777`, p2 facing `-1`, and preserves the
  accepted reversal event with both actors in hit state.

## Explicit exclusions

`ModifyReversalDef` expressions, Helper-owned ReversalDef expressions,
Projectile/ModifyProjectile reflection, guard and HitOverride precedence,
negative/overflow int32 parity, exact hitpause/tick synchronization, custom
state breadth beyond the owner-backed route, teams, rollback, and full
M.U.G.E.N/Ikemen ReversalDef parity remain open.
