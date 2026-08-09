# Issue 250 — Helper-owned ModifyHitDef down.velocity

- Status: `closed-bounded`
- Lane: `R1 direct contact physics`
- Priority: `P1`

## Objective

Extend the closed root-owned T675 `ModifyHitDef down.velocity` seam to a
Helper-owned controller. A Helper caller must be able to mutate the active
normal HitDef's X/Y/Z components in its own caller context while preserving
omitted live components and the active target ownership.

## Source gate

The pinned Ikemen runtime evaluates `ModifyHitDef` through the active
HitDef's `runSub` path regardless of whether the controller is executed by a
player or Helper. The same one-to-three `down.velocity` components are
evaluated before the live HitDef is updated; fresh default/finalization is not
re-entered by ModifyHitDef.

Sources to pin before implementation:

- Ikemen `149402f`: `compiler_functions.go:2009-2010,2286-2293`
- Ikemen `149402f`: `bytecode.go:7725-7732,8339-8355`
- Ikemen `149402f`: Helper/controller ownership and lying-hit velocity/GetHitVar consumers
- M.U.G.E.N 1.1 documents the base `down.velocity` fields, but not
  `ModifyHitDef`; this issue is therefore Ikemen-only for the live Helper path

## Acceptance contract

- Helper-authored `ModifyHitDef` resolves dynamic X/Y/Z in the Helper caller
  context and mutates the active normal HitDef once.
- One component replaces X and preserves Y/Z; two replace X/Y and preserve Z;
  a third dynamic component replaces Z; omission is a no-op.
- A real accepted lying hit exposes the final vector through physics and
  `GetHitVar`, with Helper/root/target ownership recorded in one required trace.

## Claim ceiling

Do not claim M.U.G.E.N live `ModifyHitDef`, root RedirectID parity beyond the
already closed T675 path, fresh inheritance, partial `n` syntax, Projectile or
ModifyProjectile, exact landing/Common1 timing, localcoord/facing equivalence,
teams, rollback, or full Helper parity.

## Closure evidence

- Helper-owned runtime coverage passes `62/62` in the Helper and telemetry
  suites; the focused T676 trace test passes `1/1`.
- Helper caller variables resolve a one-, two-, or three-component mutation;
  omitted live X/Y/Z components remain intact and the accepted lying hit
  exposes `3/-8/3` through physical velocity and `GetHitVar`.
- Required trace:
  `synthetic-imported-helper-modifyhitdef-dynamic-down-velocity-golden`.
- Trace checksum: `d2a053cf`; final checksum: `1e67b5c3`.
- Aggregate trace gate passes `749/749` artifacts (`715` required,
  `34` optional); the full suite passes `3735/3735` tests across `328` files,
  typecheck passes, and the `363`-module build passes.

## Next bounded slice

T677 closes Helper-owned live `ModifyHitDef air.velocity` X/Y
component-preserving mutation; T678 closes Helper-owned live
`ModifyHitDef airguard.velocity` X/Y and issue 252 records its evidence.
T679 is source-mapped but unclaimed.
