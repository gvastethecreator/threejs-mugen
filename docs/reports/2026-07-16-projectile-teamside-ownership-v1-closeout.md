# Projectile TeamSide Ownership/v1 Closeout

Date: 2026-07-16
Wayfinder ticket: 205
Implementation commit: `3769dd17 feat(runtime): model projectile teamside ownership`

## Task state

Completed for the bounded IKEMEN Projectile ownership slice. This is a
runtime/compiler contract, not a claim of full projectile or team parity.

## Source boundary

The [IKEMEN changed-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
documents `teamside` as changing the side from which a HitDef is treated as
attacking and describes the Projectile case where a different side can hit
the owner and interact with the owner's other projectiles. The
[IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
is the controller-surface reference used for the existing typed operation
path. The [Elecbyte controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
remains the MUGEN baseline; this behavior is kept explicitly IKEMEN-scoped.

## Delivered

- Added normalized `teamSide?: 1 | 2` to `ProjectileControllerOp`,
  `ModifyProjectileControllerOp`, `RuntimeProjectile`, and projectile effect
  snapshots.
- Lowered static `teamside` values and resolved dynamic
  `ModifyProjectile teamside` through the existing caller-context resolver.
- Preserved fail-closed behavior for invalid values and owner-local behavior
  when the parameter is omitted or equal to the owner side.
- Added owner self-contact scheduling only for explicit opposite-side
  projectiles.
- Added deterministic pairwise same-owner projectile clashes when at least one
  projectile opts into the opposite side, while preserving the existing
  cross-owner clash path.
- Kept the change inside compiler/projectile/combat/match-interaction
  boundaries; no renderer, score, rollback, netplay, or RedirectID behavior
  was inferred.

## Verification

- Focused batch:
  `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/ProjectileSystem.test.ts src/tests/ProjectileCombatSystem.test.ts src/tests/MatchInteractionSystem.test.ts --testTimeout=30000`
  -> 4 files, 95/95 tests passed.
- TypeScript 7 check:
  `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- `git diff --check` passed. The command emitted only pre-existing CRLF
  normalization warnings for dirty roadmap documents.
- Browser/renderer smoke: N/A; no visible Three.js surface changed.
- Full repository suite and full compatibility trace: deferred to the next
  multi-slice checkpoint, per the current batch strategy.

## Quality audit

The main regression risks were ownership inversion, accidental self-contact
for ordinary projectiles, non-deterministic same-owner pair iteration, and
invalid dynamic values mutating state. Compiler assertions, runtime resolver
coverage, snapshot assertions, self-contact tests, same-owner clash tests,
and match scheduling assertions cover those boundaries. No score movement is
justified: this is one independent IKEMEN behavior slice without broader team,
Projectile collision-type, or compatibility-corpus breadth.

## Still open

Projectile `RedirectID`, `ProjTypeCollision`, exact upstream ordering,
multi-root team remapping, helper/custom-state interactions, score, persistence,
rollback/netplay, renderer presentation, and full MUGEN/IKEMEN parity remain
open. The next implementation ticket must be selected and characterized in
Wayfinder before widening this boundary.
