# T352 - Helper preserve round reset

Status: resolved at bounded round-reset retention scope
Date: 2026-07-20
Feature commit: `3d61ad92`

## Question

Can the runtime retain only Ikemen Helpers marked `preserve` during a round
reset while removing transient effect actors and keeping Helper serials unique?

## Source evidence

The pinned Ikemen-GO system clears player assets before a new round. Its helper
loop destroys each Helper when `preserve` is false and keeps it otherwise;
`forceDestroy` overrides that filter. The round-start backup also copies
Helpers because `preserve` affects restoration. The current slice maps the
normal round-reset filter and force-clears the explicit full reset/intro-skip
paths.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- Added typed effect-store reset options with `preserveHelpers`.
- Kept only Helpers with `preserve === true` during the opted-in reset.
- Removed Explods and Projectiles during that reset.
- Retained the Helper serial counter and rebuilt run-order allocation from
  surviving Helpers.
- Passed the option through `RuntimeMatchResetWorld`.
- Enabled retention only for `ikemen-go` round/Turns reset paths in
  `PlayableMatchRuntime`; explicit match reset and intro skip still destroy all
  Helpers.

## Verification

- Focused EffectActor/reset/Playable tests: `3` files, `348/348` passed.
- `pnpm qa:trace`: `634/634` artifacts passed, `600` required and `34`
  optional; all existing checksums stayed stable.
- `pnpm typecheck`: passed with the TypeScript 7 toolchain.
- `pnpm build`: passed with `326` transformed modules.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed for the feature write-set.
- Full Vitest is deferred to the next multi-feature checkpoint; the previous
  T351 full baseline was `239/239` files and `2601/2601` tests.
- Browser smoke is deferred because this slice changes runtime reset state
  without changing renderer or Studio surfaces.

## Claim ceiling

This closes bounded Helper retention and serial continuity through the current
Ikemen round-reset contract. It does not claim exact RoundStartBackup state
restore, F4 behavior, child Explod/Projectile retention, nested Helper
restoration, team/Turns lifecycle parity, or complete MUGEN/IKEMEN parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
- `.scratch/external/Ikemen-GO/src/system.go` (`clearPlayerAssets`,
  `RoundStartBackup.Save`, and force-destroy paths)
