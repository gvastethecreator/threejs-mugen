# Issue 325 — direct HitDef guardpoints expressions

Status: closed-bounded (T751, 2026-08-12)

## Scope

Carry fresh direct `HitDef guardpoints` expressions through typed IR and the
existing caller-context dispatch seam for root and Helper-owned activations.
Keep the authored value separate from the defender's mutable guard-points
resource and expose it through the existing accepted guard contact metadata.

## Delivered

- Direct `HitDef guardpoints` accepts static and caller-context dynamic integer
  expressions; malformed expressions fail closed. Existing live
  `ModifyHitDef guardpoints` support remains intact.
- Root dispatch resolves `var(...)` against the caller rather than the
  redirected receiver's variables. Helper activation uses the helper caller
  context through the same scalar resolver.
- Accepted grounded guards retain the resolved authored value for
  `GetHitVar(guardpoints)` without mutating the defender's current resource.
- Focused compiler, runtime, Helper, and direct-combat coverage passes.
- Required trace
  `synthetic-imported-hitdef-dynamic-guardpoints` passes independently with
  checksum `4c227a07` and final checksum `c67b5998`; it proves
  `VarSet -> HitDef -> guard contact -> GetHitVar(guardpoints)=19` and the
  dedicated branch.

## Verification

- Focused compiler/runtime/Helper/direct-combat tests pass (`6/6` selected
  guardpoints cases; neighboring suites remain green).
- `pnpm run typecheck` passes.
- Required trace test passes independently.
- `git diff --check` passes for the delivered changes.
- Aggregate `pnpm qa:trace` retains the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing-target-link
  blocker; this new artifact is green independently.

## Claim boundary

This is a bounded direct root/Helper caller-context slice for authored
`guardpoints` metadata. It does not claim fresh default/reset parity, live
ModifyHitDef expansion beyond the existing path, Projectile/ModifyProjectile,
guard-resource clamp/timing, teams, rollback, or full M.U.G.E.N/Ikemen parity.

Commits: `3c68582e` (runtime/compiler/tests), `48d7db3c`
(trace/evidence), and the roadmap documentation commit are separate for
auditability.
