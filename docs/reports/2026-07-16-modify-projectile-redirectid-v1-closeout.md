# ModifyProjectile RedirectID lease/v1 closeout

Date: 2026-07-16
Wayfinder ticket: 206
Implementation commit: `e5a32bd4 feat(runtime): lease ModifyProjectile redirects`

## Task state

Completed for the bounded root active CNS projectile-mutation slice. This is
not a claim of complete projectile or RedirectID parity.

## Source boundary

The [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
defines `RedirectID` as an optional state-controller feature and warns that
processing order can limit individual controllers. The
[IKEMEN changed-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
provides the broader projectile parameter and ownership surface, but no
dedicated `ModifyProjectile RedirectID` ordering contract. The implementation
therefore reuses the repository's proven lease and keeps this adapter bounded.

## Delivered

- Added typed `redirectPlayerIdExpression` lowering to
  `ModifyProjectileControllerOp`.
- Rejected malformed redirect expressions at compile time while preserving
  the existing fail-closed runtime fallback for uncompiled controller data.
- Routed root active CNS `ModifyProjectile RedirectID` through the synchronous
  destination lease with exact live-root identity and empty candidate scope.
- Kept dynamic `ModifyProjectile` numeric resolution in the caller context;
  only projectile store ownership changes to the resolved root.
- Preserved local mutation when RedirectID is omitted and blocked invalid or
  unavailable destinations without mutating caller or destination stores.
- Mirrored bounded controller/operation telemetry for imported redirected
  roots without introducing a new telemetry schema.

## Verification

- Affected batch:
  `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/EffectSpawnSystem.test.ts src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  -> 3 files, `304/304` tests passed.
- TypeScript 7 check:
  `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- Diff hygiene:
  `git diff --check` passed for implementation and test files.
- Browser/renderer smoke: N/A; no visible Three.js surface changed.
- Full repository suite and full compatibility trace remain deferred to the
  next multi-slice checkpoint, matching the current batch strategy.

## Quality audit

The key risks were mutating the caller store instead of the destination,
evaluating dynamic values in the destination context, silently accepting
malformed RedirectID, and changing local or legacy behavior. The compiler
assertion, caller-context runtime fixture, destination-store assertion, local
effect coverage, invalid-target trace, TypeScript check, and affected suite
cover these boundaries. The implementation does not claim `Projectile` spawn
RedirectID, State -1/global-state coverage, helper-owned projectile stores,
`OwnProjectile`, `ProjTypeCollision`, recursive redirects, score,
rollback/netplay, or renderer parity.

## Score impact

No score movement is justified. This is one independent RedirectID mutation
adapter and does not expand compatibility-corpus breadth or complete any
broader projectile/team category.

## Next open frontier

Characterize `Projectile` spawn RedirectID and helper/projectile ownership
separately before implementation. State -1/global-state ordering, exact
upstream processing order, `OwnProjectile`, `ProjTypeCollision`, score,
persistence, rollback/netplay, renderer presentation, and full MUGEN/IKEMEN
parity remain open.
