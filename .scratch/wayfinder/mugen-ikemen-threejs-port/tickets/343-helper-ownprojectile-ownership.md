# T343 - Helper ownprojectile ownership

Status: resolved at bounded explicit ownership scope  
Date: 2026-07-20
Feature commit: `a908b104`

## Question

How should a Helper-created Projectile move from root ownership to Helper
ownership while the runtime keeps one bounded effect store for combat and
presentation?

## Source evidence

The pinned Ikemen-GO runtime stores a per-Helper `ownProjectile` flag. A
Helper can own Projectiles when the flag is true; otherwise the root character
owns them. Projectile creation writes the effective owner ID, while
`NumProj`, `Proj*Time`, and `ModifyProjectile` select active Projectiles by
that owner ID. The same ownership check also blocks those queries for a Helper
that cannot own Projectiles.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- `Helper` compilation now carries static `ownprojectile` values and supported
  scalar expressions.
- `ikemen-go` dispatch resolves dynamic ownership in the live actor context
  and fails closed when the expression cannot be resolved.
- An explicitly owning Helper gives its newly spawned Projectile the Helper
  serial as `ownerId`, while `rootId`, parent linkage, store placement, and
  combat traversal remain stable.
- Helper projectile count, contact-time, cancel-time, and modification
  queries use owner identity for explicit ownership and reject explicit false.
- Root `NumProj` and `ModifyProjectile` world queries filter by root owner so
  Helper-owned Projectiles remain available to the combat store without being
  counted or changed by the root.
- Projectile team-side resolution falls back to `rootId` when the logical
  owner is a Helper serial.
- Profiles outside `ikemen-go` strip this field. An omitted field keeps the
  existing parent-based Helper route so the historical bounded corpus remains
  stable during the migration.

## Verification

- Focused Vitest passed: 3 files / 133 tests.
- Full Vitest passed: 239 files / 2593 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with 326 transformed modules.
- `pnpm qa:trace` passed: 633/633 artifacts, 599 required and 34 optional.
- `pnpm check:boundaries` passed.
- `git diff --check` passed; only the pre-existing roadmap CRLF warnings remain.
- Browser smoke is deferred because this slice changes runtime ownership only;
  no renderer, Studio, or browser route changed.

## Claim ceiling

This closes the explicit static/dynamic `ownprojectile` ownership path for the
tested `ikemen-go` Helper and Projectile runtime boundary. The temporary
undefined-field compatibility route, nested Helper ownership, projectile
index/order parity, rollback/netplay, renderer lifecycle proof, and complete
MUGEN/IKEMEN parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- `.scratch/external/Ikemen-GO/src/char.go` (`canOwnProjectiles`, projectile
  creation, `projTimeTrigger`, `getMultipleProjs`)
- `.scratch/external/Ikemen-GO/src/bytecode.go`
  (`helper_ownprojectile`, `HelperVar(ownprojectile)`)
