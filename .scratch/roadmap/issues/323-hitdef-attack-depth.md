# Issue 323 — HitDef `attack.depth` expressions

Status: closed-bounded (T749, 2026-08-12)

## Scope

Carry direct `HitDef attack.depth` through typed IR and runtime, including
caller-context static, mixed and dynamic one/two-component values. Extend live
Ikemen `ModifyHitDef attack.depth` for root/RedirectID and Helper callers with
component-preserving mutation: a single component keeps the active sibling,
and omission is a no-op. Existing combat-depth admission consumes the active
pair; render Z remains independent.

## Evidence

- Product: `689a02c5` (`feat(mugen): support HitDef attack depth expressions`).
- Tests: `076d1f5f` covers compiler, fresh/modify runtime and Helper caller
  context; focused attack-depth suites pass.
- Durable trace: `synthetic-imported-hitdef-dynamic-attack-depth-golden`
  proves `VarSet -> HitDef -> accepted hit`, caller `var(0)=4,var(1)=9`,
  target link, and the guarded combat-depth branch. Trace/final checksums are
  `7ef8aace` / `170aacf6`.
- Evidence: `4ddbd63e` (`test(evidence): gate direct HitDef attack depth`).
- Aggregate status: `pnpm qa:trace` still stops on the pre-existing
  `synthetic-imported-helper-bind-to-target-redirect` missing-target-link gate;
  the T749 artifact passes independently.

## Source contract

Pinned Ikemen-GO `149402f` compiles `attack.depth` as one or two float
expressions. Fresh HitDef evaluation duplicates a single component; live
`ModifyHitDef` writes authored components only and preserves omitted siblings.
M.U.G.E.N 1.1 documents fresh HitDef `attack.depth`; the live ModifyHitDef
extension is an Ikemen source-compatibility claim.

## Explicit limits

Fresh default/resource derivation, Projectile/ModifyProjectile breadth,
ReversalDef breadth, negative/overflow and exact depth/localcoord timing,
render projection, teams, rollback and full M.U.G.E.N/Ikemen parity remain
open. A required live ModifyHitDef trace is not claimed by this issue; its
caller/preservation behavior is covered by focused tests.
