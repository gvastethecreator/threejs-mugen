# T353 Helper clsnproxy root box extension

Status: resolved at bounded root collision-box scope

Feature commit: `37a9e8bc`

## Source evidence

Pinned local Ikemen-GO source:

- `.scratch/external/Ikemen-GO/src/char.go`, `flattenClsnProxies`, gathers a
  character and active proxy descendants into a flat traversal.
- `.scratch/external/Ikemen-GO/src/char.go`, `clsnCheck`, rejects proxy actors
  as direct participants, then checks every parent/proxy combination.
- `.scratch/external/Ikemen-GO/src/char.go`, `clsnCheckSingle`, reads each
  actor's current collision boxes and sends their position, facing, scale, and
  angle to the overlap routine.
- The same source applies the proxy rule in `projClsnCheck` for projectile
  collision.

Official source: [Ikemen-GO `src/char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9946-L10285)

## Delivered

- Added a typed `RuntimeHelperCollisionSystem` that reads the current Helper
  frame's `clsn1` or `clsn2` boxes without mutating animation data.
- Traversed only active `clsnProxy` descendants of the requested root, with
  root ownership, disabled/standby, destroyed, and cycle guards.
- Converted each proxy box from world coordinates into the root's local
  collision space, preserving child and parent facing.
- Routed the result through the `ikemen-go` PlayableMatchRuntime combat bridge.
  Root `clsn2` defense and selected `clsn1` queries now include active proxy
  boxes; `size` boxes remain root-only.
- Kept the existing direct Helper admission rule: proxy Helpers do not attack
  or receive direct combat as independent actors.

## Verification

- Focused Vitest: `5` files, `349/349` tests passed.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; no trace checksum changed.
- `git diff --check` passed for the feature write-set.
- Full Vitest remains deferred in this slice. The latest full baseline from
  T351 is `239/239` files and `2601/2601` tests.
- Browser smoke remains deferred because the change stays inside runtime
  collision resolution and has no new browser-facing surface.

## Claim ceiling

This ticket proves current-frame active proxy descendants can extend a root's
local collision boxes in the explicit IKEMEN runtime path. It does not prove
exact Ikemen scale or angle semantics, `ownclsnscale`, render overlays,
normal root attack-box extension, nested or redirected ownership beyond the
bounded traversal, helper-versus-helper breadth, external-engine differential
parity, compatibility-score movement, or complete MUGEN/IKEMEN collision
parity.
