# Projectile RedirectID lease/v1 closeout

Date: 2026-07-16
Wayfinder ticket: 207
Implementation commit: `80237610 feat(runtime): lease Projectile redirects`

## Task state

Completed for the bounded root active CNS Projectile creation slice. This is
not a claim of complete projectile, helper, or RedirectID parity.

## Source boundary

The [IKEMEN state-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29)
defines `RedirectID` as a general state-controller feature and warns that
processing order may limit individual controllers. The
[IKEMEN changed-controller reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)
documents the broader Projectile parameter and ownership surface but does not
publish a dedicated `Projectile RedirectID` ordering contract. This closeout
therefore records a bounded adapter based on the public general rule and the
repository's existing effect-store contract.

## Delivered

- Added typed `redirectPlayerIdExpression` lowering to `ProjectileControllerOp`.
- Rejected malformed Projectile RedirectID expressions at compile time while
  retaining runtime fail-closed behavior for uncompiled controller data.
- Routed root active CNS Projectile RedirectID through the synchronous live-root
  lease with empty candidate projection.
- Reused `RuntimeEffectSpawnWorld.spawnProjectile`, so the destination root
  owns the new effect store entry and its `ownerId`, `rootId`, `parentId`,
  sprite definition, position basis, and combat ownership.
- Preserved the existing local spawn path when RedirectID is omitted and
  blocked invalid destinations without creating an effect.
- Reused existing controller/operation telemetry without a new schema.

## Verification

- Affected batch:
  `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/EffectSpawnSystem.test.ts src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  -> 3 files, `307/307` tests passed.
- TypeScript 7 check:
  `pnpm exec tsc -p tsconfig.json --noEmit` passed.
- Diff hygiene:
  `git diff --check` passed for implementation and test files.
- Browser/renderer smoke: N/A; no visible Three.js surface changed.
- Full repository suite and full compatibility trace remain deferred to the
  next multi-slice checkpoint, matching the current batch strategy.

## Quality audit

The key risks were creating in the caller store, splitting owner/root/parent
identity, using the caller position when the destination actor should execute,
accepting malformed RedirectID, and changing local behavior. Compiler
assertions, destination-store/identity assertions, destination-relative
position evidence, invalid-target traces, existing local spawn coverage,
TypeScript, and the affected batch cover these boundaries. The exact engine
processing order and undocumented parameter evaluation rules are intentionally
not inferred from this slice.

## Score impact

No score movement is justified. This is one independent RedirectID creation
adapter and does not expand compatibility-corpus breadth or complete a broader
projectile/team category.

## Next open frontier

Characterize helper projectile ownership and `OwnProjectile` separately before
moving Projectile RedirectID into helper or State -1/global-state execution.
`ProjTypeCollision`, recursive redirects, exact processing order, score,
persistence, rollback/netplay, renderer presentation, and full MUGEN/IKEMEN
parity remain open.
