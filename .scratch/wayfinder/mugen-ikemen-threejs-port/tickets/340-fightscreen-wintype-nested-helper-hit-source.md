# T340 - FightScreen nested Helper hit source

Status: resolved at bounded nested-helper direct/projectile scope
Date: 2026-07-20

## Source evidence

The pinned Ikemen-GO runtime keeps Helper parent/root identity and inherited
player ownership while resolving HitDef and Projectile hit context. The local
port already verifies live Helper ancestry for redirected target-life causes;
this ticket extends that same boundary to combat source metadata.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added `RuntimeHelperRootOwnershipResolver` as the shared strict ownership
  callback for Helper direct combat and Projectile source resolution.
- Propagated the callback through `RuntimeMatchCombatBridgeWorld` and the
  post-fighter runtime input.
- `ikemen-go` now supplies `PlayableMatchRuntime.verifiedRootForHelper`, so a
  nested Helper can carry root-owned HitDef/GetHitVar metadata only after its
  live parent chain passes the existing identity checks.
- Nested Helper Projectiles use the same verified ancestry gate while retaining
  the Helper serial as source actor identity.
- MUGEN 1.1 and unspecified profiles retain their prior first-generation
  admission behavior.

## Verification

- `pnpm exec vitest run src/tests/RuntimeHelperCombatSystem.test.ts src/tests/RuntimeCombatResolutionSystem.test.ts src/tests/RuntimeMatchCombatBridgeSystem.test.ts --testTimeout=30000`
  passed: 3 files / 43 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed.
- No renderer or Studio UI file changed; browser smoke is deferred.

## Claim ceiling

This closes nested Helper source identity for bounded direct HitDef and
Helper-parented Projectile hit metadata in the production combat bridge. It
does not claim nested target/resource redirects, Helper-victim result causes,
reversal/reflection ownership, exact source-slot arbitration, direct screenpack
proof, or complete MUGEN/IKEMEN result parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
