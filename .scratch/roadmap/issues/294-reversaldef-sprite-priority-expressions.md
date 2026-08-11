# Issue 294 — `ReversalDef` sprite-priority expressions

Status: **closed-bounded** (T720, 2026-08-11)

## Contract

Direct/root `ReversalDef` and root/RedirectID `ModifyReversalDef` now retain
`p1sprpriority` and `p2sprpriority` as typed static or caller-context
expressions. Fresh activation resolves both authored values once from the
active caller; a live ModifyReversalDef resolves only authored components and
preserves omitted components. Accepted reversal contact applies the resolved
P1 priority to the reverser and the P2 priority to the incoming attacker,
using the existing hit-definition sprite-priority telemetry path.

This is a bounded M.U.G.E.N/Ikemen compatibility slice. M.U.G.E.N documents
the paired sprite-priority behavior for HitDef; the pinned Ikemen source
reuses those HitDef parameters for ReversalDef and ModifyReversalDef. Helper-
owned ModifyReversalDef, Projectile/ModifyProjectile reflection, default
profile negotiation, renderer draw-order parity, exact contact timing,
teams, rollback, and full ReversalDef parity remain outside the claim.

## Upstream basis

- M.U.G.E.N 1.1 documents `p1sprpriority` and `p2sprpriority` as the paired
  drawing priorities used after a hit or guard in
  `referencias/.../1.1/sctrl.hitdef.html`.
- The pinned Ikemen GO source compiles the fields as integer expressions in
  `src/compiler_functions.go` around the `hitDefSub` ReversalDef block,
  evaluates them in caller context in `src/bytecode.go` around the
  `hitDef_p1sprpriority`/`hitDef_p2sprpriority` cases, and applies the
  resulting P1/P2 values in `src/char.go` during accepted contact.
- Ikemen `ModifyReversalDef` reuses the live HitDef parameter runner, so an
  omitted component is not rewritten while an authored expression is
  evaluated once for the redirected receiver.

## Implementation and evidence

- Core commit `0e5b9fc9` adds typed IR/compiler retention, caller-context
  integer resolution for fresh and live ReversalDef paths, component
  preservation, and focused runtime/compiler regression coverage.
- Focused compiler/runtime/integration coverage passes, including malformed
  expression rejection and redirected caller-context mutation.
- Required trace artifact:
  `synthetic-imported-ikemen-root-modifyreversaldef-sprite-priority-pair`.
- Trace checksums: `12eb3cbb` and final `616b336f`.
- Evidence commit `ab3ca12b` adds the fixture, durable actor-frame priority
  assertions, and QA registry entry. `pnpm typecheck`, `git diff --check`,
  and `pnpm qa:trace` pass; aggregate QA is `811/811` artifacts (`777`
  required, `34` optional).

## Explicit exclusions

Helper-owned ModifyReversalDef, Projectile/ModifyProjectile sprite-priority
semantics, fresh default profile negotiation, dynamic renderer ordering,
guard/override precedence beyond the accepted reversal route, negative or
overflow int32 parity, exact pause/contact tick synchronization, custom-state
breadth beyond the bounded root route, teams, rollback, and full
M.U.G.E.N/Ikemen ReversalDef parity remain open.
