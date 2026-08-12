# Issue 324 — direct HitDef guard-distance bounds

Status: closed-bounded (T750, 2026-08-12)

## Scope

Implement the pinned Ikemen `guard.dist.width`, `guard.dist.height`, and
`guard.dist.depth` pairs for direct HitDef activation and live ModifyHitDef
mutation. Keep the legacy scalar `guard.dist` path intact, preserve omitted
live components, and feed the resolved envelope into the real direct
InGuardDist precontact latch.

## Delivered

- Typed IR/compiler accepts static, mixed, and caller-context dynamic pairs;
  malformed and over-arity values fail closed.
- Fresh direct HitDef resolves each authored dimension independently, clamps
  negative values to zero, and defaults missing dimensions to the bounded
  direct envelope. Live ModifyHitDef updates authored components only and
  preserves omitted siblings.
- Root/RedirectID and Helper dispatches expose the three pair keys through the
  existing caller-context integer-pair seam. Imported static HitDefs project
  bounds into their move metadata.
- Direct guard-distance checks expand X/Y around the world hitbox and check the
  combat-depth envelope before allowing the existing latch; scalar behavior is
  unchanged when no bounds are authored.
- Required trace
  `synthetic-imported-hitdef-dynamic-guard-distance-bounds-golden` passes
  independently with checksum `489865dc`; it proves six `VarSet` values,
  `HitDef`, direct InGuardDist latch, and no hit/guard contact.

## Verification

- Focused compiler/runtime/CombatResolver/guard-distance/trace tests pass.
- `pnpm run typecheck` passes.
- `git diff --check` passes for the delivered commits.
- Aggregate `pnpm qa:trace` remains blocked by the pre-existing
  `synthetic-imported-helper-bind-to-target-redirect` missing-target-link gate;
  the T750 artifact is green independently.

## Claim boundary

This is a bounded Ikemen direct guard-distance extension. MUGEN 1.1 documents
the legacy scalar `guard.dist`; Projectile bounds, ReversalDef, exact
hitdefpersist/reset semantics, full geometry/tick parity, teams, rollback, and
the inherited aggregate QA blocker remain separate work.

Commits: `194c0b6` (runtime/compiler/tests), `5b46f71c` (trace/evidence).
